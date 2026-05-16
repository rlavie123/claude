import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import BlockEditor from './BlockEditor'
import Preview from './Preview'

const BLOCK_TYPES = [
  { type: 'hero', label: 'Hero', defaults: { heading: 'Welcome', subheading: 'Your tagline here', cta: 'Get Started' } },
  { type: 'text', label: 'Text Section', defaults: { heading: 'Section Title', body: 'Add your content here.' } },
  { type: 'features', label: 'Features', defaults: { heading: 'Features', items: ['Feature 1', 'Feature 2', 'Feature 3'] } },
  { type: 'contact', label: 'Contact', defaults: { heading: 'Contact Us', email: 'hello@example.com' } },
]

export default function Builder({ project, onSave, onBack }) {
  const [name, setName] = useState(project.name)
  const [blocks, setBlocks] = useState(project.blocks ?? [])
  const [selectedId, setSelectedId] = useState(null)
  const [tab, setTab] = useState('editor')

  function addBlock(type) {
    const def = BLOCK_TYPES.find(b => b.type === type)
    const block = { id: uuidv4(), type, ...def.defaults }
    setBlocks(prev => [...prev, block])
    setSelectedId(block.id)
  }

  function updateBlock(id, patch) {
    setBlocks(prev => prev.map(b => (b.id === id ? { ...b, ...patch } : b)))
  }

  function removeBlock(id) {
    setBlocks(prev => prev.filter(b => b.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  function moveBlock(id, dir) {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id)
      const next = [...prev]
      const swap = idx + dir
      if (swap < 0 || swap >= next.length) return prev
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return next
    })
  }

  function save() {
    onSave({ ...project, name, blocks })
  }

  const selected = blocks.find(b => b.id === selectedId)

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-800 text-sm">← Back</button>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="font-semibold text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-indigo-500 outline-none px-1"
        />
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => setTab(t => t === 'editor' ? 'preview' : 'editor')}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            {tab === 'editor' ? 'Preview' : 'Editor'}
          </button>
          <button
            onClick={save}
            className="bg-indigo-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </div>

      {tab === 'preview' ? (
        <Preview blocks={blocks} />
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar — block list */}
          <div className="w-56 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
            <div className="p-3 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">Blocks</div>
            {blocks.map((b, i) => (
              <div
                key={b.id}
                onClick={() => setSelectedId(b.id)}
                className={`px-3 py-2 cursor-pointer flex items-center justify-between text-sm border-b border-gray-50 ${selectedId === b.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <span className="truncate">{BLOCK_TYPES.find(t => t.type === b.type)?.label}</span>
                <div className="flex gap-1 text-gray-400 shrink-0">
                  <button onClick={e => { e.stopPropagation(); moveBlock(b.id, -1) }} className="hover:text-gray-700 px-0.5">↑</button>
                  <button onClick={e => { e.stopPropagation(); moveBlock(b.id, 1) }} className="hover:text-gray-700 px-0.5">↓</button>
                  <button onClick={e => { e.stopPropagation(); removeBlock(b.id) }} className="hover:text-red-500 px-0.5">×</button>
                </div>
              </div>
            ))}
            <div className="p-3 border-t border-gray-100 mt-auto">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Add Block</p>
              <div className="flex flex-col gap-1">
                {BLOCK_TYPES.map(bt => (
                  <button
                    key={bt.type}
                    onClick={() => addBlock(bt.type)}
                    className="text-left text-xs px-2 py-1.5 rounded bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 text-gray-700"
                  >
                    + {bt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Center — live preview */}
          <div className="flex-1 overflow-y-auto bg-gray-200 p-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden min-h-full">
              <Preview blocks={blocks} selectedId={selectedId} onSelect={setSelectedId} />
            </div>
          </div>

          {/* Right sidebar — block editor */}
          <div className="w-72 bg-white border-l border-gray-200 overflow-y-auto">
            {selected ? (
              <BlockEditor block={selected} onChange={patch => updateBlock(selected.id, patch)} />
            ) : (
              <div className="p-4 text-sm text-gray-400 text-center pt-10">Select a block to edit it</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
