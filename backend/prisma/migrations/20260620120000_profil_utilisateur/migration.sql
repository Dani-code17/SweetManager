-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "nomBoutique" VARCHAR(150),
ADD COLUMN     "telephone" VARCHAR(30),
ADD COLUMN     "devise" VARCHAR(10) NOT NULL DEFAULT 'FCFA',
ADD COLUMN     "seuilAlerteDefaut" DECIMAL(10,3) NOT NULL DEFAULT 5;
