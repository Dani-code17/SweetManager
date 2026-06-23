import { Router } from 'express'
import { listerProduits, creerProduit, modifierProduit, supprimerProduit } from '../controllers/produitsControleur.js'
import { proteger } from '../middlewares/authMiddleware.js'

const router = Router()

router.use(proteger)

router.get('/', listerProduits)
router.post('/', creerProduit)
router.put('/:id', modifierProduit)
router.delete('/:id', supprimerProduit)

export default router