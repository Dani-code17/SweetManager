-- CreateEnum
CREATE TYPE "StatutCommande" AS ENUM ('en_attente', 'preparation', 'prete', 'livree', 'annulee');

-- CreateEnum
CREATE TYPE "MethodePaiement" AS ENUM ('cash', 'orange_money', 'mtn_money', 'wave', 'banque');

-- CreateEnum
CREATE TYPE "TypeMouvementStock" AS ENUM ('entree', 'sortie');

-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" TEXT NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "motDePasseHash" VARCHAR(255) NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "nom" VARCHAR(150) NOT NULL,
    "telephone" VARCHAR(30),
    "email" VARCHAR(255),
    "adresse" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produit" (
    "id" TEXT NOT NULL,
    "nom" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "prix" DECIMAL(10,2) NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Produit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commande" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "statut" "StatutCommande" NOT NULL DEFAULT 'en_attente',
    "dateLivraison" TIMESTAMP(3),
    "montantTotal" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Commande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LigneCommande" (
    "id" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prixUnitaire" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "LigneCommande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paiement" (
    "id" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "montant" DECIMAL(10,2) NOT NULL,
    "methode" "MethodePaiement" NOT NULL,
    "datePaiement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Paiement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Depense" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "montant" DECIMAL(10,2) NOT NULL,
    "categorie" VARCHAR(100) NOT NULL,
    "fournisseur" VARCHAR(150),
    "description" TEXT,
    "dateDepense" DATE NOT NULL,
    "recuUrl" VARCHAR(500),
    "modePaiement" VARCHAR(50),
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Depense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockArticle" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "nom" VARCHAR(150) NOT NULL,
    "categorie" VARCHAR(100),
    "quantite" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "unite" VARCHAR(30) NOT NULL,
    "seuilAlerte" DECIMAL(10,3),
    "misAJourLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MouvementStock" (
    "id" TEXT NOT NULL,
    "stockArticleId" TEXT NOT NULL,
    "quantite" DECIMAL(10,3) NOT NULL,
    "type" "TypeMouvementStock" NOT NULL,
    "motif" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MouvementStock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- CreateIndex
CREATE INDEX "Utilisateur_email_idx" ON "Utilisateur"("email");

-- CreateIndex
CREATE INDEX "Commande_clientId_idx" ON "Commande"("clientId");

-- CreateIndex
CREATE INDEX "Commande_statut_idx" ON "Commande"("statut");

-- CreateIndex
CREATE INDEX "LigneCommande_commandeId_idx" ON "LigneCommande"("commandeId");

-- CreateIndex
CREATE INDEX "LigneCommande_produitId_idx" ON "LigneCommande"("produitId");

-- CreateIndex
CREATE INDEX "Paiement_commandeId_idx" ON "Paiement"("commandeId");

-- CreateIndex
CREATE INDEX "Depense_utilisateurId_idx" ON "Depense"("utilisateurId");

-- CreateIndex
CREATE INDEX "Depense_categorie_idx" ON "Depense"("categorie");

-- CreateIndex
CREATE INDEX "StockArticle_utilisateurId_idx" ON "StockArticle"("utilisateurId");

-- CreateIndex
CREATE INDEX "StockArticle_nom_idx" ON "StockArticle"("nom");

-- CreateIndex
CREATE INDEX "MouvementStock_stockArticleId_idx" ON "MouvementStock"("stockArticleId");

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LigneCommande" ADD CONSTRAINT "LigneCommande_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LigneCommande" ADD CONSTRAINT "LigneCommande_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Produit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paiement" ADD CONSTRAINT "Paiement_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Depense" ADD CONSTRAINT "Depense_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockArticle" ADD CONSTRAINT "StockArticle_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MouvementStock" ADD CONSTRAINT "MouvementStock_stockArticleId_fkey" FOREIGN KEY ("stockArticleId") REFERENCES "StockArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
