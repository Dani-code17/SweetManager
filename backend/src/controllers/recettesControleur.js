// controllers/recettesControleur.js
// Les "recettes" = paiements reçus sur les commandes livrées/payées.
// On les calcule depuis le modèle Paiement lié aux Commandes.

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ─── Utilitaire : bornes du mois courant ────────────────────────────────────
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
  // défaut : mois courant
  const debut = new Date(now.getFullYear(), now.getMonth(), 1)
  const fin   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  return { debut, fin }
}

// GET /api/recettes?periode=mois|trim|annee
export const listerRecettes = async (req, res) => {
  const { periode } = req.query
  const { debut, fin } = bornesMois(periode)

  try {
    const paiements = await prisma.paiement.findMany({
      where: {
        datePaiement: { gte: debut, lte: fin },
        commande: {
          utilisateurId: req.utilisateurId
        }
      },
      include: {
        commande: {
          include: { client: true }
        }
      },
      orderBy: { datePaiement: 'desc' }
    })

    const items = paiements.map(p => ({
      id:          p.id,
      date:        p.datePaiement.toISOString().split('T')[0],
      client:      p.commande.client.nom,
      description: `Commande #${p.commandeId.slice(0, 8)}`,
      montant:     Number(p.montant),
      methode:     p.methode,
    }))

    const total = items.reduce((acc, i) => acc + i.montant, 0)

    res.json({ total, items })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
  }
}

// GET /api/recettes/historique  → 6 derniers mois pour le graphique
export const historiqueRecettes = async (req, res) => {
  try {
    const now = new Date()
    const resultats = []

    for (let i = 5; i >= 0; i--) {
      const debut = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const fin   = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)

      const agg = await prisma.paiement.aggregate({
        _sum: { montant: true },
        where: {
          datePaiement: { gte: debut, lte: fin },
          commande: { utilisateurId: req.utilisateurId }
        }
      })
      resultats.push(Number(agg._sum.montant ?? 0))
    }

    res.json(resultats)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
  }
}

// POST /api/recettes  → Crée une recette simple (paiement + commande + client)
export const creerRecette = async (req, res) => {
  const { date, client, description, montant } = req.body

  // Validation
  if (!client || !montant || !date) {
    return res.status(400).json({ 
      message: 'Données manquantes',
      reçu: { client, montant, date }
    })
  }

  try {
    // 1. Créer ou récupérer le client (filtrée par utilisateur)
    let clientRecord = await prisma.client.findFirst({
      where: { 
        utilisateurId: req.utilisateurId,
        nom: client.trim() 
      }
    })
    
    if (!clientRecord) {
      clientRecord = await prisma.client.create({
        data: { 
          utilisateurId: req.utilisateurId,
          nom: client.trim() 
        }
      })
    }

    // 2. Créer une commande simple (sans lignes)
    const commande = await prisma.commande.create({
      data: {
        utilisateurId: req.utilisateurId,
        clientId: clientRecord.id,
        dateLivraison: date ? new Date(date) : null,
        montantTotal: parseFloat(montant),
        notes: description,
        statut: 'livree'
      }
    })

    // 3. Créer un paiement
    const paiement = await prisma.paiement.create({
      data: {
        commandeId: commande.id,
        montant: parseFloat(montant),
        methode: 'cash',
        datePaiement: date ? new Date(date) : new Date()
      }
    })

    res.status(201).json({
      id: paiement.id,
      montant: Number(paiement.montant),
      client,
      description,
      date: date || new Date().toISOString().split('T')[0]
    })
  } catch (err) {
    console.error('[crierRecette]', err)
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
  }
}

// DELETE /api/recettes/:id  → Supprime un paiement (et la commande associée si elle n'a plus de paiements)
export const supprimerRecette = async (req, res) => {
  const { id } = req.params
  try {
    // Vérifier que le paiement existe et appartient à l'utilisateur
    const paiement = await prisma.paiement.findUnique({
      where: { id },
      include: { commande: true }
    })

    if (!paiement || paiement.commande.utilisateurId !== req.utilisateurId) {
      return res.status(404).json({ message: 'Recette introuvable' })
    }

    const commandeId = paiement.commandeId

    // Supprimer le paiement
    await prisma.paiement.delete({ where: { id } })

    // Vérifier s'il reste d'autres paiements sur cette commande
    const autresPaiements = await prisma.paiement.count({
      where: { commandeId }
    })

    // Si plus aucun paiement, supprimer la commande aussi
    if (autresPaiements === 0) {
      await prisma.commande.delete({ where: { id: commandeId } })
    }

    res.json({ message: 'Recette supprimée' })
  } catch (err) {
    console.error('[supprimerRecette]', err)
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
  }
}