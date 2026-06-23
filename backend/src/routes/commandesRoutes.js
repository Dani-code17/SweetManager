// routes/commandesRoutes.js
import { Router } from 'express'
import {
  listerCommandes,
  creerCommande,
  changerStatut,
  supprimerCommande,
} from '../controllers/commandesControleur.js'
import { proteger } from '../middlewares/authMiddleware.js'

const router = Router()
router.use(proteger)

router.get('/',            listerCommandes)
router.post('/',           creerCommande)
router.put('/:id/statut',  changerStatut)
router.delete('/:id',      supprimerCommande)

export default router