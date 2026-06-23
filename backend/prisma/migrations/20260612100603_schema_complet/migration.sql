/*
  Warnings:

  - Added the required column `utilisateurId` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `utilisateurId` to the `Commande` table without a default value. This is not possible if the table is not empty.
  - Added the required column `utilisateurId` to the `Produit` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CanalVente" AS ENUM ('boutique', 'livraison', 'commande_speciale');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "utilisateurId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Commande" ADD COLUMN     "utilisateurId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Produit" ADD COLUMN     "categorie" VARCHAR(100),
ADD COLUMN     "photo" TEXT,
ADD COLUMN     "utilisateurId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "RecetteFabrication" (
    "id" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "stockArticleId" TEXT NOT NULL,
    "quantite" DECIMAL(10,3) NOT NULL,

    CONSTRAINT "RecetteFabrication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecetteFabrication_produitId_idx" ON "RecetteFabrication"("produitId");

-- CreateIndex
CREATE UNIQUE INDEX "RecetteFabrication_produitId_stockArticleId_key" ON "RecetteFabrication"("produitId", "stockArticleId");

-- CreateIndex
CREATE INDEX "Client_utilisateurId_idx" ON "Client"("utilisateurId");

-- CreateIndex
CREATE INDEX "Commande_utilisateurId_idx" ON "Commande"("utilisateurId");

-- CreateIndex
CREATE INDEX "Produit_utilisateurId_idx" ON "Produit"("utilisateurId");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produit" ADD CONSTRAINT "Produit_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecetteFabrication" ADD CONSTRAINT "RecetteFabrication_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Produit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecetteFabrication" ADD CONSTRAINT "RecetteFabrication_stockArticleId_fkey" FOREIGN KEY ("stockArticleId") REFERENCES "StockArticle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
