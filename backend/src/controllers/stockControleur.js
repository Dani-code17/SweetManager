// controllers/stockControleur.js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/stock
export const listerStock = async (req, res) => {
  try {
    const articles = await prisma.stockArticle.findMany({
      where: { utilisateurId: req.utilisateurId },
      orderBy: { nom: 'asc' }
    })

    const items = articles.map(a => ({
      id:        a.id,
      nom:       a.nom,
      categorie: a.categorie ?? 'Autre',
      quantite:  Number(a.quantite),
      unite:     a.unite,
      seuil:     Number(a.seuilAlerte ?? 0),
    }))

    res.json({ items })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
  }
}

// POST /api/stock
export const creerArticle = async (req, res) => {
  const { nom, categorie, quantite, unite, seuilAlerte } = req.body
  try {
    const article = await prisma.stockArticle.create({
      data: {
        utilisateurId: req.utilisateurId,
        nom,
        categorie,
        quantite: quantite ?? 0,
        unite,
        seuilAlerte: seuilAlerte ?? null,
      }
    })
    res.status(201).json(article)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
  }
}

// PUT /api/stock/:id  → mettre à jour la quantité (inline dans le tableau)
export const modifierArticle = async (req, res) => {
  const { id } = req.params
  const { nom, categorie, quantite, unite, seuilAlerte } = req.body
  try {
    await prisma.stockArticle.updateMany({
      where: { id, utilisateurId: req.utilisateurId },
      data: { nom, categorie, quantite, unite, seuilAlerte }
    })
    res.json({ message: 'Article mis à jour' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
  }
}

// DELETE /api/stock/:id
export const supprimerArticle = async (req, res) => {
  const { id } = req.params
  try {
    await prisma.stockArticle.deleteMany({
      where: { id, utilisateurId: req.utilisateurId }
    })
    res.json({ message: 'Article supprimé' })
  } catch (err) {
    if (err.code === 'P2003' || (err.message && (err.message.includes('foreign key') || err.message.includes('RESTRICT')))) {
      return res.status(400).json({ message: 'Cet article ne peut pas être supprimé car il est utilisé dans une recette ou un historique de mouvement.' })
    }
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
  }
}