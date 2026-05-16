export default function Preview({ blocks, selectedId, onSelect }) {
  return (
    <div>
      {blocks.map(block => (
        <div
          key={block.id}
          onClick={() => onSelect?.(block.id)}
          className={`transition-all ${onSelect ? 'cursor-pointer' : ''} ${selectedId === block.id ? 'ring-2 ring-inset ring-indigo-500' : ''}`}
        >
          <BlockRenderer block={block} />
        </div>
      ))}
      {blocks.length === 0 && (
        <div className="text-center text-gray-300 py-32 text-sm">
          Add a block from the left panel to get started
        </div>
      )}
    </div>
  )
}

function BlockRenderer({ block }) {
  switch (block.type) {
    case 'hero':
      return (
        <section className="bg-indigo-600 text-white text-center py-24 px-6">
          <h1 className="text-4xl font-bold mb-4">{block.heading}</h1>
          <p className="text-indigo-200 text-lg mb-8">{block.subheading}</p>
          {block.cta && (
            <button className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-lg hover:bg-indigo-50">
              {block.cta}
            </button>
          )}
        </section>
      )
    case 'text':
      return (
        <section className="py-16 px-8 max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{block.heading}</h2>
          <p className="text-gray-600 leading-relaxed">{block.body}</p>
        </section>
      )
    case 'features':
      return (
        <section className="py-16 px-8 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">{block.heading}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {block.items?.map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm text-center">
                <div className="w-10 h-10 bg-indigo-100 rounded-full mx-auto mb-3 flex items-center justify-center text-indigo-600 font-bold">
                  {i + 1}
                </div>
                <p className="text-gray-700 text-sm font-medium">{item}</p>
              </div>
            ))}
          </div>
        </section>
      )
    case 'contact':
      return (
        <section className="py-16 px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{block.heading}</h2>
          <p className="text-gray-500 mb-6">
            Reach us at{' '}
            <a href={`mailto:${block.email}`} className="text-indigo-600 underline">
              {block.email}
            </a>
          </p>
          <div className="max-w-sm mx-auto flex flex-col gap-3">
            <input placeholder="Your name" className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400" />
            <input placeholder="Your email" type="email" className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400" />
            <textarea placeholder="Your message" rows={3} className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 resize-none" />
            <button className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-indigo-700">Send</button>
          </div>
        </section>
      )
    default:
      return null
  }
}
