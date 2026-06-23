const fs = require('fs');

const file = 'c:/SweetManager/SweetManager/frontend/src/pages/TableauDeBord.jsx';
let content = fs.readFileSync(file, 'utf8');

const startMarker = "{page === 'finances' && (";
const endMarker = "{page === 'stock' && (";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if(startIndex !== -1 && endIndex !== -1) {
  const newFinances = `{page === 'finances' && (
            <div className="space-y-gutter stagger-in">
              {/* Header & CTA */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md mb-xl" style={{ animationDelay: '0.1s' }}>
                <div>
                  <h1 className="font-display-lg text-display-lg text-primary mb-2">Finances</h1>
                  <p className="text-on-surface-variant max-w-xl">Suivez la santé financière de votre boutique avec précision et élégance. Analysez vos revenus et optimisez vos dépenses.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setModal('recette')} className="satin-button flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium active:scale-95 transition-transform shadow-lg shadow-primary/20 hover:scale-[1.02]">
                    <span className="material-symbols-outlined">add</span>
                    <span>Nouvelle Recette</span>
                  </button>
                  <button onClick={() => setModal('depense')} className="satin-button flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium active:scale-95 transition-transform shadow-lg shadow-error/20 hover:scale-[1.02] bg-gradient-to-r from-error to-red-800">
                    <span className="material-symbols-outlined">add</span>
                    <span>Nouvelle Dépense</span>
                  </button>
                  <button onClick={exporterCsvFinances} className="flex items-center gap-2 px-6 py-3 border border-outline-variant rounded-full text-on-surface-variant font-medium active:scale-95 transition-transform hover:bg-surface-container">
                    <span className="material-symbols-outlined">download</span>
                    <span>Exporter CSV</span>
                  </button>
                </div>
              </div>

              {/* Summary Cards Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-xl" style={{ animationDelay: '0.2s' }}>
                {/* Revenue */}
                <div className="glass-card p-md rounded-xl flex flex-col justify-between h-44 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
                  <div className="flex justify-between items-start">
                    <span className="p-3 bg-primary/10 rounded-lg">
                      <span className="material-symbols-outlined text-primary">trending_up</span>
                    </span>
                    <span className="text-label-sm text-primary uppercase tracking-wider bg-primary/5 px-2 py-1 rounded">Mois en cours</span>
                  </div>
                  <div>
                    <p className="text-on-surface-variant font-label-md mb-1">Total Recettes</p>
                    <h3 className="font-headline-lg text-headline-lg text-on-surface">{afficherMontant(recettes.total)}</h3>
                  </div>
                </div>

                {/* Expenses */}
                <div className="glass-card p-md rounded-xl flex flex-col justify-between h-44 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-error/5 rounded-full blur-2xl group-hover:bg-error/10 transition-colors"></div>
                  <div className="flex justify-between items-start">
                    <span className="p-3 bg-error/10 rounded-lg">
                      <span className="material-symbols-outlined text-error">trending_down</span>
                    </span>
                  </div>
                  <div>
                    <p className="text-on-surface-variant font-label-md mb-1">Total Dépenses</p>
                    <h3 className="font-headline-lg text-headline-lg text-on-surface">{afficherMontant(depenses.total)}</h3>
                  </div>
                </div>

                {/* Profit */}
                <div className="glass-card p-md rounded-xl flex flex-col justify-between h-44 relative overflow-hidden group bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg transition-all duration-300">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary/10 rounded-full blur-2xl"></div>
                  <div className="flex justify-between items-start">
                    <span className="p-3 bg-tertiary/10 rounded-lg">
                      <span className="material-symbols-outlined text-tertiary">account_balance_wallet</span>
                    </span>
                    <span className="text-label-sm text-tertiary uppercase tracking-wider bg-tertiary/5 px-2 py-1 rounded">Net Profit</span>
                  </div>
                  <div>
                    <p className="text-on-surface-variant font-label-md mb-1">Solde Net</p>
                    <h3 className="font-headline-lg text-headline-lg text-primary font-bold">{afficherMontant(soldeNet)}</h3>
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter" style={{ animationDelay: '0.3s' }}>
                <div className="lg:col-span-12 glass-card p-md rounded-xl overflow-hidden flex flex-col shadow-sm">
                  <div className="flex justify-between items-center mb-md border-b border-outline-variant/20 pb-4">
                    <h4 className="font-headline-md text-headline-md text-on-surface">Transactions Récentes</h4>
                    <div className="flex gap-2">
                       <button onClick={() => setFinTab('recettes')} className={\`px-4 py-1.5 rounded-full text-label-sm font-medium transition-colors \${finTab === 'recettes' ? 'bg-primary text-white' : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container'}\`}>Recettes</button>
                       <button onClick={() => setFinTab('depenses')} className={\`px-4 py-1.5 rounded-full text-label-sm font-medium transition-colors \${finTab === 'depenses' ? 'bg-primary text-white' : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container'}\`}>Dépenses</button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-x-auto custom-scrollbar">
                    {loading ? (
                       <TableSkeleton rows={4} cols={4} />
                    ) : (finTab === 'depenses' ? depenses.historique : recettes.historique).length === 0 ? (
                       <div className="text-center py-8 text-on-surface-variant font-body-md">Aucune transaction trouvée.</div>
                    ) : (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-surface-container-low text-on-surface-variant font-label-sm uppercase tracking-widest text-[11px]">
                            <th className="px-lg py-4">Date</th>
                            <th className="px-lg py-4">Description</th>
                            <th className="px-lg py-4 text-right">Montant</th>
                            <th className="px-lg py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                          {(finTab === 'depenses' ? depenses.historique : recettes.historique).map(item => (
                            <tr key={item.id} className="hover:bg-surface-container-lowest transition-colors group">
                              <td className="px-lg py-5 font-body-md text-on-surface-variant">{item.date}</td>
                              <td className="px-lg py-5 text-on-surface font-medium">{item.description}</td>
                              <td className={\`px-lg py-5 text-right font-bold \${finTab === 'depenses' ? 'text-on-surface' : 'text-primary'}\`}>
                                {finTab === 'depenses' ? '- ' : '+ '}{afficherMontant(Number(item.montant))}
                              </td>
                              <td className="px-lg py-5 text-right">
                                <button onClick={() => confirm(\`Supprimer cette \${finTab.slice(0,-1)} ?\`) && supprimerFin(finTab.slice(0,-1), item.id)} className="text-on-surface-variant hover:text-error transition-colors p-2 rounded-full hover:bg-error-container/30">
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          `;
  
  content = content.substring(0, startIndex) + newFinances + content.substring(endIndex);
  fs.writeFileSync(file, content);
  console.log("Finances view rewritten!");
} else {
  console.log("Failed to find boundaries for finances");
}
