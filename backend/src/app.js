// app.js
import express  from 'express'
import cors     from 'cors'
import dotenv   from 'dotenv'
import path     from 'path'
import { fileURLToPath } from 'url'

import connexionRoutes  from './routes/connexionRoutes.js'
import depensesRoutes   from './routes/depensesRoutes.js'
import recettesRoutes   from './routes/recettesRoutes.js'
import stockRoutes      from './routes/stockRoutes.js'
import commandesRoutes  from './routes/commandesRoutes.js'
import clientsRoutes    from './routes/clientsRoutes.js'
import produitsRoutes from './routes/produitsRoutes.js'
import pdfRoutes from './routes/pdfRoutes.js'

dotenv.config()

const app = express()

// ── Middlewares globaux ───────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',      connexionRoutes)
app.use('/api/depenses',  depensesRoutes)
app.use('/api/recettes',  recettesRoutes)
app.use('/api/stock',     stockRoutes)
app.use('/api/commandes', commandesRoutes)
app.use('/api/clients',   clientsRoutes)
app.use('/api/produits', produitsRoutes)
app.use('/api/pdf', pdfRoutes)

// ── Route de santé ────────────────────────────────────────────────────────────
app.get('/api/ping', (_, res) => res.json({ status: 'ok' }))

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ── Gestion 404 pour l'API ────────────────────────────────────────────────────
app.use('/api', (req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} introuvable` })
})

// ── Service du Frontend en Production ─────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../../frontend/dist')))
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'))
})

// ── Gestion erreurs globales ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Erreur globale]', err)
  res.status(500).json({ message: 'Erreur interne du serveur', erreur: err.message })
})

const PORT = process.env.PORT ?? 5000
app.listen(PORT, () => console.log(`✅  Serveur démarré → http://localhost:${PORT}`))