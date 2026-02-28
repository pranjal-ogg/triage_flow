require('dotenv').config();
const mongoose = require('mongoose');

// Flowchart Schema (same as index.js)
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

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/triageflow');
    console.log('Connected to MongoDB');

    // Clear existing
    await Flowchart.deleteMany({});
    console.log('Cleared existing flowcharts');

    const demoProtocol = {
      name: 'Fever & Respiratory Triage Protocol',
      nodes: [
        {
          id: 'node-1',
          type: 'default',
          position: { x: 300, y: 50 },
          data: { label: 'Does the patient have a fever (≥ 100.4°F/38°C)?' },
          style: {
            background: '#fff',
            border: '2px solid #6366f1',
            borderRadius: '12px',
            padding: '16px',
            width: 180,
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }
        },
        {
          id: 'node-2',
          type: 'default',
          position: { x: 150, y: 200 },
          data: { label: 'Is the fever over 103°F (39.4°C)?' },
          style: {
            background: '#fff',
            border: '2px solid #6366f1',
            borderRadius: '12px',
            padding: '16px',
            width: 180,
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }
        },
        {
          id: 'node-3',
          type: 'default',
          position: { x: 450, y: 200 },
          data: { label: 'Does the patient have difficulty breathing?' },
          style: {
            background: '#fff',
            border: '2px solid #6366f1',
            borderRadius: '12px',
            padding: '16px',
            width: 180,
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }
        },
        {
          id: 'node-4',
          type: 'default',
          position: { x: 50, y: 350 },
          data: { label: '🔴 Emergency', priority: 'RED' },
          style: {
            background: '#FEF2F2',
            border: '3px solid #EF4444',
            borderRadius: '12px',
            padding: '16px',
            width: 180,
            fontWeight: 'bold',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }
        },
        {
          id: 'node-5',
          type: 'default',
          position: { x: 250, y: 350 },
          data: { label: '🟡 Monitor', priority: 'YELLOW' },
          style: {
            background: '#FFFBEB',
            border: '3px solid #F59E0B',
            borderRadius: '12px',
            padding: '16px',
            width: 180,
            fontWeight: 'bold',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }
        },
        {
          id: 'node-6',
          type: 'default',
          position: { x: 550, y: 350 },
          data: { label: '🟢 Home Care', priority: 'GREEN' },
          style: {
            background: '#F0FDF4',
            border: '3px solid #10B981',
            borderRadius: '12px',
            padding: '16px',
            width: 180,
            fontWeight: 'bold',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }
        }
      ],
      edges: [
        {
          id: 'edge-1-2',
          source: 'node-1',
          target: 'node-2',
          label: 'Yes',
          type: 'default',
          animated: false,
          style: { strokeWidth: 2 }
        },
        {
          id: 'edge-1-3',
          source: 'node-1',
          target: 'node-3',
          label: 'No',
          type: 'default',
          animated: false,
          style: { strokeWidth: 2 }
        },
        {
          id: 'edge-2-4',
          source: 'node-2',
          target: 'node-4',
          label: 'Yes',
          type: 'default',
          animated: false,
          style: { strokeWidth: 2 }
        },
        {
          id: 'edge-2-5',
          source: 'node-2',
          target: 'node-5',
          label: 'No',
          type: 'default',
          animated: false,
          style: { strokeWidth: 2 }
        },
        {
          id: 'edge-3-4', // Difficulty breathing -> Emergency
          source: 'node-3',
          target: 'node-4',
          label: 'Yes',
          type: 'default',
          animated: false,
          style: { strokeWidth: 2 }
        },
        {
          id: 'edge-3-6', // No difficulty breathing -> Home care
          source: 'node-3',
          target: 'node-6',
          label: 'No',
          type: 'default',
          animated: false,
          style: { strokeWidth: 2 }
        }
      ]
    };

    const doc = new Flowchart(demoProtocol);
    await doc.save();
    console.log('Demo flowchart inserted');

    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding DB:', err);
    mongoose.connection.close();
  }
};

seedDatabase();
