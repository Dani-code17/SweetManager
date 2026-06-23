import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/produits
export const listerProduits = async (req, res) => {
  try {
    const produits = await prisma.produit.findMany({
      where: { utilisateurId: req.utilisateurId },
      include: {
        ingredients: {
          include: { stockArticle: true }
        }
      },
      orderBy: { nom: 'asc' }
    })
    res.json({ items: produits })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
  }
}

// POST /api/produits
export const creerProduit = async (req, res) => {
  const { nom, description, categorie, prix, photo, ingredients } = req.body
  try {
    const produit = await prisma.produit.create({
      data: {
        utilisateurId: req.utilisateurId,
        nom,
        description,
        categorie,
        prix,
        photo,
        ingredients: ingredients?.length ? {
          create: ingredients.map(i => ({
            stockArticleId: i.stockArticleId,
            quantite: i.quantite
          }))
        } : undefined
      },
      include: {
        ingredients: { include: { stockArticle: true } }
      }
    })
    res.status(201).json(produit)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
  }
}

// PUT /api/produits/:id
export const modifierProduit = async (req, res) => {
  const { id } = req.params
  const { nom, description, categorie, prix, photo, ingredients } = req.body
  try {
    // Supprimer les anciens ingrédients et recréer
    await prisma.recetteFabrication.deleteMany({ where: { produitId: id } })

    const produit = await prisma.produit.updateMany({
      where: { id, utilisateurId: req.utilisateurId },
      data: { nom, description, categorie, prix, photo }
    })

    if (ingredients?.length) {
      await prisma.recetteFabrication.createMany({
        data: ingredients.map(i => ({
          produitId: id,
          stockArticleId: i.stockArticleId,
          quantite: i.quantite
        }))
      })
    }

    res.json({ message: 'Produit mis à jour' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
  }
}

// DELETE /api/produits/:id
export const supprimerProduit = async (req, res) => {
  const { id } = req.params
  try {
    await prisma.produit.deleteMany({
      where: { id, utilisateurId: req.utilisateurId }
    })
    res.json({ message: 'Produit supprimé' })
  } catch (err) {
    if (err.code === 'P2003' || (err.message && (err.message.includes('foreign key') || err.message.includes('RESTRICT')))) {
      return res.status(400).json({ message: 'Ce produit ne peut pas être supprimé car il est utilisé dans une ou plusieurs commandes.' })
    }
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
  }
}