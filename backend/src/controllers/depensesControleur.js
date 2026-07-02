// controllers/depensesControleur.js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function bornesMois(periodeParam) {
  const now = new Date()
  if (periodeParam === 'trim') {
    const debut = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
    const fin   = new Date(debut.getFullYear(), debut.getMonth() + 3, 0, 23, 59, 59)
    return { debut, fin }
  }
  if (periodeParam === 'annee') {
    const debut = new Date(now.getFullYear(), 0, 1)
    const fin   = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
    return { debut, fin }
  }
  const debut = new Date(now.getFullYear(), now.getMonth(), 1)
  const fin   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  return { debut, fin }
}

// GET /api/depenses?periode=mois|trim|annee
export const listerDepenses = async (req, res) => {
  const { periode } = req.query
  const now = new Date()

  let debut, fin
  if (periode === 'mois') {
    debut = new Date(now.getFullYear(), now.getMonth(), 1)
    fin   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  }

  try {
    const depenses = await prisma.depense.findMany({
      where: {
        utilisateurId: req.utilisateurId,
        ...(debut && fin ? { dateDepense: { gte: debut, lte: fin } } : {})
      },
      orderBy: { dateDepense: 'desc' }
    })

    const total = depenses.reduce((acc, d) => acc + Number(d.montant), 0)
    const items = depenses.map(d => ({
      id:           d.id,
      date:         d.dateDepense.toISOString().split('T')[0],
      categorie:    d.categorie,
      libelle:      d.libelle ?? '',
      description:  d.description ?? '',
      fournisseur:  d.fournisseur ?? '',
      montant:      Number(d.montant),
      quantite:     d.quantite !== null ? Number(d.quantite) : null,
      modePaiement: d.modePaiement ?? '',
    }))

    res.json({ total, items })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
  }
}
// POST /api/depenses
export const creerDepense = async (req, res) => {
  const { montant, categorie, fournisseur, description, dateDepense, modePaiement, quantite, libelle } = req.body
  
  // Validation
  if (!montant || !categorie || !dateDepense) {
    return res.status(400).json({ 
      message: 'Données manquantes',
      reçu: { montant, categorie, dateDepense }
    })
  }

  try {
    const depense = await prisma.depense.create({
      data: {
        utilisateurId: req.utilisateurId,
        montant: parseFloat(montant),
        quantite: quantite ? parseFloat(quantite) : null,
        libelle: libelle || null,
        categorie,
        fournisseur: fournisseur || null,
        description: description || null,
        dateDepense: new Date(dateDepense),
        modePaiement: modePaiement || null
      }
    })
    res.status(201).json(depense)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
  }
}

// PUT /api/depenses/:id
export const modifierDepense = async (req, res) => {
  const { id } = req.params
  const { montant, categorie, fournisseur, description, dateDepense, modePaiement, quantite, libelle } = req.body
  try {
    await prisma.depense.updateMany({
      where: { id, utilisateurId: req.utilisateurId },
      data: {
        montant: montant ? parseFloat(montant) : undefined,
        quantite: quantite !== undefined ? (quantite ? parseFloat(quantite) : null) : undefined,
        libelle: libelle !== undefined ? (libelle || null) : undefined,
        categorie,
        fournisseur: fournisseur || null,
        description: description || null,
        dateDepense: new Date(dateDepense),
        modePaiement: modePaiement || null
      }
    })
    res.json({ message: 'Dépense mise à jour' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
  }
}

// DELETE /api/depenses/:id
export const supprimerDepense = async (req, res) => {
  const { id } = req.params
  try {
    await prisma.depense.deleteMany({
      where: { id, utilisateurId: req.utilisateurId }
    })
    res.json({ message: 'Dépense supprimée' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
  }
}

export const historiqueDepenses = async (req, res) => {
  try {
    const now = new Date()
    const resultats = []

    for (let i = 5; i >= 0; i--) {
      const debut = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const fin   = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)

      const agg = await prisma.depense.aggregate({
        _sum: { montant: true },
        where: {
          utilisateurId: req.utilisateurId,
          dateDepense: { gte: debut, lte: fin }
        }
      })
      resultats.push(Number(agg._sum.montant ?? 0))
    }

    res.json(resultats)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
  }
}