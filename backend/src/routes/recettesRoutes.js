// routes/recettesRoutes.js
import { Router } from 'express'
import { listerRecettes, historiqueRecettes, creerRecette, supprimerRecette } from '../controllers/recettesControleur.js'
import { proteger } from '../middlewares/authMiddleware.js'

const router = Router()
router.use(proteger)

router.get('/historique', historiqueRecettes)
router.get('/',           listerRecettes)
router.post('/',          creerRecette)
router.delete('/:id',     supprimerRecette)

export default router