import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

const TAUX_DE_CHANGE = {
  EUR: 1,
  FCFA: 655.957,
  USD: 1.08
}

function getTauxConversion(ancienne, nouvelle) {
  if (ancienne === nouvelle) return 1;
  const t1 = TAUX_DE_CHANGE[ancienne] || 1;
  const t2 = TAUX_DE_CHANGE[nouvelle] || 1;
  return t2 / t1;
}

const profilPublic = (u) => ({
  id: u.id,
  nom: u.nom,
  email: u.email,
  nomBoutique: u.nomBoutique ?? '',
  telephone: u.telephone ?? '',
  devise: u.devise ?? 'FCFA',
  seuilAlerteDefaut: Number(u.seuilAlerteDefaut ?? 5),
})

export const inscrire = async (req, res) => {
  const { nom, email, motDePasse } = req.body
  try {
    const existant = await prisma.utilisateur.findUnique({ where: { email } })
    if (existant) return res.status(400).json({ message: 'Email déjà utilisé' })

    const motDePasseHash = await bcrypt.hash(motDePasse, 12)
    const utilisateur = await prisma.utilisateur.create({
      data: { nom, email, motDePasseHash }
    })
    res.status(201).json({ message: 'Compte créé avec succès', id: utilisateur.id })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
  }
}

export const connecter = async (req, res) => {
  const { email, motDePasse } = req.body
  try {
    const utilisateur = await prisma.utilisateur.findUnique({ where: { email } })
    if (!utilisateur) return res.status(401).json({ message: 'Identifiants incorrects' })

    const valide = await bcrypt.compare(motDePasse, utilisateur.motDePasseHash)
    if (!valide) return res.status(401).json({ message: 'Identifiants incorrects' })

    const token = jwt.sign({ utilisateurId: utilisateur.id }, process.env.JWT_SECRET, { expiresIn: '24h' })
    res.json({ token, utilisateur: profilPublic(utilisateur) })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
  }
}

export const getProfil = async (req, res) => {
  try {
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: req.utilisateurId },
    })
    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur introuvable' })
    res.json(profilPublic(utilisateur))
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
  }
}

export const modifierProfil = async (req, res) => {
  const { nom, nomBoutique, telephone, devise, seuilAlerteDefaut } = req.body
  try {
    if (nom !== undefined && !String(nom).trim()) {
      return res.status(400).json({ message: 'Le nom du responsable est obligatoire' })
    }

    const utilisateurExistant = await prisma.utilisateur.findUnique({ where: { id: req.utilisateurId } })
    if (!utilisateurExistant) return res.status(404).json({ message: 'Utilisateur introuvable' })

    const ancienneDevise = utilisateurExistant.devise || 'FCFA'
    const nouvelleDevise = devise !== undefined ? (String(devise).trim() || 'FCFA') : ancienneDevise

    const utilisateur = await prisma.utilisateur.update({
      where: { id: req.utilisateurId },
      data: {
        ...(nom !== undefined && { nom: String(nom).trim() }),
        ...(nomBoutique !== undefined && { nomBoutique: String(nomBoutique).trim() || null }),
        ...(telephone !== undefined && { telephone: String(telephone).trim() || null }),
        ...(devise !== undefined && { devise: nouvelleDevise }),
        ...(seuilAlerteDefaut !== undefined && {
          seuilAlerteDefaut: Math.max(0, Number(seuilAlerteDefaut) || 0),
        }),
      },
    })

    if (ancienneDevise !== nouvelleDevise) {
      const taux = getTauxConversion(ancienneDevise, nouvelleDevise)
      
      await prisma.$transaction([
        prisma.$executeRaw`UPDATE "Produit" SET prix = prix * ${taux} WHERE "utilisateurId" = ${req.utilisateurId}`,
        prisma.$executeRaw`UPDATE "Depense" SET montant = montant * ${taux} WHERE "utilisateurId" = ${req.utilisateurId}`,
        prisma.$executeRaw`UPDATE "Commande" SET "montantTotal" = "montantTotal" * ${taux} WHERE "utilisateurId" = ${req.utilisateurId}`,
        prisma.$executeRaw`
          UPDATE "LigneCommande" 
          SET "prixUnitaire" = "prixUnitaire" * ${taux} 
          FROM "Commande" 
          WHERE "LigneCommande"."commandeId" = "Commande".id 
          AND "Commande"."utilisateurId" = ${req.utilisateurId}
        `,
        prisma.$executeRaw`
          UPDATE "Paiement" 
          SET montant = montant * ${taux} 
          FROM "Commande" 
          WHERE "Paiement"."commandeId" = "Commande".id 
          AND "Commande"."utilisateurId" = ${req.utilisateurId}
        `
      ])
    }

    res.json({ message: 'Profil mis à jour', utilisateur: profilPublic(utilisateur) })
  } catch (err) {
    console.error('[modifierProfil]', err)
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Utilisateur introuvable. Reconnectez-vous.' })
    }
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
  }
}