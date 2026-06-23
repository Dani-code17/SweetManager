const fs = require('fs');

const file = 'c:/SweetManager/SweetManager/frontend/src/pages/TableauDeBord.jsx';
let content = fs.readFileSync(file, 'utf8');

const markerStart = `{page === 'stock' && (`;
const markerEnd = `        </main>`;

const startIndex = content.indexOf(markerStart);
const endIndex = content.indexOf(markerEnd);

if (startIndex === -1 || endIndex === -1) {
  console.log("Markers not found!");
  process.exit(1);
}

const newTabs = `
          {/* ── STOCK ─────────────────────────────────────────────── */}
          {page === 'stock' && (
            <div className="space-y-gutter stagger-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-xl" style={{ animationDelay: '0.1s' }}>
                <div>
                  <h1 className="font-display-lg text-display-lg text-primary mb-2">Stock</h1>
                  <p className="text-on-surface-variant max-w-xl">Ingrédients et matériaux</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={stockFiltreCateg}
                    onChange={(e) => setStockFiltreCateg(e.target.value)}
                    className="bg-transparent border border-outline-variant/30 rounded-full px-4 py-2 text-on-surface-variant focus:ring-primary focus:border-primary"
                  >
                    <option value="">Toutes catégories</option>
                    {[...new Set((stock.items ?? []).map(s => s.categorie).filter(Boolean))].sort().map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <button onClick={exporterCsvStock} className="flex items-center gap-2 px-6 py-3 border border-outline-variant rounded-full text-on-surface-variant font-medium active:scale-95 transition-transform hover:bg-surface-container">
                    <span className="material-symbols-outlined">download</span>
                    <span className="hidden sm:inline">Exporter CSV</span>
                  </button>
                  <button onClick={() => setModal('stock')} className="satin-button flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium active:scale-95 transition-transform shadow-lg shadow-primary/20 hover:scale-[1.02]">
                    <span className="material-symbols-outlined">add</span>
                    <span>Nouvel article</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="glass-card p-xl flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
              ) : stockAffiche.length === 0 ? (
                <div className="glass-card rounded-2xl p-xl text-center text-on-surface-variant">
                  {stock.items.length === 0 ? 'Aucun article en stock.' : 'Aucun article pour cette catégorie.'}
                </div>
              ) : (
                <div className="glass-card rounded-2xl overflow-hidden shadow-sm" style={{ animationDelay: '0.2s' }}>
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-surface-container-low text-on-surface-variant font-label-sm uppercase tracking-widest text-[11px]">
                          <th className="px-lg py-4">Article</th>
                          <th className="px-lg py-4">Catégorie</th>
                          <th className="px-lg py-4">Quantité</th>
                          <th className="px-lg py-4">Seuil</th>
                          <th className="px-lg py-4">Statut</th>
                          <th className="px-lg py-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10">
                        {stockAffiche.map(s => {
                          const statut = s.quantite <= 0 || s.quantite < s.seuil / 2 ? 'critique' : s.quantite < s.seuil ? 'faible' : 'ok';
                          return (
                            <tr key={s.id} className="hover:bg-surface-container-lowest transition-colors group">
                              <td className="px-lg py-5 font-headline-md text-on-surface">{s.nom}</td>
                              <td className="px-lg py-5 text-on-surface-variant font-body-md">{s.categorie}</td>
                              <td className="px-lg py-5">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    defaultValue={s.quantite}
                                    onBlur={async (e) => {
                                      const nouvelleQuantite = parseFloat(e.target.value)
                                      if (Number.isNaN(nouvelleQuantite)) return
                                      await fetch(\`\${BASE_URL}/api/stock/\${s.id}\`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${token()}\` },
                                        body: JSON.stringify({ quantite: nouvelleQuantite })
                                      })
                                      refetch()
                                    }}
                                    className="w-20 bg-transparent border border-outline-variant/30 rounded-lg px-2 py-1 focus:ring-primary focus:border-primary text-on-surface font-medium" />
                                  <span className="text-on-surface-variant font-label-md">{s.unite}</span>
                                </div>
                              </td>
                              <td className="px-lg py-5">
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="number" 
                                    defaultValue={s.seuil}
                                    onChange={async (e) => {
                                      const nouveauSeuil = parseFloat(e.target.value)
                                      if (Number.isNaN(nouveauSeuil)) return
                                      await fetch(\`\${BASE_URL}/api/stock/\${s.id}\`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${token()}\` },
                                        body: JSON.stringify({ seuilAlerte: nouveauSeuil })
                                      })
                                      refetch()
                                    }}
                                    className="w-20 bg-transparent border border-outline-variant/30 rounded-lg px-2 py-1 focus:ring-primary focus:border-primary text-on-surface font-medium"
                                  />
                                  <span className="text-on-surface-variant font-label-md">{s.unite}</span>
                                </div>
                              </td>
                              <td className="px-lg py-5">
                                {statut === 'critique' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error/10 text-error border border-error/20">Critique</span>}
                                {statut === 'faible' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-tertiary/10 text-tertiary border border-tertiary/20">Faible</span>}
                                {statut === 'ok' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">Normal</span>}
                              </td>
                              <td className="px-lg py-5 text-right">
                                <button onClick={() => supprimerArticleStock(s.id)} className="text-on-surface-variant hover:text-error transition-colors p-2 rounded-full hover:bg-error-container/30">
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── PRODUITS ────────────────────────────────────────────── */}
          {page === 'produits' && (
            <div className="space-y-gutter stagger-in">
              <div className="flex items-center justify-between gap-md mb-xl" style={{ animationDelay: '0.1s' }}>
                <div>
                  <h1 className="font-display-lg text-display-lg text-primary mb-2">Produits</h1>
                  <p className="text-on-surface-variant max-w-xl">Catalogue de vos pâtisseries</p>
                </div>
                <button onClick={() => setModal('produit')} className="satin-button flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium active:scale-95 transition-transform shadow-lg shadow-primary/20 hover:scale-[1.02]">
                  <span className="material-symbols-outlined">add</span>
                  <span>Nouveau produit</span>
                </button>
              </div>

              {loading ? (
                <div className="glass-card p-xl flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
              ) : produits.length === 0 ? (
                <div className="glass-card rounded-2xl p-xl text-center text-on-surface-variant">
                  Aucun produit enregistré.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter" style={{ animationDelay: '0.2s' }}>
                  {produits.map(p => {
                    const etatStock = evaluerStockProduit(p);
                    let badgeColor = "bg-primary/10 text-primary border-primary/20";
                    if(etatStock.label.includes("faible")) badgeColor = "bg-tertiary/10 text-tertiary border-tertiary/20";
                    if(etatStock.label.includes("Rupture")) badgeColor = "bg-error/10 text-error border-error/20";
                    
                    return (
                      <div key={p.id} className="glass-card p-md rounded-2xl hover:shadow-lg transition-all duration-300 group">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-headline-md text-headline-md text-on-surface mb-1">{p.nom}</h3>
                            <p className="text-label-md text-on-surface-variant tracking-wide uppercase">{p.categorie ?? '—'}</p>
                          </div>
                          <button onClick={() => supprimerProduit(p.id)} className="text-on-surface-variant opacity-0 group-hover:opacity-100 hover:text-error transition-all p-2 rounded-full hover:bg-error-container/30">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                        <div className="text-[28px] font-display-lg text-primary mb-4">
                          {afficherMontant(Number(p.prix))}
                        </div>
                        <div className="mb-4">
                          <span className={\`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border \${badgeColor}\`}>{etatStock.label}</span>
                        </div>
                        {p.ingredients?.length > 0 && (
                          <div className="border-t border-outline-variant/20 pt-4 mt-2">
                            <p className="text-label-sm text-on-surface-variant uppercase tracking-widest mb-2">Ingrédients</p>
                            <div className="space-y-1">
                              {p.ingredients.map(ing => (
                                <div key={ing.id} className="flex items-center justify-between">
                                  <span className="text-body-sm text-on-surface">• {ing.stockArticle.nom}</span>
                                  <span className="text-label-sm text-on-surface-variant">
                                    {Number(ing.quantite)} {ing.stockArticle.unite}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── COMMANDES ─────────────────────────────────────────────── */}
          {page === 'commandes' && (
            <div className="space-y-gutter stagger-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-xl" style={{ animationDelay: '0.1s' }}>
                <div>
                  <h1 className="font-display-lg text-display-lg text-primary mb-2">Commandes</h1>
                  <p className="text-on-surface-variant max-w-xl">Suivi des commandes clients</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex bg-surface-container rounded-full p-1 border border-outline-variant/30">
                    <button onClick={() => setCmdView('liste')} className={\`px-4 py-1.5 rounded-full text-label-md font-medium transition-colors \${cmdView === 'liste' ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:text-on-surface'}\`}>
                      Liste
                    </button>
                    <button onClick={() => setCmdView('calendrier')} className={\`px-4 py-1.5 rounded-full text-label-md font-medium transition-colors \${cmdView === 'calendrier' ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:text-on-surface'}\`}>
                      Calendrier
                    </button>
                  </div>
                  <button onClick={exporterCsvCommandes} className="flex items-center gap-2 px-6 py-2.5 border border-outline-variant rounded-full text-on-surface-variant font-medium active:scale-95 transition-transform hover:bg-surface-container">
                    <span className="material-symbols-outlined">download</span>
                    <span className="hidden sm:inline">CSV</span>
                  </button>
                  <button onClick={() => setModal('commande')} className="satin-button flex items-center gap-2 px-6 py-2.5 rounded-full text-white font-medium active:scale-95 transition-transform shadow-lg shadow-primary/20 hover:scale-[1.02]">
                    <span className="material-symbols-outlined">add</span>
                    <span className="hidden sm:inline">Nouvelle commande</span>
                    <span className="sm:hidden">Ajouter</span>
                  </button>
                </div>
              </div>

              {cmdView === 'liste' ? (
                loading ? (
                  <div className="glass-card p-xl flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                ) : commandes.items.length === 0 ? (
                  <div className="glass-card rounded-2xl p-xl text-center text-on-surface-variant">
                    Aucune commande enregistrée.
                  </div>
                ) : (
                  <div className="glass-card rounded-2xl overflow-hidden shadow-sm" style={{ animationDelay: '0.2s' }}>
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-surface-container-low text-on-surface-variant font-label-sm uppercase tracking-widest text-[11px]">
                            <th className="px-lg py-4">Client</th>
                            <th className="px-lg py-4">Commande</th>
                            <th className="px-lg py-4">Livraison</th>
                            <th className="px-lg py-4">Montant</th>
                            <th className="px-lg py-4">Statut</th>
                            <th className="px-lg py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                          {commandes.items.map(c => (
                            <tr key={c.id} className="hover:bg-surface-container-lowest transition-colors group">
                              <td className="px-lg py-5 font-headline-md text-on-surface">{c.client}</td>
                              <td className="px-lg py-5 text-on-surface-variant font-body-md max-w-xs truncate" title={c.commande ?? c.description}>{c.commande ?? c.description}</td>
                              <td className="px-lg py-5 text-on-surface-variant font-body-md">{c.date_livraison ?? c.date}</td>
                              <td className="px-lg py-5 font-bold text-primary">{afficherMontant(c.montant)}</td>
                              <td className="px-lg py-5">
                                <select
                                  value={statutsEffectifs[c.id] ?? c.statut}
                                  onChange={async e => {
                                    const nouveauStatut = e.target.value
                                    const ancienStatut = statutsEffectifs[c.id] ?? c.statut
                                    setStatuts(s => ({ ...s, [c.id]: nouveauStatut }))
                                    try {
                                      const res = await fetch(\`\${BASE_URL}/api/commandes/\${c.id}/statut\`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${token()}\` },
                                        body: JSON.stringify({ statut: nouveauStatut })
                                      })
                                      if (!res.ok) throw new Error(\`Erreur \${res.status}\`)
                                      refetch()
                                    } catch (err) {
                                      console.error(err)
                                      setStatuts(s => ({ ...s, [c.id]: ancienStatut }))
                                    }
                                  }}
                                  className="bg-transparent border border-outline-variant/30 rounded-lg px-3 py-1.5 focus:ring-primary focus:border-primary text-on-surface font-medium text-sm">
                                  {['En cours','Confirmé','Prêt','Livré','Annulé'].map(s => <option key={s}>{s}</option>)}
                                </select>
                              </td>
                              <td className="px-lg py-5 text-right">
                                <div className="flex gap-1 justify-end">
                                  <button onClick={() => alert(\`Détails commande de \${c.client}:\\n\\n\${c.commande || c.description}\`)} className="p-2 rounded-full hover:bg-surface-container text-primary transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                                  </button>
                                  <button onClick={() => { window.open(\`http://localhost:5000/api/pdf/commande/\${c.id}?token=\${localStorage.getItem('token')}\`, '_blank') }} className="p-2 rounded-full hover:bg-surface-container text-tertiary transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                                  </button>
                                  <button onClick={() => supprimerCommandeItem(c.id)} className="p-2 rounded-full hover:bg-error-container/30 text-error transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              ) : (
                <div className="glass-card rounded-2xl p-md overflow-x-auto" style={{ animationDelay: '0.2s' }}>
                  <div className="grid grid-cols-7 gap-1 text-center font-label-md text-on-surface-variant uppercase tracking-widest text-[11px] mb-4 min-w-[300px]">
                    {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(d => <span key={d}>{d}</span>)}
                  </div>
                  <div className="grid grid-cols-7 gap-2 min-w-[300px]">
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(d => {
                      const hasCmd = commandes.items.some(c => {
                        const date = new Date(c.date_livraison ?? c.date);
                        return date.getDate() === d;
                      });
                      return (
                        <div key={d} className={\`p-3 text-center rounded-xl border transition-all \${hasCmd ? 'border-primary/30 bg-primary/10 text-primary font-bold shadow-sm hover:bg-primary/20 cursor-pointer' : 'border-outline-variant/10 text-on-surface-variant hover:bg-surface-container cursor-pointer'}\`}>
                          {d}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STATS ─────────────────────────────────────────────────── */}
          {page === 'stats' && (
            <div className="space-y-gutter stagger-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-xl" style={{ animationDelay: '0.1s' }}>
                <div>
                  <h1 className="font-display-lg text-display-lg text-primary mb-2">Statistiques</h1>
                  <p className="text-on-surface-variant max-w-xl">Performance financière</p>
                </div>
                <div className="flex items-center gap-2">
                  <select className="bg-transparent border border-outline-variant/30 rounded-full px-4 py-2 text-on-surface-variant focus:ring-primary focus:border-primary">
                    <option>Ce mois</option><option>Trimestre</option><option>Année</option>
                  </select>
                  <button className="flex items-center gap-2 px-6 py-2 border border-outline-variant rounded-full text-on-surface-variant font-medium active:scale-95 transition-transform hover:bg-surface-container">
                    <span className="material-symbols-outlined">download</span>
                    <span className="hidden sm:inline">Exporter PDF</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter mb-xl"><div className="glass-card h-24 rounded-2xl animate-pulse"></div><div className="glass-card h-24 rounded-2xl animate-pulse"></div><div className="glass-card h-24 rounded-2xl animate-pulse"></div></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter mb-xl" style={{ animationDelay: '0.2s' }}>
                  {[
                    { l:'Recettes', v: afficherMontant(recettes.total), c:'text-primary', bg:'bg-primary/10', icon: 'trending_up' },
                    { l:'Dépenses', v: afficherMontant(depenses.total), c:'text-error', bg:'bg-error/10', icon: 'trending_down' },
                    { l:'Commandes',v: String(commandes.items.length), c:'text-tertiary', bg:'bg-tertiary/10', icon: 'shopping_cart' },
                  ].map(k => (
                    <div key={k.l} className="glass-card rounded-2xl p-md flex items-center gap-4 hover:shadow-lg transition-shadow">
                      <div className={\`w-12 h-12 rounded-xl flex items-center justify-center \${k.bg}\`}>
                        <span className={\`material-symbols-outlined \${k.c}\`}>{k.icon}</span>
                      </div>
                      <div>
                        <div className="font-label-md text-on-surface-variant tracking-wider uppercase mb-1">{k.l}</div>
                        <div className={\`font-display-lg text-[24px] \${k.c} font-bold leading-none\`}>{k.v}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="glass-card rounded-2xl p-lg" style={{ animationDelay: '0.3s' }}>
                <div className="font-headline-md text-on-surface mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">bar_chart</span> Évolution mensuelle
                </div>
                <div className="w-full h-80">
                  <EvolutionChart recData={recHist} depData={depHist} barAreaHeight={240} />
                </div>
                <div className="flex gap-6 mt-6 justify-center">
                  <span className="flex items-center gap-2 font-label-md text-on-surface-variant"><span className="w-3 h-3 bg-primary rounded-full" /> Recettes</span>
                  <span className="flex items-center gap-2 font-label-md text-on-surface-variant"><span className="w-3 h-3 bg-error rounded-full" /> Dépenses</span>
                </div>
              </div>
            </div>
          )}

          {/* ── PARAMÈTRES ────────────────────────────────────────────── */}
          {page === 'params' && (
            <div className="space-y-gutter stagger-in">
              <div className="mb-xl" style={{ animationDelay: '0.1s' }}>
                <h1 className="font-display-lg text-display-lg text-primary mb-2">Paramètres</h1>
                <p className="text-on-surface-variant max-w-xl">Configurez votre profil et les préférences de la boutique.</p>
              </div>

              <div className="glass-card rounded-2xl p-lg max-w-2xl mx-auto" style={{ animationDelay: '0.2s' }}>
                <h2 className="font-headline-md text-on-surface mb-6 border-b border-outline-variant/20 pb-4">Profil Boutique</h2>

                {paramsLoading ? (
                  <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="font-label-md text-on-surface-variant uppercase tracking-wider">Nom du responsable</label>
                        <input type="text" value={paramsForm.nom} onChange={(e) => setParamsForm({ ...paramsForm, nom: e.target.value })} className="bg-transparent border border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface focus:ring-primary focus:border-primary transition-colors" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="font-label-md text-on-surface-variant uppercase tracking-wider">Nom de la boutique</label>
                        <input type="text" value={paramsForm.nomBoutique} onChange={(e) => setParamsForm({ ...paramsForm, nomBoutique: e.target.value })} placeholder="SweetManager Pâtisserie" className="bg-transparent border border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface focus:ring-primary focus:border-primary transition-colors" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="font-label-md text-on-surface-variant uppercase tracking-wider">E-mail</label>
                        <input type="email" value={paramsForm.email} disabled className="bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-3 text-outline-variant cursor-not-allowed" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="font-label-md text-on-surface-variant uppercase tracking-wider">Téléphone</label>
                        <input type="tel" value={paramsForm.telephone} onChange={(e) => setParamsForm({ ...paramsForm, telephone: e.target.value })} className="bg-transparent border border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface focus:ring-primary focus:border-primary transition-colors" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="font-label-md text-on-surface-variant uppercase tracking-wider">Devise</label>
                        <select value={paramsForm.devise} onChange={(e) => setParamsForm({ ...paramsForm, devise: e.target.value })} className="bg-transparent border border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface focus:ring-primary focus:border-primary transition-colors">
                          <option value="FCFA">FCFA</option>
                          <option value="EUR">EUR</option>
                          <option value="USD">USD</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="font-label-md text-on-surface-variant uppercase tracking-wider">Seuil alerte stock par défaut</label>
                        <input type="number" min="0" value={paramsForm.seuilAlerteDefaut} onChange={(e) => setParamsForm({ ...paramsForm, seuilAlerteDefaut: e.target.value })} className="bg-transparent border border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface focus:ring-primary focus:border-primary transition-colors" />
                      </div>
                    </div>

                    {paramsMsg && (
                      <div className={\`p-4 rounded-xl flex items-center gap-3 \${paramsMsg.type === 'success' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-error/10 text-error border border-error/20'}\`}>
                        <span className="material-symbols-outlined">{paramsMsg.type === 'success' ? 'check_circle' : 'error'}</span>
                        <span className="font-medium">{paramsMsg.text}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-end mt-8 pt-6 border-t border-outline-variant/20">
                      <button onClick={sauvegarderParams} disabled={paramsSaving} className="satin-button px-8 py-3 rounded-full text-white font-medium active:scale-95 transition-transform shadow-lg shadow-primary/20 hover:scale-[1.02] disabled:opacity-50 flex items-center gap-2">
                        <span className="material-symbols-outlined">save</span>
                        {paramsSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
`;

content = content.substring(0, startIndex) + newTabs + '\n' + content.substring(endIndex);

// Also need to fix modals design minimally so they fit the UI
// I will just add glass-card to modals in another pass.
fs.writeFileSync(file, content);
console.log("Tabs refactored successfully.");
