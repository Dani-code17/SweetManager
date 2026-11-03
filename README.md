# 🍬 SweetManager

> Application de gestion pour artisans pâtissiers et chocolatiers : **commandes, stock,
> finances et statistiques** dans un seul tableau de bord.
> *Projet client — développé de A à Z (modèle de données, API, interface, déploiement).*

**🇫🇷 Français** · [🇬🇧 English](#-english)

---

## Le problème

Un artisan pâtissier gère ses commandes sur WhatsApp, son stock de tête et ses finances sur
un cahier. Résultat : ruptures d'ingrédients en pleine production, marges inconnues, et
impayés qui se perdent. **SweetManager** remplace ces trois outils par une application unique.

## Fonctionnalités

| Domaine | Ce qui est couvert |
|---|---|
| **Commandes** | Cycle de vie complet — `en_attente` → `preparation` → `prete` → `livree` (+ `annulee`), date de livraison, notes, lignes de commande avec prix figé à la vente |
| **Clients** | Fiche client (nom, téléphone, email, adresse) rattachée à l'historique des commandes |
| **Produits & recettes** | Catalogue produits (prix, catégorie, photo) + **nomenclature** : chaque produit déclare les ingrédients et quantités consommés |
| **Stock** | Articles avec unité et **seuil d'alerte**, journal des mouvements (`entree` / `sortie`) |
| **Encaissements** | Paiements multi-moyens : `cash`, `orange_money`, `mtn_money`, `wave`, `banque` |
| **Dépenses** | Catégorie, fournisseur, justificatif, mode de paiement |
| **Tableau de bord** | Indicateurs et graphiques (Recharts) : chiffre d'affaires, dépenses, marges |
| **PDF** | Génération du **bon de commande** côté serveur (PDFKit) |
| **Multi-comptes** | Chaque artisan ne voit **que ses propres** clients, produits, commandes et stocks |

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 19 + Vite + TailwindCSS v4 + React Router 7 + Recharts |
| Backend | Node.js + Express 5 (ESM) |
| Base de données | PostgreSQL via **Prisma ORM** |
| Auth | JWT + **bcrypt** |
| PDF | PDFKit |

## Architecture

```
SweetManager/
├── backend/
│   ├── src/
│   │   ├── app.js               Point d'entrée Express, CORS, montage des routes
│   │   ├── routes/              auth, clients, produits, commandes, stock, depenses, recettes, pdf
│   │   ├── controllers/         Logique métier
│   │   └── middlewares/         proteger() : vérification du JWT
│   └── prisma/schema.prisma     Modèles, enums métier, index et contraintes d'unicité
└── frontend/
    └── src/
        ├── pages/               Connexion, Inscription, TableauDeBord, Depenses
        ├── components/          RouteProtegee (guard de routes)
        ├── context/             AuthContext
        └── hooks/               useDashboard
```

### Modèle de données (extrait)

`Utilisateur` **1—N** `Client`, `Produit`, `Commande`, `Depense`, `StockArticle`
· `Commande` **1—N** `LigneCommande`, `Paiement`
· `Produit` **N—N** `StockArticle` via `RecetteFabrication` (quantité consommée par unité vendue)
· `StockArticle` **1—N** `MouvementStock`

### API REST

| Préfixe | Contenu |
|---|---|
| `/api/auth` | Inscription, connexion, jeton |
| `/api/clients` | CRUD clients |
| `/api/produits` | CRUD produits |
| `/api/commandes` | CRUD commandes + lignes |
| `/api/stock` | Articles et mouvements |
| `/api/depenses` · `/api/recettes` | Dépenses, recettes |
| `/api/pdf/commande/:id` | Bon de commande PDF *(protégé)* |
| `/api/ping` | Sonde de santé |

> Toutes les routes métier passent par le middleware `proteger` : sans `Authorization: Bearer <token>`
> valide, la requête est rejetée.

## Développement local

```bash
git clone https://github.com/Dani-code17/SweetManager.git
cd SweetManager

# Backend
cd backend
cp .env.example .env          # DATABASE_URL, JWT_SECRET, PORT, FRONTEND_URL
npm install
npx prisma migrate dev
npm run dev                   # http://localhost:5000

# Frontend (autre terminal)
cd frontend
cp .env.example .env          # VITE_API_URL=http://localhost:5000
npm install
npm run dev                   # http://localhost:5173
```

## Déploiement

**Option 1 — un seul serveur (ex. Render)** : Express sert le build Vite depuis
`frontend/dist`.

- Build : `cd frontend && npm install && npm run build && cd ../backend && npm install`
- Start : `cd backend && npm start`
- Variables : `DATABASE_URL`, `JWT_SECRET`, `PORT`, `FRONTEND_URL`

**Option 2 — séparé (ex. Vercel + Railway)** : frontend sur Vercel
(`VITE_API_URL` = URL du backend, output `dist`), backend sur Railway (`npm start`).

> Le CORS n'autorise que `localhost:5173/4173` et l'URL déclarée dans `FRONTEND_URL`.

---

## 🇬🇧 English

**SweetManager** is a business management application for pastry chefs and chocolatiers:
**orders, inventory, finances and analytics** in a single dashboard.
*Client project — designed and built end to end (data model, API, UI, deployment).*

- **Orders** with a full lifecycle (`pending → preparing → ready → delivered / cancelled`),
  delivery dates and line items snapshotting the sale price.
- **Inventory** with units, **low-stock thresholds** and a full movement log (in/out).
- **Recipes (bill of materials)**: each product maps to the ingredients it consumes.
- **Payments** across cash, Orange Money, MTN Money, Wave and bank transfer; **expenses**
  with category, supplier and receipt.
- **Dashboard** with KPIs and charts; **PDF order slips** generated server-side.
- **Multi-tenant by design**: every artisan only ever queries their own records.

**Stack:** React 19 · Vite · TailwindCSS v4 · Recharts — Node.js · Express 5 — PostgreSQL ·
Prisma ORM — JWT + bcrypt — PDFKit.

**Author:** Yeo Daniel — [github.com/Dani-code17](https://github.com/Dani-code17)
