// routes/stockRoutes.js
import { Router } from 'express'
import { listerStock, creerArticle, modifierArticle, supprimerArticle } from '../controllers/stockControleur.js'
import { proteger } from '../middlewares/authMiddleware.js'

const router = Router()
router.use(proteger)

router.get('/',     listerStock)
router.post('/',    creerArticle)
router.put('/:id',  modifierArticle)
router.delete('/:id', supprimerArticle)

export default router