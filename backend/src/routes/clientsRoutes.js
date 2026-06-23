// routes/clientsRoutes.js
import { Router } from 'express'
import { listerClients, creerClient, supprimerClient } from '../controllers/clientsControleur.js'
import { proteger } from '../middlewares/authMiddleware.js'

const router = Router()
router.use(proteger)

router.get('/',       listerClients)
router.post('/',      creerClient)
router.delete('/:id', supprimerClient)

export default router