import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(express.json({ limit: '2mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, name: 'aurex' })
})

const dist = path.join(__dirname, 'dist')
app.use(express.static(dist))
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  res.sendFile(path.join(dist, 'index.html'), (err) => {
    if (err) next(err)
  })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Aurex rodando em http://localhost:${PORT}`)
})