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
import produitsRoutes   from './routes/produitsRoutes.js'
import pdfRoutes        from './routes/pdfRoutes.js'

dotenv.config()

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

// ── CORS ──────────────────────────────────────────────────────────────────────
// Accepte : l'URL définie dans FRONTEND_URL (Vercel, Netlify, etc.)
// + localhost en développement
const originesAutorisees = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
]
if (process.env.FRONTEND_URL) {
  originesAutorisees.push(process.env.FRONTEND_URL)
}

app.use(cors({
  origin: (origin, callback) => {
    // Autorise les appels sans origin (ex: curl, Postman, même serveur)
    if (!origin) return callback(null, true)
    if (originesAutorisees.includes(origin)) return callback(null, true)
    callback(new Error(`CORS bloqué pour : ${origin}`))
  },
  credentials: true,
}))

app.use(express.json())

// ── Routes API ────────────────────────────────────────────────────────────────
app.use('/api/auth',      connexionRoutes)
app.use('/api/depenses',  depensesRoutes)
app.use('/api/recettes',  recettesRoutes)
app.use('/api/stock',     stockRoutes)
app.use('/api/commandes', commandesRoutes)
app.use('/api/clients',   clientsRoutes)
app.use('/api/produits',  produitsRoutes)
app.use('/api/pdf',       pdfRoutes)

// ── Route de santé ────────────────────────────────────────────────────────────
app.get('/api/ping', (_, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }))

// ── 404 API ───────────────────────────────────────────────────────────────────
app.use('/api', (req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} introuvable` })
})

// ── Servir le frontend en production (mode monorepo uniquement) ───────────────
// Si le backend et le frontend sont sur le même serveur (ex: Render),
// on sert les fichiers statiques du build Vite.
// Sur Railway (backend seul), le dossier dist n'existe pas → on ignore.
const distPath = path.join(__dirname, '../../frontend/dist')
if (process.env.SERVE_FRONTEND === 'true') {
  app.use(express.static(distPath))
  // Express v5 / path-to-regexp v8 : utiliser '/{*path}' au lieu de '*'
  app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

// ── Gestion erreurs globales ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Erreur globale]', err)
  res.status(500).json({ message: 'Erreur interne du serveur', erreur: err.message })
})

const PORT = process.env.PORT ?? 5000
app.listen(PORT, () => console.log(`✅  Serveur démarré → http://localhost:${PORT}`))
