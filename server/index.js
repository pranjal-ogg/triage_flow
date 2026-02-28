require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Hospital = require('./models/Hospital');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/triageflow')
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const nodeSchema = new mongoose.Schema({
  id: String,
  type: String,
  position: {
    x: Number,
    y: Number
  },
  data: {
    label: String,
    priority: String,
    riskScore: Number
  },
  style: mongoose.Schema.Types.Mixed,
  width: Number,
  height: Number,
  selected: Boolean,
  positionAbsolute: {
    x: Number,
    y: Number
  },
  dragging: Boolean
}, { _id: false });

const edgeSchema = new mongoose.Schema({
  id: String,
  source: String,
  target: String,
  label: String,
  type: String,
  animated: Boolean,
  style: mongoose.Schema.Types.Mixed,
  sourceHandle: String,
  targetHandle: String
}, { _id: false });

const flowchartSchema = new mongoose.Schema({
  name: String,
  createdAt: { type: Date, default: Date.now },
  nodes: [nodeSchema],
  edges: [edgeSchema],
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['published', 'draft'], default: 'published' },
  category: { type: String, default: 'General' },
  isExpert: { type: Boolean, default: false }
});

const Flowchart = mongoose.model('Flowchart', flowchartSchema);

// --- Middleware ---
// Verify JWT token on every protected request
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'No token provided' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

// Only allow doctors and admins
const doctorOnly = (req, res, next) => {
  if (req.user.role === 'nurse') 
    return res.status(403).json({ message: 'Doctors only' })
  next()
}

// Only allow admins
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Admins only' })
  next()
}

// --- Auth Routes ---
// --- Auth & Admin Routes ---
// HOSPITAL REGISTRATION (no auth needed)
app.post('/api/hospital/register', async (req, res) => {
  try {
    const { hospitalName, location, adminName, adminEmail, adminPassword } = req.body;
    
    // Check if user already exists
    let existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) return res.status(400).json({ message: 'Email already registered' });

    // Create hospital
    const hospital = new Hospital({ name: hospitalName, location });
    await hospital.save();

    // Create Admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const admin = new User({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      plainPassword: adminPassword,
      role: 'admin',
      hospitalId: hospital._id
    });
    await admin.save();
    
    res.json({ message: 'Hospital registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGIN (no auth needed)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({
      userId: user._id,
      role: user.role,
      hospitalId: user.hospitalId,
      name: user.name
    }, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.json({ token, role: user.role, name: user.name, hospitalId: user.hospitalId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET CURRENT USER (protected)
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE STAFF (admin only)
app.post('/api/staff/create', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    let existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      plainPassword: password,
      role,
      hospitalId: req.user.hospitalId
    });
    await newUser.save();
    
    res.json({
      message: 'Staff created successfully',
      staff: { name, email, role, plainPassword: password }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL STAFF (admin only)
app.get('/api/staff', authMiddleware, adminOnly, async (req, res) => {
  try {
    const staff = await User.find({ 
      hospitalId: req.user.hospitalId,
      role: { $ne: 'admin' }
    }).select('name email role plainPassword');
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE STAFF (admin only)
app.delete('/api/staff/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id, hospitalId: req.user.hospitalId });
    if (!user) return res.status(404).json({ message: 'User not found or unauthorized' });
    res.json({ message: 'Staff deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Flowchart Routes ---
app.get('/api/flowcharts', authMiddleware, async (req, res) => {
  try {
    const flowcharts = await Flowchart.find({ 
      $or: [{ hospitalId: req.user.hospitalId }, { isExpert: true }] 
    });
    res.json(flowcharts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/flowchart/:id', authMiddleware, async (req, res) => {
  try {
    const flowchart = await Flowchart.findById(req.params.id);
    if (!flowchart) return res.status(404).json({ error: 'Flowchart not found' });
    res.json(flowchart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/flowchart', authMiddleware, doctorOnly, async (req, res) => {
  try {
    const { name, nodes, edges, category, status } = req.body;
    const flowchart = new Flowchart({ 
      name, 
      nodes, 
      edges,
      category,
      status,
      hospitalId: req.user.hospitalId,
      createdBy: req.user.userId
    });
    await flowchart.save();
    res.status(201).json(flowchart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/flowchart/:id', authMiddleware, doctorOnly, async (req, res) => {
  try {
    const { name, nodes, edges, category, status } = req.body;
    const flowchart = await Flowchart.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.user.hospitalId },
      { name, nodes, edges, category, status },
      { new: true }
    );
    if (!flowchart) return res.status(404).json({ error: 'Flowchart not found or unauthorized' });
    res.json(flowchart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/flowchart/:id', authMiddleware, doctorOnly, async (req, res) => {
  try {
    const flowchart = await Flowchart.findOneAndDelete({ _id: req.params.id, hospitalId: req.user.hospitalId });
    if (!flowchart) return res.status(404).json({ error: 'Flowchart not found or unauthorized' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/flowchart/:id/navigate', authMiddleware, async (req, res) => {
  try {
    const { currentNodeId, selectedEdgeTarget } = req.body;
    const flowchart = await Flowchart.findById(req.params.id);
    if (!flowchart) return res.status(404).json({ error: 'Flowchart not found' });
    
    const nextNode = flowchart.nodes.find(n => n.id === selectedEdgeTarget);
    if (!nextNode) return res.status(404).json({ error: 'Next node not found' });
    
    res.json({ nextNode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Seeding ---
const seedExpertFlowcharts = async () => {
  try {
    const expertCount = await Flowchart.countDocuments({ isExpert: true });
    if (expertCount === 0) {
      console.log('Seeding expert flowcharts...');
      const fs = require('fs');
      const path = require('path');
      
      // We will parse the exact nodes/edges requested conceptually.
      const expert1 = {
        name: "Fever & Respiratory Assessment",
        category: "Fever",
        isExpert: true,
        nodes: [
          { id: '1', position: {x: 300, y: 50}, data: { label: "Does the patient have fever?"}, type: 'default',
            style: { background: '#fff', border: '2px solid #1e293b', borderRadius: '12px', padding: '16px', width: 180, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' } },
          { id: '2', position: {x: 100, y: 200}, data: { label: "Is temperature above 103°F?"}, type: 'default',
            style: { background: '#fff', border: '2px solid #1e293b', borderRadius: '12px', padding: '16px', width: 180, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' } },
          { id: '3', position: {x: -100, y: 350}, data: { label: "Is there difficulty breathing?"}, type: 'default',
            style: { background: '#fff', border: '2px solid #1e293b', borderRadius: '12px', padding: '16px', width: 180, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' } },
          { id: 'A', position: {x: -200, y: 500}, data: { label: "🔴 Emergency respiratory distress. Escalate immediately.", priority: "RED", riskScore: 10}, type: 'default',
            style: { background: '#FEF2F2', border: '3px solid #EF4444', borderRadius: '12px', padding: '16px', width: 180, fontWeight: 'bold'} },
          { id: 'B', position: {x: 0, y: 500}, data: { label: "🔴 High fever above 103°F. Escalate to doctor.", priority: "RED", riskScore: 8}, type: 'default',
            style: { background: '#FEF2F2', border: '3px solid #EF4444', borderRadius: '12px', padding: '16px', width: 180, fontWeight: 'bold'} },
          { id: 'C', position: {x: 300, y: 350}, data: { label: "🟡 Moderate fever. Monitor every 2 hours.", priority: "YELLOW", riskScore: 5}, type: 'default',
            style: { background: '#FFFBEB', border: '3px solid #F59E0B', borderRadius: '12px', padding: '16px', width: 180, fontWeight: 'bold'} },
          { id: '4', position: {x: 500, y: 200}, data: { label: "Is there cough or difficulty breathing?"}, type: 'default',
            style: { background: '#fff', border: '2px solid #1e293b', borderRadius: '12px', padding: '16px', width: 180, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' } },
          { id: 'D', position: {x: 500, y: 350}, data: { label: "🟡 Respiratory symptoms without fever. Monitor.", priority: "YELLOW", riskScore: 4}, type: 'default',
            style: { background: '#FFFBEB', border: '3px solid #F59E0B', borderRadius: '12px', padding: '16px', width: 180, fontWeight: 'bold'} },
          { id: 'E', position: {x: 700, y: 350}, data: { label: "🟢 No fever or respiratory symptoms. Home care advised.", priority: "GREEN", riskScore: 1}, type: 'default',
            style: { background: '#F0FDF4', border: '3px solid #10B981', borderRadius: '12px', padding: '16px', width: 180, fontWeight: 'bold'} }
        ],
        edges: [
          {id: 'e1-2', source: '1', target: '2', label: 'Yes', animated: false, style:{strokeWidth: 2}},
          {id: 'e2-3', source: '2', target: '3', label: 'Yes', animated: false, style:{strokeWidth: 2}},
          {id: 'e3-A', source: '3', target: 'A', label: 'Yes', animated: false, style:{strokeWidth: 2}},
          {id: 'e3-B', source: '3', target: 'B', label: 'No', animated: false, style:{strokeWidth: 2}},
          {id: 'e2-C', source: '2', target: 'C', label: 'No', animated: false, style:{strokeWidth: 2}},
          {id: 'e1-4', source: '1', target: '4', label: 'No', animated: false, style:{strokeWidth: 2}},
          {id: 'e4-D', source: '4', target: 'D', label: 'Yes', animated: false, style:{strokeWidth: 2}},
          {id: 'e4-E', source: '4', target: 'E', label: 'No', animated: false, style:{strokeWidth: 2}}
        ]
      };

      const expert2 = {
        name: "Chest Pain Assessment",
        category: "Cardiac",
        isExpert: true,
        nodes: [
          { id: '1', position: {x: 300, y: 50}, data: { label: "Is chest pain severe (8-10 out of 10)?"}, type: 'default', style: { background: '#fff', border: '2px solid #1e293b', borderRadius: '12px', padding: '16px', width: 180 } },
          { id: 'A', position: {x: 100, y: 200}, data: { label: "🔴 Severe chest pain. Call ambulance immediately.", priority: "RED", riskScore: 10}, type: 'default', style: { background: '#FEF2F2', border: '3px solid #EF4444', borderRadius: '12px', padding: '16px', width: 180, fontWeight: 'bold'} },
          { id: '2', position: {x: 500, y: 200}, data: { label: "Is pain radiating to arm or jaw?"}, type: 'default', style: { background: '#fff', border: '2px solid #1e293b', borderRadius: '12px', padding: '16px', width: 180 } },
          { id: 'B', position: {x: 300, y: 350}, data: { label: "🔴 Possible cardiac event. Escalate now.", priority: "RED", riskScore: 9}, type: 'default', style: { background: '#FEF2F2', border: '3px solid #EF4444', borderRadius: '12px', padding: '16px', width: 180, fontWeight: 'bold'} },
          { id: '3', position: {x: 700, y: 350}, data: { label: "Is there shortness of breath?"}, type: 'default', style: { background: '#fff', border: '2px solid #1e293b', borderRadius: '12px', padding: '16px', width: 180 } },
          { id: 'C', position: {x: 500, y: 500}, data: { label: "🟡 Chest pain with breathlessness. Immediate evaluation needed.", priority: "YELLOW", riskScore: 6}, type: 'default', style: { background: '#FFFBEB', border: '3px solid #F59E0B', borderRadius: '12px', padding: '16px', width: 180, fontWeight: 'bold'} },
          { id: 'D', position: {x: 900, y: 500}, data: { label: "🟡 Mild chest pain. Evaluate within 1 hour.", priority: "YELLOW", riskScore: 4}, type: 'default', style: { background: '#FFFBEB', border: '3px solid #F59E0B', borderRadius: '12px', padding: '16px', width: 180, fontWeight: 'bold'} }
        ],
        edges: [
          {id: 'e1-A', source: '1', target: 'A', label: 'Yes', animated: false, style:{strokeWidth: 2}},
          {id: 'e1-2', source: '1', target: '2', label: 'No', animated: false, style:{strokeWidth: 2}},
          {id: 'e2-B', source: '2', target: 'B', label: 'Yes', animated: false, style:{strokeWidth: 2}},
          {id: 'e2-3', source: '2', target: '3', label: 'No', animated: false, style:{strokeWidth: 2}},
          {id: 'e3-C', source: '3', target: 'C', label: 'Yes', animated: false, style:{strokeWidth: 2}},
          {id: 'e3-D', source: '3', target: 'D', label: 'No', animated: false, style:{strokeWidth: 2}}
        ]
      };

      const expert3 = {
        name: "Pediatric Fever Protocol",
        category: "Pediatric",
        isExpert: true,
        nodes: [
          { id: '1', position: {x: 300, y: 50}, data: { label: "Is the child under 3 months old?"}, type: 'default', style: { background: '#fff', border: '2px solid #1e293b', borderRadius: '12px', padding: '16px', width: 180 } },
          { id: 'A', position: {x: 100, y: 200}, data: { label: "🔴 Any fever in infant under 3 months is emergency.", priority: "RED", riskScore: 10}, type: 'default', style: { background: '#FEF2F2', border: '3px solid #EF4444', borderRadius: '12px', padding: '16px', width: 180, fontWeight: 'bold'} },
          { id: '2', position: {x: 500, y: 200}, data: { label: "Is temperature above 104°F?"}, type: 'default', style: { background: '#fff', border: '2px solid #1e293b', borderRadius: '12px', padding: '16px', width: 180 } },
          { id: 'B', position: {x: 300, y: 350}, data: { label: "🔴 Dangerously high fever. Escalate immediately.", priority: "RED", riskScore: 9}, type: 'default', style: { background: '#FEF2F2', border: '3px solid #EF4444', borderRadius: '12px', padding: '16px', width: 180, fontWeight: 'bold'} },
          { id: '3', position: {x: 700, y: 350}, data: { label: "Is child lethargic or not responding?"}, type: 'default', style: { background: '#fff', border: '2px solid #1e293b', borderRadius: '12px', padding: '16px', width: 180 } },
          { id: 'C', position: {x: 500, y: 500}, data: { label: "🔴 Altered consciousness. Emergency escalation required.", priority: "RED", riskScore: 9}, type: 'default', style: { background: '#FEF2F2', border: '3px solid #EF4444', borderRadius: '12px', padding: '16px', width: 180, fontWeight: 'bold'} },
          { id: 'D', position: {x: 900, y: 500}, data: { label: "🟡 Moderate pediatric fever. Monitor every hour.", priority: "YELLOW", riskScore: 4}, type: 'default', style: { background: '#FFFBEB', border: '3px solid #F59E0B', borderRadius: '12px', padding: '16px', width: 180, fontWeight: 'bold'} }
        ],
        edges: [
          {id: 'e1-A', source: '1', target: 'A', label: 'Yes', animated: false, style:{strokeWidth: 2}},
          {id: 'e1-2', source: '1', target: '2', label: 'No', animated: false, style:{strokeWidth: 2}},
          {id: 'e2-B', source: '2', target: 'B', label: 'Yes', animated: false, style:{strokeWidth: 2}},
          {id: 'e2-3', source: '2', target: '3', label: 'No', animated: false, style:{strokeWidth: 2}},
          {id: 'e3-C', source: '3', target: 'C', label: 'Yes', animated: false, style:{strokeWidth: 2}},
          {id: 'e3-D', source: '3', target: 'D', label: 'No', animated: false, style:{strokeWidth: 2}}
        ]
      };

      await Flowchart.insertMany([expert1, expert2, expert3]);
      console.log('Expert flowcharts seeded.');
    }
  } catch(err) {
    console.error('Failed to seed expert flowcharts:', err);
  }
};

const PORT = process.env.PORT || 5001;
app.listen(PORT, async () => {
  await seedExpertFlowcharts();
  console.log(`Server running on port ${PORT}`);
});
