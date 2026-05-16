export default function ProjectList({ projects, onCreate, onOpen, onDelete }) {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Website Builder</h1>
          <button
            onClick={onCreate}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + New Site
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">No sites yet.</p>
            <p className="text-sm mt-1">Click "New Site" to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(p => (
              <div
                key={p.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col gap-3"
              >
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-800 truncate">{p.name}</h2>
                  <p className="text-xs text-gray-400 mt-1">
                    {p.blocks?.length ?? 0} block{p.blocks?.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onOpen(p)}
                    className="flex-1 bg-indigo-50 text-indigo-700 text-sm px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(p.id)}
                    className="text-sm px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
