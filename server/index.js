require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/triageflow')
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Flowchart Schema
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
  edges: [edgeSchema]
});

const Flowchart = mongoose.model('Flowchart', flowchartSchema);

// Routes
// Endpoint 1: Get All Flowcharts
app.get('/api/flowcharts', async (req, res) => {
  try {
    const flowcharts = await Flowchart.find();
    res.json(flowcharts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint 2: Get Single Flowchart
app.get('/api/flowchart/:id', async (req, res) => {
  try {
    const flowchart = await Flowchart.findById(req.params.id);
    if (!flowchart) return res.status(404).json({ error: 'Flowchart not found' });
    res.json(flowchart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint 3: Create Flowchart
app.post('/api/flowchart', async (req, res) => {
  try {
    const { name, nodes, edges } = req.body;
    const flowchart = new Flowchart({ name, nodes, edges });
    await flowchart.save();
    res.status(201).json(flowchart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint 4: Update Flowchart
app.put('/api/flowchart/:id', async (req, res) => {
  try {
    const { name, nodes, edges } = req.body;
    const flowchart = await Flowchart.findByIdAndUpdate(
      req.params.id,
      { name, nodes, edges },
      { new: true }
    );
    if (!flowchart) return res.status(404).json({ error: 'Flowchart not found' });
    res.json(flowchart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint 5: Delete Flowchart
app.delete('/api/flowchart/:id', async (req, res) => {
  try {
    const flowchart = await Flowchart.findByIdAndDelete(req.params.id);
    if (!flowchart) return res.status(404).json({ error: 'Flowchart not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint 6: Navigate - Get Next Node (just for API spec, mostly handled on frontend)
app.post('/api/flowchart/:id/navigate', async (req, res) => {
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

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
