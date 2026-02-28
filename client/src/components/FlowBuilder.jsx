import { useCallback, useState } from 'react'
import ReactFlow, {
    addEdge,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
} from 'reactflow'
import 'reactflow/dist/style.css'
import axios from 'axios'

const nodeTypes = {}
const edgeTypes = {}

const defaultNodeStyle = {
    background: '#fff',
    border: '2px solid #6366f1',
    borderRadius: '12px',
    padding: '16px',
    width: '180px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
}

const initialNodes = [
    {
        id: 'root-1',
        position: { x: 300, y: 50 },
        data: { label: 'New Question?' },
        type: 'default',
        style: { ...defaultNodeStyle }
    }
]

export default function FlowBuilder() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState([])
    const [selectedNode, setSelectedNode] = useState(null)
    const [labelInput, setLabelInput] = useState('')
    const [priority, setPriority] = useState('NONE')
    const [flowchartName, setFlowchartName] = useState('New Triage Protocol')
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [pendingEdge, setPendingEdge] = useState(null)
    const [edgeLabelInput, setEdgeLabelInput] = useState('')

    const onConnect = useCallback(
        (params) => {
            setPendingEdge(params)
            setEdgeLabelInput('')
        },
        []
    )

    const confirmEdgeConnection = () => {
        if (!pendingEdge) return;
        setEdges((eds) => addEdge({ ...pendingEdge, label: edgeLabelInput || 'Yes', animated: false, style: { strokeWidth: 2 } }, eds))
        setPendingEdge(null)
    }

    const cancelEdgeConnection = () => {
        setPendingEdge(null)
    }

    const addQuestionNode = () => {
        const newNode = {
            id: `q-${Date.now()}`,
            position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
            data: { label: 'New Question' },
            style: { ...defaultNodeStyle }
        }
        setNodes((nds) => [...nds, newNode])
    }

    const addOutcomeNode = (priorityType) => {
        const styles = {
            RED: { bg: '#FEF2F2', border: '#EF4444', text: '🔴 Emergency' },
            YELLOW: { bg: '#FFFBEB', border: '#F59E0B', text: '🟡 Monitor' },
            GREEN: { bg: '#F0FDF4', border: '#10B981', text: '🟢 Home Care' },
        }
        const c = styles[priorityType]
        const newNode = {
            id: `outcome-${Date.now()}`,
            position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 300 },
            data: { label: c.text, priority: priorityType },
            style: { ...defaultNodeStyle, background: c.bg, border: `3px solid ${c.border}`, fontWeight: 'bold' }
        }
        setNodes((nds) => [...nds, newNode])
    }

    const onNodeClick = (_, node) => {
        setSelectedNode(node)
        setLabelInput(node.data.label)
        setPriority(node.data.priority || 'NONE')
    }

    const updateNodeLabel = () => {
        if (!selectedNode) return;
        setNodes((nds) =>
            nds.map((n) =>
                n.id === selectedNode.id
                    ? { ...n, data: { ...n.data, label: labelInput, priority } }
                    : n
            )
        )
        setSelectedNode(null)
    }

    const saveFlowchart = async () => {
        setErrorMsg('')
        setSuccessMsg('')
        try {
            if (nodes.length === 0) throw new Error("Add at least one node");
            await axios.post('http://localhost:5001/api/flowchart', {
                name: flowchartName,
                nodes,
                edges,
            })
            setSuccessMsg('Flowchart saved successfully!')
            setTimeout(() => setSuccessMsg(''), 3000)
        } catch (e) {
            setErrorMsg(e.message || 'Save failed. Is the backend running?')
            setTimeout(() => setErrorMsg(''), 4000)
        }
    }

    return (
        <div className="absolute inset-0 flex bg-gray-50">
            {/* Sidebar Tool Panel */}
            <div className="w-72 bg-white border-r border-gray-200 p-5 flex flex-col overflow-y-auto shadow-sm z-10">

                <div className="mb-6">
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Protocol Name</label>
                    <input
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                        value={flowchartName}
                        onChange={(e) => setFlowchartName(e.target.value)}
                        placeholder="E.g., Fever Triage Protocol"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Add Components</label>
                    <div className="flex flex-col gap-2">
                        <button onClick={addQuestionNode} className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                            Standard Question
                        </button>
                        <div className="grid grid-cols-1 gap-2 mt-2">
                            <button onClick={() => addOutcomeNode('RED')} className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left flex items-center">
                                <span className="mr-2">🔴</span> Emergency Outcome
                            </button>
                            <button onClick={() => addOutcomeNode('YELLOW')} className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left flex items-center">
                                <span className="mr-2">🟡</span> Monitor Outcome
                            </button>
                            <button onClick={() => addOutcomeNode('GREEN')} className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left flex items-center">
                                <span className="mr-2">🟢</span> Home Care Outcome
                            </button>
                        </div>
                    </div>
                </div>

                {selectedNode && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide flex justify-between">
                            <span>Edit Node</span>
                            <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-gray-600">×</button>
                        </label>
                        <textarea
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3 resize-none"
                            rows={3}
                            value={labelInput}
                            onChange={(e) => setLabelInput(e.target.value)}
                            placeholder="Question text..."
                        />
                        <button onClick={updateNodeLabel} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">
                            Save Changes
                        </button>
                    </div>
                )}

                <div className="mt-auto pt-6">
                    <button onClick={saveFlowchart} className="w-full bg-gray-900 hover:bg-gray-800 text-white px-4 py-3 rounded-lg text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                        Save Protocol to DB
                    </button>

                    {errorMsg && <p className="text-red-500 text-xs mt-3 text-center font-medium bg-red-50 p-2 rounded border border-red-100">{errorMsg}</p>}
                    {successMsg && <p className="text-emerald-600 text-xs mt-3 text-center font-medium bg-emerald-50 p-2 rounded border border-emerald-100">{successMsg}</p>}
                </div>
            </div>

            {/* Main Graph Canvas Area */}
            <div className="flex-1 h-full w-full relative">
                {/* Instruction Panel */}
                <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-indigo-100 text-sm pointer-events-none max-w-sm">
                    <h3 className="font-bold text-indigo-800 mb-3 text-base flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
                        How to Build
                    </h3>
                    <ul className="text-gray-700 space-y-2">
                        <li><strong className="text-indigo-600">Step 1:</strong> Add a Question node</li>
                        <li><strong className="text-indigo-600">Step 2:</strong> Add an Outcome node</li>
                        <li><strong className="text-indigo-600">Step 3:</strong> Drag from the dot on the bottom of one node to the dot on top of another to connect them</li>
                        <li><strong className="text-indigo-600">Step 4:</strong> Type the answer label in the popup</li>
                    </ul>
                </div>

                {/* Edge Label Modal */}
                {pendingEdge && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm">
                        <div className="bg-white p-6 rounded-2xl shadow-2xl border border-gray-100 w-96 transform transition-all">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Label this connection</h3>
                            <p className="text-sm text-gray-500 mb-5">What is the label for this connection? (e.g., Yes, No, Maybe)</p>
                            <input
                                autoFocus
                                className="w-full border-2 border-indigo-100 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 mb-6 transition-colors font-medium text-gray-800 placeholder-gray-300"
                                placeholder="Connection label..."
                                value={edgeLabelInput}
                                onChange={e => setEdgeLabelInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && confirmEdgeConnection()}
                            />
                            <div className="flex gap-3 justify-end">
                                <button onClick={cancelEdgeConnection} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                                <button onClick={confirmEdgeConnection} className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm">Connect</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Inject styles for the tooltip on node hover */}
                <style>{`
                    .react-flow__node:hover::after {
                        content: 'Drag from the handle to connect';
                        position: absolute;
                        bottom: 100%;
                        left: 50%;
                        transform: translateX(-50%);
                        background: #1e1b4b;
                        color: white;
                        padding: 6px 10px;
                        border-radius: 6px;
                        font-size: 12px;
                        font-weight: 500;
                        white-space: nowrap;
                        pointer-events: none;
                        z-index: 1000;
                        margin-bottom: 10px;
                        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                    }
                    .react-flow__node:hover::before {
                        content: '';
                        position: absolute;
                        bottom: 100%;
                        left: 50%;
                        transform: translateX(-50%);
                        border-width: 6px;
                        border-style: solid;
                        border-color: #1e1b4b transparent transparent transparent;
                        pointer-events: none;
                        z-index: 1000;
                        margin-bottom: -2px;
                    }
                `}</style>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                >
                    <Background color="#ccc" gap={16} size={1} />
                    <MiniMap
                        nodeColor={(n) => {
                            if (n.data?.priority === 'RED') return '#EF4444';
                            if (n.data?.priority === 'YELLOW') return '#F59E0B';
                            if (n.data?.priority === 'GREEN') return '#10B981';
                            return '#6366f1';
                        }}
                    />
                    <Controls />
                </ReactFlow>
            </div>
        </div>
    )
}
