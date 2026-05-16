export default function BlockEditor({ block, onChange }) {
  function field(label, key, type = 'text') {
    const isArray = Array.isArray(block[key])
    if (isArray) {
      return (
        <div key={key} className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</label>
          {block[key].map((item, i) => (
            <div key={i} className="flex gap-1 mb-1">
              <input
                value={item}
                onChange={e => {
                  const items = [...block[key]]
                  items[i] = e.target.value
                  onChange({ [key]: items })
                }}
                className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
              <button
                onClick={() => onChange({ [key]: block[key].filter((_, j) => j !== i) })}
                className="text-red-400 hover:text-red-600 text-xs px-1"
              >×</button>
            </div>
          ))}
          <button
            onClick={() => onChange({ [key]: [...block[key], 'New item'] })}
            className="text-indigo-600 text-xs hover:underline mt-1"
          >+ Add item</button>
        </div>
      )
    }
    return (
      <div key={key} className="mb-4">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</label>
        {type === 'textarea' ? (
          <textarea
            value={block[key] ?? ''}
            onChange={e => onChange({ [key]: e.target.value })}
            rows={3}
            className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 resize-none"
          />
        ) : (
          <input
            type={type}
            value={block[key] ?? ''}
            onChange={e => onChange({ [key]: e.target.value })}
            className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        )}
      </div>
    )
  }

  return (
    <div className="p-4">
      <h3 className="font-semibold text-gray-800 mb-4 capitalize">{block.type} Block</h3>
      {block.type === 'hero' && (
        <>
          {field('Heading', 'heading')}
          {field('Subheading', 'subheading', 'textarea')}
          {field('CTA Button', 'cta')}
        </>
      )}
      {block.type === 'text' && (
        <>
          {field('Heading', 'heading')}
          {field('Body', 'body', 'textarea')}
        </>
      )}
      {block.type === 'features' && (
        <>
          {field('Heading', 'heading')}
          {field('Items', 'items')}
        </>
      )}
      {block.type === 'contact' && (
        <>
          {field('Heading', 'heading')}
          {field('Email', 'email', 'email')}
        </>
      )}
    </div>
  )
}
