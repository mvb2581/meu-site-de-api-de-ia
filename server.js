import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
app.disable('x-powered-by')
app.use((_req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff')
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.set('X-Frame-Options', 'SAMEORIGIN')
  next()
})
app.use(express.json({ limit: '2mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'API disponível.', data: { ok: true, name: 'aurex' }, ok: true, name: 'aurex' })
})

app.use('/api', (_req, res) => {
  res.status(404).json({ success: false, message: 'Rota da API não encontrada.' })
})

const dist = path.join(__dirname, 'dist')
app.use(express.static(dist))
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  res.sendFile(path.join(dist, 'index.html'), (err) => {
    if (err) next(err)
  })
})

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err)
  const status = Number.isInteger(err.status) && err.status >= 400 ? err.status : 500
  console.error('Falha no servidor:', err)
  if (req.path.startsWith('/api')) {
    return res.status(status).json({
      success: false,
      message: status < 500 ? 'Requisição inválida.' : 'Erro interno do servidor.'
    })
  }
  res.status(status).send(status < 500 ? 'Requisição inválida.' : 'Erro interno do servidor.')
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Aurex rodando em http://localhost:${PORT}`)
})
