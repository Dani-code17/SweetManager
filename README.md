# 🍬 SweetManager

Application de gestion complète pour les artisans pâtissiers et chocolatiers — finances, stock, commandes et statistiques.

---

## ⚙️ Stack Technique

| Couche | Technologie |
|---|---|
| Frontend | React + Vite + TailwindCSS v4 |
| Backend | Node.js + Express |
| Base de données | PostgreSQL (via Prisma ORM) |
| Auth | JWT |

---

## 🚀 Déploiement

### Option 1 — Backend + Frontend sur le même serveur (ex: Render)

Le backend Express sert automatiquement le build du frontend depuis `frontend/dist`.

**Build command :**
```
cd frontend && npm install && npm run build && cd ../backend && npm install
```

**Start command :**
```
cd backend && npm start
```

**Variables d'environnement à définir sur la plateforme :**

| Variable | Description | Exemple |
|---|---|---|
| `DATABASE_URL` | URL complète PostgreSQL | `postgresql://user:pass@host/db` |
| `JWT_SECRET` | Clé secrète JWT | `une_longue_chaine_aleatoire` |
| `PORT` | Port (Render le fournit automatiquement) | `5000` |
| `FRONTEND_URL` | URL de votre app (pour CORS) | `https://mon-app.onrender.com` |

> ⚠️ En mode "backend seul", la variable `VITE_API_URL` n'est pas nécessaire car le frontend et le backend partagent la même URL.

---

### Option 2 — Frontend et Backend séparés (ex: Vercel + Railway)

**Frontend (Vercel) :**
- Framework : `Vite`
- Build Command : `npm run build`
- Output Directory : `dist`
- Variable d'env : `VITE_API_URL=https://votre-backend.railway.app`

**Backend (Railway) :**
- Start Command : `npm start`
- Variables d'env : voir tableau ci-dessus

---

## 💻 Développement Local

### 1. Cloner le repo

```bash
git clone https://github.com/votre-user/sweetmanager.git
cd sweetmanager
```

### 2. Configurer le Backend

```bash
cd backend
cp .env.example .env
# Remplir .env avec vos valeurs
npm install
npx prisma migrate dev
npm run dev
```

### 3. Configurer le Frontend

```bash
cd frontend
cp .env.example .env
# .env : VITE_API_URL=http://localhost:5000
npm install
npm run dev
```

L'app sera disponible sur [http://localhost:5173](http://localhost:5173).

---

## 📁 Structure

```
sweetmanager/
├── backend/
│   ├── src/
│   │   ├── app.js          # Point d'entrée Express
│   │   ├── routes/         # Routes API
│   │   └── middlewares/    # Auth JWT, etc.
│   ├── prisma/
│   │   └── schema.prisma   # Schéma base de données
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/          # Connexion, Inscription, TableauDeBord
│   │   ├── components/     # Composants réutilisables
│   │   ├── context/        # AuthContext
│   │   └── hooks/          # useDashboard, etc.
│   └── .env.example
└── README.md
```
