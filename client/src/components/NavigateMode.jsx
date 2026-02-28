import { useState, useEffect } from 'react'
import axios from 'axios'

export default function NavigateMode() {
    const [flowcharts, setFlowcharts] = useState([])
    const [selected, setSelected] = useState(null)
    const [currentNode, setCurrentNode] = useState(null)
    const [history, setHistory] = useState([])
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get('http://localhost:5001/api/flowcharts')
            .then(r => {
                setFlowcharts(r.data)
                setLoading(false)
            })
            .catch(() => {
                setLoading(false)
            })
    }, [])

    const startProtocol = (flowchart) => {
        setSelected(flowchart)
        setResult(null)
        setHistory([])
        // Root node has no incoming edges.
        const targetIds = flowchart.edges.map(e => e.target)
        const root = flowchart.nodes.find(n => !targetIds.includes(n.id))

        // Fallback if no specific root found (e.g loop) pick first node
        setCurrentNode(root || flowchart.nodes[0])
    }

    const handleAnswer = (edge) => {
        const nextNode = selected.nodes.find(n => n.id === edge.target)
        if (!nextNode) return;

        setHistory(h => [...h, currentNode])

        if (nextNode.data.priority) {
            setResult(nextNode)
            setCurrentNode(null)
        } else {
            setCurrentNode(nextNode)
        }
    }

    const getOutgoingEdges = (nodeId) =>
        selected.edges.filter(e => e.source === nodeId)

    const priorityStyle = {
        RED: 'bg-red-50 border-red-500 text-red-900 shadow-red-100',
        YELLOW: 'bg-yellow-50 border-yellow-500 text-yellow-900 shadow-yellow-100',
        GREEN: 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-emerald-100',
    }

    const badgeStyle = {
        RED: 'bg-red-500 text-white',
        YELLOW: 'bg-yellow-500 text-white',
        GREEN: 'bg-emerald-500 text-white',
    }

    const priorityEmoji = { RED: '🔴', YELLOW: '🟡', GREEN: '🟢' }

    if (loading) {
        return <div className="flex h-full w-full items-center justify-center text-gray-400">Loading Protocols...</div>
    }

    // 1) List view
    if (!selected) return (
        <div className="flex justify-center w-full h-full p-8 overflow-y-auto">
            <div className="w-full max-w-2xl mt-8">
                <h2 className="text-3xl font-extrabold text-gray-800 mb-2 tracking-tight">Triage Protocols</h2>
                <p className="text-gray-500 mb-8 font-medium">Select a protocol from the list to start a patient assessment.</p>

                <div className="flex flex-col gap-4">
                    {flowcharts.length === 0 && (
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-8 text-center text-indigo-800 shadow-sm">
                            No offline protocols are saved on the device. Go to Builder Mode to create and save one.
                        </div>
                    )}
                    {flowcharts.map(f => (
                        <button
                            key={f._id}
                            onClick={() => startProtocol(f)}
                            className="group bg-white border border-gray-200 rounded-xl p-6 text-left hover:border-indigo-500 hover:shadow-md transition-all relative overflow-hidden flex items-center justify-between"
                        >
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-indigo-600 transition-colors">📄 {f.name}</h3>
                                <p className="text-sm text-gray-400 font-medium">Contains {f.nodes.length} decision nodes • Created {new Date(f.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" /></svg>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )

    // 2) Assessment Complete view
    if (result) return (
        <div className="flex items-center justify-center h-full w-full bg-gray-50/50">
            <div className={`border-l-8 rounded-2xl p-10 max-w-lg w-full shadow-lg ${priorityStyle[result.data.priority]} relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-4 opacity-20 text-8xl -mt-6 -mr-4 pointer-events-none">
                    {priorityEmoji[result.data.priority]}
                </div>

                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-5 shadow-sm ${badgeStyle[result.data.priority]}`}>
                    Triage Outcome
                </span>

                <h2 className="text-4xl font-extrabold mb-4 tracking-tight">
                    {result.data.priority === 'RED' ? 'EMERGENCY' : result.data.priority === 'YELLOW' ? 'MONITOR CLOSELY' : 'HOME CARE'}
                </h2>

                <p className="text-xl mb-8 font-medium leading-relaxed opacity-90 border-t border-black/10 pt-4">
                    Decision: {result.data.label}
                </p>

                <div className="flex gap-3">
                    <button onClick={() => { setSelected(null); setResult(null) }}
                        className="flex-1 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-bold shadow-md transition-transform active:scale-[0.98]">
                        Complete & Return
                    </button>
                    <button onClick={() => startProtocol(selected)}
                        className="flex-1 bg-white hover:bg-gray-100 text-gray-800 border-2 border-gray-200 px-6 py-3 rounded-lg font-bold transition-transform active:scale-[0.98]">
                        Restart Flow
                    </button>
                </div>
            </div>
        </div>
    )

    // 3) Assessment Traversing view
    const edges = getOutgoingEdges(currentNode?.id);

    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-4 overflow-y-auto">
            <div className="w-full max-w-xl">

                {/* Progress header */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
                    <div className="text-sm font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>
                        {selected.name}
                    </div>
                    <div className="text-xs font-bold text-gray-400 bg-gray-100 rounded-full px-3 py-1">
                        Step {history.length + 1}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 w-full mb-6 relative overflow-hidden">
                    {/* Question */}
                    <h2 className="text-3xl font-bold text-gray-900 mb-10 leading-snug">
                        {currentNode?.data.label}
                    </h2>

                    {/* Choices */}
                    <div className="flex flex-col gap-3">
                        {edges.length === 0 && (
                            <div className="p-4 bg-orange-50 text-orange-800 rounded-lg border border-orange-200 text-sm">
                                Warning: This node has no outgoing connections. The flow is broken.
                            </div>
                        )}
                        {edges.map((edge, i) => (
                            <button key={i} onClick={() => handleAnswer(edge)}
                                className="group relative border-2 border-indigo-100 bg-indigo-50/50 text-indigo-700 rounded-xl py-4 px-6 text-lg font-semibold hover:bg-indigo-600 hover:border-indigo-600 hover:text-white transition-all shadow-sm text-left flex justify-between items-center overflow-hidden">
                                <span className="relative z-10">{edge.label || `Option ${i + 1}`}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity relative z-10 -mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Navigation bottom */}
                <div className="flex justify-between items-center px-2">
                    {history.length > 0 ? (
                        <button onClick={() => { setCurrentNode(history[history.length - 1]); setHistory(h => h.slice(0, -1)) }}
                            className="text-sm font-semibold text-gray-400 hover:text-gray-800 flex items-center gap-1 transition-colors px-2 py-1 -ml-2 rounded hover:bg-gray-100">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
                            Step Back
                        </button>
                    ) : <div></div>}

                    <button onClick={() => setSelected(null)} className="text-sm font-semibold text-gray-400 hover:text-red-500 transition-colors">
                        Cancel Assessment
                    </button>
                </div>
            </div>
        </div>
    )
}
