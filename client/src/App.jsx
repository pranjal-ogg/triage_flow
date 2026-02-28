import { useState } from 'react'
import FlowBuilder from './components/FlowBuilder'
import NavigateMode from './components/NavigateMode'

export default function App() {
  const [mode, setMode] = useState('builder')

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-600 text-white px-6 py-4 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h1 className="text-xl font-bold tracking-wide">TriageFlow</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('builder')}
            className={`px-4 py-1.5 rounded-md font-medium transition-colors ${mode === 'builder' ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-100 hover:bg-indigo-500'}`}
          >
            Builder Mode
          </button>
          <button
            onClick={() => setMode('navigate')}
            className={`px-4 py-1.5 rounded-md font-medium transition-colors ${mode === 'navigate' ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-100 hover:bg-indigo-500'}`}
          >
            Navigate Protocol
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 relative">
        {mode === 'builder' ? <FlowBuilder /> : <NavigateMode />}
      </div>
    </div>
  )
}
