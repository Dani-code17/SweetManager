// routes/depensesRoutes.js
import { Router } from 'express'
import {
  listerDepenses,
  creerDepense,
  modifierDepense,
  supprimerDepense,
  historiqueDepenses,
} from '../controllers/depensesControleur.js'
import { proteger } from '../middlewares/authMiddleware.js'


const router = Router()
router.use(proteger)

router.get('/historique', historiqueDepenses)   // AVANT /:id
router.get('/',           listerDepenses)
router.post('/',          creerDepense)
router.put('/:id',        modifierDepense)
router.delete('/:id',     supprimerDepense)
router.get('/historique', historiqueDepenses)

export default router