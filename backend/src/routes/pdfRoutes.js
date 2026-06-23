import { Router } from 'express'
import { genererBonCommande } from '../controllers/pdfControleur.js'
import { proteger } from '../middlewares/authMiddleware.js'

const router = Router()

router.use(proteger)
router.get('/commande/:id', genererBonCommande)

export default router