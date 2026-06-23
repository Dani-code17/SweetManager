import { Router } from 'express'
import { inscrire, connecter, getProfil, modifierProfil } from '../controllers/authControleur.js'
import { proteger } from '../middlewares/authMiddleware.js'

const router = Router()

router.post('/inscrire', inscrire)
router.post('/connecter', connecter)
router.get('/profil', proteger, getProfil)
router.put('/profil', proteger, modifierProfil)

export default router