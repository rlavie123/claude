import { useState, useEffect } from 'react'
import ProjectList from './components/ProjectList'
import Builder from './components/Builder'

export default function App() {
  const [projects, setProjects] = useState([])
  const [activeProject, setActiveProject] = useState(null)

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(setProjects)
      .catch(() => {})
  }, [])

  async function createProject() {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Site', blocks: [] }),
    })
    const project = await res.json()
    setProjects(prev => [...prev, project])
    setActiveProject(project)
  }

  async function saveProject(updated) {
    await fetch(`/api/projects/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    setProjects(prev => prev.map(p => (p.id === updated.id ? updated : p)))
    setActiveProject(updated)
  }

  async function deleteProject(id) {
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    setProjects(prev => prev.filter(p => p.id !== id))
    if (activeProject?.id === id) setActiveProject(null)
  }

  if (activeProject) {
    return (
      <Builder
        project={activeProject}
        onSave={saveProject}
        onBack={() => setActiveProject(null)}
      />
    )
  }

  return (
    <ProjectList
      projects={projects}
      onCreate={createProject}
      onOpen={setActiveProject}
      onDelete={deleteProject}
    />
  )
}
