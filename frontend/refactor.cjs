const fs = require('fs');

const file = 'c:/SweetManager/SweetManager/frontend/src/pages/TableauDeBord.jsx';
let content = fs.readFileSync(file, 'utf8');

// I am rewriting the dashboard section with the new glass-card look.
// I will just construct the new chunk and replace from `{page === 'dashboard' && (` to `)}` before `{page === 'finances' && (`.

const startMarker = "{page === 'dashboard' && (";
const endMarker = "{page === 'finances' && (";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if(startIndex !== -1 && endIndex !== -1) {
  const newDashboard = `{page === 'dashboard' && (
            <div className="space-y-gutter stagger-in">
              {/* Welcome Message */}
              <section className="mb-8" style={{ animationDelay: '0.1s' }}>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Bonjour, {utilisateur?.nom ?? 'Chef'}</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">Voici l'état actuel de votre boutique aujourd'hui.</p>
              </section>

              {/* KPI Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-8">
                {/* Revenue KPI */}
                <div className="glass-card p-md rounded-xl shadow-sm hover:shadow-lg transition-all duration-500 group" onClick={() => { setPage('finances'); setFinTab('recettes'); setFinOpen(true); }} style={{ cursor: 'pointer', animationDelay: '0.2s' }}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-secondary-fixed rounded-lg text-on-secondary-fixed-variant">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                    </div>
                  </div>
                  <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Chiffre d'Affaires</h3>
                  <p className="font-display-lg text-[32px] text-primary leading-tight">{afficherMontant(recettes.total)}</p>
                </div>

                {/* Daily Orders KPI */}
                <div className="glass-card p-md rounded-xl shadow-sm hover:shadow-lg transition-all duration-500" onClick={() => navTo('commandes')} style={{ cursor: 'pointer', animationDelay: '0.3s' }}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-primary-fixed rounded-lg text-on-primary-fixed-variant">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_cart</span>
                    </div>
                  </div>
                  <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Commandes du Jour</h3>
                  <p className="font-display-lg text-[32px] text-on-surface leading-tight">{commandes.reduce((acc, c) => acc + (c.date === new Date().toISOString().split('T')[0] ? 1 : 0), 0) || prochainesCommandes.length}</p>
                </div>

                {/* Critical Stock KPI */}
                <div className="glass-card p-md rounded-xl shadow-sm hover:shadow-lg border-l-4 border-error transition-all duration-500" onClick={() => navTo('stock')} style={{ cursor: 'pointer', animationDelay: '0.4s' }}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-error-container rounded-lg text-on-error-container">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                    </div>
                    {alertesStock.length > 0 && <span className="text-[10px] font-bold text-error border border-error/20 px-2 py-0.5 rounded-full uppercase">Urgent</span>}
                  </div>
                  <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Stock Critique</h3>
                  <p className="font-display-lg text-[32px] text-error leading-tight">{alertesStock.length} Items</p>
                </div>

                {/* Expenses KPI */}
                <div className="glass-card p-md rounded-xl shadow-sm hover:shadow-lg transition-all duration-500" onClick={() => { setPage('finances'); setFinTab('depenses'); setFinOpen(true); }} style={{ cursor: 'pointer', animationDelay: '0.5s' }}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-tertiary-fixed rounded-lg text-on-tertiary-fixed-variant">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
                    </div>
                  </div>
                  <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Dépenses Mensuelles</h3>
                  <p className="font-display-lg text-[32px] text-tertiary leading-tight">{afficherMontant(depenses.total)}</p>
                </div>
              </div>

              {/* Main Chart Section */}
              <section className="mb-8" style={{ animationDelay: '0.6s' }}>
                <div className="glass-card rounded-2xl p-lg relative overflow-hidden" onClick={() => navTo('stats')} style={{ cursor: 'pointer' }}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-lg gap-4">
                    <div>
                      <h3 className="font-headline-md text-headline-md text-on-surface mb-1">Évolution des Finances</h3>
                      <p className="text-on-surface-variant font-body-md">Aperçu financier — 6 derniers mois</p>
                    </div>
                  </div>
                  <div className="w-full flex justify-center">
                    <MiniChart recData={recettes.total ? [recettes.total, 0,0,0,0,0] : [0,0,0,0,0,0]} depData={depenses.total ? [depenses.total, 0,0,0,0,0] : [0,0,0,0,0,0]} onClick={() => navTo('stats')} />
                  </div>
                </div>
              </section>

              {/* Recent Orders Table */}
              <section style={{ animationDelay: '0.7s' }}>
                <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-lg flex justify-between items-center border-b border-outline-variant/20">
                    <h3 className="font-headline-md text-headline-md text-on-surface">Commandes Récentes</h3>
                    <button onClick={() => navTo('commandes')} className="text-primary font-label-md flex items-center gap-1 hover:underline">
                      Voir tout <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </div>
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-surface-container-low text-on-surface-variant font-label-sm uppercase tracking-widest text-[11px]">
                          <th className="px-lg py-4">Client</th>
                          <th className="px-lg py-4">Montant</th>
                          <th className="px-lg py-4">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10">
                        {prochainesCommandes.slice(0, 4).map(c => (
                          <tr key={c.id} className="hover:bg-surface-container-lowest transition-colors group">
                            <td className="px-lg py-5 font-body-md text-on-surface-variant">{c.client ?? c.nom}</td>
                            <td className="px-lg py-5 font-body-md font-semibold text-primary">{afficherMontant(Number(c.montant ?? 0))}</td>
                            <td className="px-lg py-5">
                              <Badge v={c.statut} />
                            </td>
                          </tr>
                        ))}
                        {prochainesCommandes.length === 0 && (
                          <tr><td colSpan="3" className="px-lg py-5 text-center text-on-surface-variant">Aucune commande à venir.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </div>
          )}
          `;
  
  content = content.substring(0, startIndex) + newDashboard + content.substring(endIndex);
  fs.writeFileSync(file, content);
  console.log("Dashboard view rewritten!");
} else {
  console.log("Failed to find boundaries for dashboard");
}
