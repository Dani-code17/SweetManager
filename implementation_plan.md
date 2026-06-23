# Intégration du nouveau Design System

Ce plan détaille la marche à suivre pour intégrer la magnifique maquette fournie dans votre application React existante, afin que `TableauDeBord.jsx` reprenne exactement le rendu visuel du design.

## Modifications proposées

### 1. Fichiers de configuration globaux
* **`tailwind.config.js`** : J'ajouterai la palette de couleurs complexes (les tons `primary`, `surface-bright`, etc.), les espacements, les polices et tailles de texte personnalisées pour correspondre exactement à votre design.
* **`index.html`** : J'intégrerai les balises `<link>` pour télécharger les nouvelles polices (Outfit, EB Garamond) et les icônes (Material Symbols Outlined).
* **`index.css`** : J'ajouterai vos classes CSS sur mesure telles que `.glass-card`, `.satin-button`, les animations (`.stagger-in`) et le style de barre de défilement personnalisé (`.custom-scrollbar`).

### 2. Refonte du Layout (TableauDeBord.jsx)
Je vais restructurer le composant principal `TableauDeBord.jsx` :
* **Barre latérale (Sidebar)** : Remplacer l'ancienne sidebar par la nouvelle structure incluant le badge SweetManager et les liens mis à jour avec les icônes Material.
* **En-tête (TopNavBar)** : Remplacer l'ancienne topbar par la vôtre, avec le profil stylisé et les contrôles associés.
* **Mode Sombre** : Intégration correcte de la logique de thème sombre via Tailwind (classe `dark` sur l'élément HTML).

### 3. Vues (Dashboard et Finances)
Je vais brancher vos données réelles (les hooks React, `recettes`, `depenses`, `stock`, etc.) dans les nouvelles vues HTML fournies :
* **Vue Tableau de bord** : Les cartes KPI (Chiffre d'Affaires, Commandes du jour, Stock Critique, Dépenses Mensuelles), la simulation graphique des ventes, et le tableau des "Commandes Récentes".
* **Vue Finances** : Les cartes de résumé financier (Revenue, Expenses, Net Profit), la répartition visuelle par catégorie et le tableau détaillé des "Transactions Récentes".
* Je veillerai à conserver toute la logique métier fonctionnelle (ouverture des modales pour de nouvelles dépenses, boutons cliquables).

## User Review Required

> [!IMPORTANT]
> - Le nouveau design utilise des icônes Google Material Symbols à la place des icônes Tabler (`@tabler/icons-react`) que vous utilisiez auparavant. Je vais procéder à ce remplacement. Êtes-vous d'accord ?
> - Actuellement, la maquette fournit le design de l'accueil (Dashboard) et de la partie Finances. Je vais adapter l'architecture de votre page pour inclure ces deux designs. Pour les autres pages (Stock, Produits, Paramètres), je réutiliserai les principes graphiques de la maquette (boutons Satin, glass-cards, etc.) pour qu'elles s'intègrent au nouveau look.

Une fois que vous validez ce plan, je commencerai à écrire le code !
