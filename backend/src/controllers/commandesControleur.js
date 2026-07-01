// controllers/commandesControleur.js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Mapping enum Prisma → label français pour le frontend
const STATUT_FR = {
  en_attente:  'En cours',
  preparation: 'En cours',
  prete:       'Prêt',
  livree:      'Livré',
  annulee:     'Annulé',
}
const STATUT_DB = {
  'En cours': 'en_attente',
  'Prêt':     'prete',
  'Livré':    'livree',
  'Annulé':   'annulee',
  'Confirmé': 'preparation',
}

// GET /api/commandes
export const listerCommandes = async (req, res) => {
  try {
    const commandes = await prisma.commande.findMany({
      where: { utilisateurId: req.utilisateurId },
      include: {
        client: true,
        lignesCommande: { include: { produit: true } },
        paiements: true
      },
      orderBy: { dateLivraison: 'asc' }
    })

    const items = commandes.map(c => ({
      id:            c.id,
      client:        c.client.nom,
      clientId:      c.clientId,
      commande:      c.lignesCommande.map(l => `${l.produit.nom} ×${l.quantite}`).join(', '),
      date:          c.dateLivraison?.toISOString().split('T')[0] ?? null,
      date_livraison:c.dateLivraison?.toISOString().split('T')[0] ?? null,
      montant:       Number(c.montantTotal),
      entrees:       c.paiements.reduce((total, paiement) => total + Number(paiement.montant), 0),
      statut:        STATUT_FR[c.statut] ?? c.statut,
      notes:         c.notes,
    }))

    res.json({ items })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
  }
}

// POST /api/commandes
export const creerCommande = async (req, res) => {
  // Support deux formats:
  // 1. Complexe: { clientId, dateLivraison, notes, lignes: [...] }
  // 2. Simple (du frontend): { client, commande, date_livraison, montant_total }

  const { clientId, dateLivraison, notes, lignes, client, commande, date_livraison, montant_total } = req.body

  try {
    // D'abord le format complexe (avec lignes)
    if (lignes && Array.isArray(lignes)) {
      if (!clientId && !client?.trim()) {
        return res.status(400).json({ message: 'Client requis pour une commande avec lignes' })
      }

      const lignesNormalisees = lignes.map(l => ({
        produitId: l.produitId,
        quantite: Number(l.quantite),
        prixUnitaire: Number(l.prixUnitaire),
      }))

      const produits = await prisma.produit.findMany({
        where: {
          utilisateurId: req.utilisateurId,
          id: { in: lignesNormalisees.map(l => l.produitId) }
        },
        include: {
          ingredients: { include: { stockArticle: true } }
        }
      })

      if (produits.length !== lignesNormalisees.length) {
        return res.status(400).json({ message: 'Un ou plusieurs produits sont introuvables' })
      }

      const besoinsStock = new Map()
      for (const ligne of lignesNormalisees) {
        const produit = produits.find(p => p.id === ligne.produitId)
        for (const ingredient of produit.ingredients) {
          const besoin = Number(ingredient.quantite) * ligne.quantite
          besoinsStock.set(
            ingredient.stockArticleId,
            (besoinsStock.get(ingredient.stockArticleId) ?? 0) + besoin
          )
        }
      }

      for (const [stockArticleId, besoin] of besoinsStock.entries()) {
        const article = await prisma.stockArticle.findFirst({
          where: { id: stockArticleId, utilisateurId: req.utilisateurId }
        })

        if (!article) {
          return res.status(400).json({ message: 'Article de stock introuvable' })
        }

        if (Number(article.quantite) < besoin) {
          return res.status(400).json({
            message: `Stock insuffisant pour ${article.nom}`,
            article: article.nom,
            disponible: Number(article.quantite),
            requis: besoin
          })
        }
      }

      const montantTotalCalcul = lignesNormalisees.reduce(
        (acc, l) => acc + l.quantite * l.prixUnitaire, 0
      )

      const clientNom = client?.trim() || ''
      let clientRecord = clientId
        ? await prisma.client.findFirst({ where: { id: clientId, utilisateurId: req.utilisateurId } })
        : await prisma.client.findFirst({ where: { utilisateurId: req.utilisateurId, nom: clientNom } })

      if (!clientRecord) {
        if (!clientNom) {
          return res.status(400).json({ message: 'Client introuvable' })
        }
        clientRecord = await prisma.client.create({
          data: {
            utilisateurId: req.utilisateurId,
            nom: clientNom
          }
        })
      }

      const nouvelleCommande = await prisma.commande.create({
        data: {
          utilisateurId: req.utilisateurId,
          clientId: clientRecord.id,
          dateLivraison: dateLivraison ? new Date(dateLivraison) : (date_livraison ? new Date(date_livraison) : null),
          montantTotal: montantTotalCalcul,
          notes: notes ?? commande,
          lignesCommande: {
            create: lignesNormalisees.map(l => ({
              produitId: l.produitId,
              quantite: l.quantite,
              prixUnitaire: l.prixUnitaire,
            }))
          }
        },
        include: { client: true, lignesCommande: { include: { produit: true } } }
      })

      return res.status(201).json(nouvelleCommande)
    }

    // Sinon, format simple
    if (!client || !client.trim()) {
      return res.status(400).json({ message: 'Client requis' })
    }

    let clientRecord = await prisma.client.findFirst({
      where: {
        utilisateurId: req.utilisateurId,
        nom: client.trim()
      }
    })

    if (!clientRecord) {
      clientRecord = await prisma.client.create({
        data: {
          nom: client.trim(),
          utilisateurId: req.utilisateurId
        }
      })
    }

    const nouvelleCommande = await prisma.commande.create({
      data: {
        utilisateurId: req.utilisateurId,
        clientId: clientRecord.id,
        dateLivraison: date_livraison ? new Date(date_livraison) : (dateLivraison ? new Date(dateLivraison) : null),
        montantTotal: parseFloat(montant_total) || 0,
        notes: commande,
        statut: 'en_attente'
      },
      include: { client: true }
    })

    return res.status(201).json(nouvelleCommande)
  } catch (err) {
    console.error('[creerCommande]', err)
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
  }
}

// PUT /api/commandes/:id/statut  → changer le statut depuis le sélecteur
export const changerStatut = async (req, res) => {
  const { id } = req.params
  const { statut } = req.body
  try {
    const statutDb = STATUT_DB[statut] ?? 'en_attente'
    const commandeActuelle = await prisma.commande.findUnique({
      where: { id },
      include: {
        lignesCommande: {
          include: {
            produit: {
              include: {
                ingredients: {
                  include: { stockArticle: true }
                }
              }
            }
          }
        }
      }
    })

    if (!commandeActuelle) {
      return res.status(404).json({ message: 'Commande introuvable' })
    }

    if (commandeActuelle.utilisateurId !== req.utilisateurId) {
      return res.status(404).json({ message: 'Commande introuvable' })
    }

    const motifCommande = `Commande #${id.slice(0, 8)}`
    const mouvementDejaEnregistre = await prisma.mouvementStock.count({
      where: { motif: { contains: motifCommande } }
    })
    const paiementDejaEnregistre = await prisma.paiement.count({
      where: { commandeId: id }
    })
    const doitDebiterStock = (statutDb === 'prete' || statutDb === 'livree') && mouvementDejaEnregistre === 0

    await prisma.$transaction(async (tx) => {
      if (doitDebiterStock) {
        for (const ligne of commandeActuelle.lignesCommande) {
          for (const ingredient of ligne.produit.ingredients) {
            const quantiteConsommee = Number(ingredient.quantite) * Number(ligne.quantite)

            await tx.stockArticle.update({
              where: { id: ingredient.stockArticleId },
              data: { quantite: { decrement: quantiteConsommee } }
            })

            await tx.mouvementStock.create({
              data: {
                stockArticleId: ingredient.stockArticleId,
                quantite: quantiteConsommee,
                type: 'sortie',
                motif: `${motifCommande} prête`
              }
            })
          }
        }
      }

      if (statutDb === 'livree' && paiementDejaEnregistre === 0) {
        await tx.paiement.create({
          data: {
            commandeId: id,
            montant: Number(commandeActuelle.montantTotal),
            methode: 'cash',
            datePaiement: new Date()
          }
        })
      }

      await tx.commande.update({
        where: { id },
        data: { statut: statutDb }
      })
    })

    res.json({ message: 'Statut mis à jour' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
  }
}

// DELETE /api/commandes/:id
export const supprimerCommande = async (req, res) => {
  const { id } = req.params
  try {
    await prisma.commande.deleteMany({ where: { id, utilisateurId: req.utilisateurId } })
    res.json({ message: 'Commande supprimée' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
  }
}
