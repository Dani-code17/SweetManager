// controllers/clientsControleur.js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/clients
export const listerClients = async (req, res) => {
  try {
    const clients = await prisma.client.findMany({ orderBy: { nom: 'asc' } })
    res.json(clients)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
  }
}

// POST /api/clients
export const creerClient = async (req, res) => {
  const { nom, telephone, email, adresse } = req.body
  try {
    const client = await prisma.client.create({ data: { nom, telephone, email, adresse } })
    res.status(201).json(client)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
  }
}

// DELETE /api/clients/:id
export const supprimerClient = async (req, res) => {
  const { id } = req.params
  try {
    await prisma.client.delete({ where: { id } })
    res.json({ message: 'Client supprimé' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
  }
}