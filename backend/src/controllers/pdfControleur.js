import PDFDocument from 'pdfkit'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const genererBonCommande = async (req, res) => {
  const { id } = req.params

  try {
    const commande = await prisma.commande.findUnique({
      where: { id },
      include: {
        client: true,
        lignesCommande: { include: { produit: true } }
      }
    })

    if (!commande) return res.status(404).json({ message: 'Commande introuvable' })

    const doc = new PDFDocument({ margin: 50 })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=bon-commande-${id.slice(0, 8)}.pdf`)
    doc.pipe(res)

    // En-tête
    doc.fontSize(20).font('Helvetica-Bold').text('SweetManager', 50, 50)
    doc.fontSize(10).font('Helvetica').fillColor('#888').text('Pâtisserie artisanale', 50, 75)
    doc.fillColor('#000')

    // Titre
    doc.moveDown(2)
    doc.fontSize(16).font('Helvetica-Bold').text('BON DE COMMANDE', { align: 'center' })
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica').fillColor('#888').text(`Référence : #${id.slice(0, 8).toUpperCase()}`, { align: 'center' })
    doc.fillColor('#000')

    // Ligne séparatrice
    doc.moveDown(1)
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#ddd').stroke()
    doc.moveDown(1)

    // Infos client
    doc.fontSize(11).font('Helvetica-Bold').text('CLIENT')
    doc.moveDown(0.3)
    doc.fontSize(10).font('Helvetica').text(`Nom : ${commande.client.nom}`)
    if (commande.client.telephone) doc.text(`Téléphone : ${commande.client.telephone}`)
    if (commande.client.email) doc.text(`Email : ${commande.client.email}`)

    doc.moveDown(1)

    // Infos commande
    doc.fontSize(11).font('Helvetica-Bold').text('DÉTAILS COMMANDE')
    doc.moveDown(0.3)
    doc.fontSize(10).font('Helvetica')
    doc.text(`Date de création : ${new Date(commande.creeLe).toLocaleDateString('fr-FR')}`)
    if (commande.dateLivraison) doc.text(`Date de livraison : ${new Date(commande.dateLivraison).toLocaleDateString('fr-FR')}`)
    doc.text(`Statut : ${commande.statut.replace('_', ' ')}`)
    if (commande.notes) doc.text(`Notes : ${commande.notes}`)

    doc.moveDown(1)

    // Tableau produits
    doc.fontSize(11).font('Helvetica-Bold').text('PRODUITS')
    doc.moveDown(0.5)

    // En-têtes tableau
    const colX = { produit: 50, qte: 300, prix: 370, total: 460 }
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#555')
    doc.text('Produit', colX.produit, doc.y)
    doc.text('Qté', colX.qte, doc.y - 12)
    doc.text('Prix unit.', colX.prix, doc.y - 12)
    doc.text('Total', colX.total, doc.y - 12)
    doc.fillColor('#000')

    doc.moveDown(0.3)
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#ddd').stroke()
    doc.moveDown(0.3)

    // Lignes produits
    let totalGeneral = 0
    for (const ligne of commande.lignesCommande) {
      const total = Number(ligne.prixUnitaire) * ligne.quantite
      totalGeneral += total
      const y = doc.y
      doc.fontSize(9).font('Helvetica')
      doc.text(ligne.produit.nom, colX.produit, y, { width: 230 })
      doc.text(String(ligne.quantite), colX.qte, y)
      doc.text(`${Number(ligne.prixUnitaire).toLocaleString()} FCFA`, colX.prix, y)
      doc.text(`${total.toLocaleString()} FCFA`, colX.total, y)
      doc.moveDown(0.8)
    }

    // Total
    doc.moveDown(0.5)
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#ddd').stroke()
    doc.moveDown(0.5)
    doc.fontSize(11).font('Helvetica-Bold')
    doc.text(`TOTAL : ${totalGeneral.toLocaleString()} FCFA`, { align: 'right' })

    // Pied de page
    doc.moveDown(3)
    doc.fontSize(8).font('Helvetica').fillColor('#aaa').text('Merci pour votre confiance — SweetManager', { align: 'center' })

    doc.end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur génération PDF', erreur: err.message })
  }
}