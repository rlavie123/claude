import express from 'express'
import cors from 'cors'
import { v4 as uuidv4 } from 'uuid'

const app = express()
app.use(cors())
app.use(express.json())

// In-memory store; replace with a DB for persistence
const projects = new Map()

app.get('/api/projects', (_req, res) => {
  res.json([...projects.values()])
})

app.post('/api/projects', (req, res) => {
  const project = { id: uuidv4(), name: 'Untitled Site', pages: [], ...req.body, createdAt: Date.now() }
  projects.set(project.id, project)
  res.status(201).json(project)
})

app.get('/api/projects/:id', (req, res) => {
  const project = projects.get(req.params.id)
  if (!project) return res.status(404).json({ error: 'Not found' })
  res.json(project)
})

app.put('/api/projects/:id', (req, res) => {
  if (!projects.has(req.params.id)) return res.status(404).json({ error: 'Not found' })
  const updated = { ...projects.get(req.params.id), ...req.body }
  projects.set(req.params.id, updated)
  res.json(updated)
})

app.delete('/api/projects/:id', (req, res) => {
  projects.delete(req.params.id)
  res.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
