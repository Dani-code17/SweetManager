const fs = require('fs');

const file = 'c:/SweetManager/SweetManager/frontend/src/pages/TableauDeBord.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Rewrite Sidebar Navigation
const oldSidebarNavMarkerStart = `<nav className="flex-1 space-y-2">`;
const oldSidebarNavMarkerEnd = `</nav>`;
const sidebarNavStartIndex = content.indexOf(oldSidebarNavMarkerStart);
const sidebarNavEndIndex = content.indexOf(oldSidebarNavMarkerEnd) + oldSidebarNavMarkerEnd.length;

if (sidebarNavStartIndex !== -1 && sidebarNavEndIndex !== -1) {
  const newSidebarNav = `<nav className="flex-1 space-y-2">
          {[
            { id: 'dashboard', icon: 'dashboard', label: 'Tableau de bord' },
            { id: 'finances', icon: 'payments', label: 'Finances' },
            { id: 'commandes', icon: 'shopping_bag', label: 'Commandes' },
            { id: 'stock', icon: 'inventory_2', label: 'Stock' },
            { id: 'produits', icon: 'cake', label: 'Produits' },
            { id: 'stats', icon: 'analytics', label: 'Statistiques' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => { setPage(item.id); if (window.innerWidth < 768) setSidebarOpen(false); }}
              className={\`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md transition-all duration-300 \${
                page === item.id || (page === 'finances' && item.id === 'finances')
                  ? 'bg-secondary-container dark:bg-on-secondary-fixed-variant text-on-secondary-container dark:text-secondary-fixed border-l-4 border-primary translate-x-1'
                  : 'text-on-surface-variant dark:text-outline hover:text-primary hover:bg-surface-container-highest dark:hover:bg-surface-variant'
              }\`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>`;
  content = content.substring(0, sidebarNavStartIndex) + newSidebarNav + content.substring(sidebarNavEndIndex);
} else {
  console.log("Failed to replace sidebar nav.");
}

// 2. Fix Sidebar Responsiveness
// Replace the aside definition
const oldAsideDef = `<aside className={\`fixed left-0 top-0 h-full flex flex-col p-md bg-surface-container-low dark:bg-inverse-surface border-r border-outline-variant/30 dark:border-outline/20 w-64 z-50 transition-transform duration-300 \${`;
const newAsideDef = `<aside className={\`fixed md:relative left-0 top-0 h-full md:h-screen flex flex-col p-md bg-surface-container-low dark:bg-inverse-surface border-r border-outline-variant/30 dark:border-outline/20 w-64 z-50 transition-transform duration-300 flex-shrink-0 \${`;
content = content.replace(oldAsideDef, newAsideDef);

// Replace "New Order" and "Settings"
content = content.replace(`<span>New Order</span>`, `<span>Nouvelle commande</span>`);
content = content.replace(`<span>Settings</span>`, `<span>Paramètres</span>`);

fs.writeFileSync(file, content);
console.log("Sidebar updated.");
