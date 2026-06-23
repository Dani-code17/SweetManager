const fs = require('fs');

const file = 'c:/SweetManager/SweetManager/frontend/src/pages/TableauDeBord.jsx';
let content = fs.readFileSync(file, 'utf8');

// ─── 1. Persist theme to localStorage & init from it ─────────────────────
// Replace the theme toggle button logic (in topbar)
content = content.replace(
  `<button className="p-2.5 rounded-full hover:bg-surface-container-high transition-colors duration-200 active:scale-95 transition-transform text-primary relative" onClick={() => document.documentElement.classList.toggle('dark')}>
              <span className="material-symbols-outlined dark:hidden">contrast</span>
              <span className="material-symbols-outlined hidden dark:block">light_mode</span>
            </button>`,
  `<button className="p-2.5 rounded-full hover:bg-surface-container-high transition-colors duration-200 active:scale-95 transition-transform text-primary relative" onClick={() => {
                const isDark = document.documentElement.classList.toggle('dark');
                localStorage.setItem('sm_theme', isDark ? 'dark' : 'light');
              }}>
              <span className="material-symbols-outlined dark:hidden">contrast</span>
              <span className="material-symbols-outlined hidden dark:block">light_mode</span>
            </button>`
);

// ─── 2. Add theme init useEffect ──────────────────────────────────────────
content = content.replace(
  `const [page,    setPage]    = useState('dashboard');`,
  `// Init theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sm_theme');
    if (saved === 'dark') document.documentElement.classList.add('dark');
    else if (saved === 'light') document.documentElement.classList.remove('dark');
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const [page,    setPage]    = useState('dashboard');`
);

// ─── 3. Add statsPeriode state after the existing states ──────────────────
content = content.replace(
  `const [commandeAffichee, setCommandeAffichee] = useState(null);`,
  `const [commandeAffichee, setCommandeAffichee] = useState(null);
  const [statsPeriode, setStatsPeriode] = useState('mois'); // 'mois' | 'trimestre' | 'annee'`
);

// ─── 4. Add stats filtering helpers near the recHist/depHist block ────────
const oldHistBlock = `const recHist = recettes.historique ?? Array(6).fill(0);
  const depHist = depenses.historique ?? Array(6).fill(0);`;

const newHistBlock = `const recHist = recettes.historique ?? Array(6).fill(0);
  const depHist = depenses.historique ?? Array(6).fill(0);

  // ── Stats: filter items by selected period ──────────────────────────────
  const filtrerParPeriode = (items) => {
    if (!Array.isArray(items)) return [];
    const now = new Date();
    return items.filter(item => {
      const d = new Date(item.date);
      if (isNaN(d)) return false;
      if (statsPeriode === 'mois') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (statsPeriode === 'trimestre') {
        const trim = Math.floor(now.getMonth() / 3);
        return Math.floor(d.getMonth() / 3) === trim && d.getFullYear() === now.getFullYear();
      }
      // annee
      return d.getFullYear() === now.getFullYear();
    });
  };

  const recettesFiltrees  = filtrerParPeriode(recettes.items ?? []);
  const depensesFiltrees  = filtrerParPeriode(depenses.items ?? []);
  const totalRecFiltrees  = recettesFiltrees.reduce((a, i) => a + (Number(i.montant) || 0), 0);
  const totalDepFiltrees  = depensesFiltrees.reduce((a, i) => a + (Number(i.montant) || 0), 0);

  // PDF export for stats
  const exporterStatsPDF = () => {
    const periode = statsPeriode === 'mois' ? 'Mois en cours' : statsPeriode === 'trimestre' ? 'Trimestre' : 'Année';
    const html = \`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8"/>
<title>Statistiques SweetManager</title>
<style>
  body { font-family: Georgia, serif; padding: 40px; color: #221a14; }
  h1 { font-size: 32px; color: #914b34; margin-bottom: 4px; }
  p.sub { font-size: 14px; color: #888; margin-bottom: 32px; }
  .kpis { display: flex; gap: 24px; margin-bottom: 32px; }
  .kpi { flex: 1; background: #fff8f5; border: 1px solid #f0ddd6; border-radius: 12px; padding: 20px; }
  .kpi-label { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: #888; margin-bottom: 6px; }
  .kpi-value { font-size: 24px; font-weight: bold; color: #914b34; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  th { text-align: left; font-size: 11px; text-transform: uppercase; color: #888; padding: 8px 12px; background: #fff8f5; border-bottom: 1px solid #f0ddd6; }
  td { padding: 10px 12px; border-bottom: 1px solid #f9f0eb; font-size: 13px; }
  h2 { font-size: 20px; color: #914b34; margin: 28px 0 8px; }
  .footer { margin-top: 40px; font-size: 11px; color: #bbb; text-align: center; }
</style>
</head>
<body>
<h1>Rapport Statistiques</h1>
<p class="sub">Période : <strong>\${periode}</strong> — Généré le \${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>

<div class="kpis">
  <div class="kpi"><div class="kpi-label">Total Recettes</div><div class="kpi-value">\${totalRecFiltrees.toLocaleString('fr-FR')} \${devise}</div></div>
  <div class="kpi"><div class="kpi-label">Total Dépenses</div><div class="kpi-value">\${totalDepFiltrees.toLocaleString('fr-FR')} \${devise}</div></div>
  <div class="kpi"><div class="kpi-label">Solde Net</div><div class="kpi-value">\${(totalRecFiltrees - totalDepFiltrees).toLocaleString('fr-FR')} \${devise}</div></div>
  <div class="kpi"><div class="kpi-label">Nb Commandes</div><div class="kpi-value">\${commandes.items.length}</div></div>
</div>

<h2>Recettes (\${recettesFiltrees.length} transactions)</h2>
<table>
  <thead><tr><th>Date</th><th>Description</th><th>Montant</th></tr></thead>
  <tbody>
    \${recettesFiltrees.map(r => \`<tr><td>\${r.date || '—'}</td><td>\${r.description || r.client || '—'}</td><td>\${Number(r.montant || 0).toLocaleString('fr-FR')} \${devise}</td></tr>\`).join('')}
    \${recettesFiltrees.length === 0 ? '<tr><td colspan="3" style="text-align:center;color:#bbb">Aucune recette sur cette période</td></tr>' : ''}
  </tbody>
</table>

<h2>Dépenses (\${depensesFiltrees.length} transactions)</h2>
<table>
  <thead><tr><th>Date</th><th>Description</th><th>Montant</th></tr></thead>
  <tbody>
    \${depensesFiltrees.map(d => \`<tr><td>\${d.date || '—'}</td><td>\${d.description || '—'}</td><td>\${Number(d.montant || 0).toLocaleString('fr-FR')} \${devise}</td></tr>\`).join('')}
    \${depensesFiltrees.length === 0 ? '<tr><td colspan="3" style="text-align:center;color:#bbb">Aucune dépense sur cette période</td></tr>' : ''}
  </tbody>
</table>

<p class="footer">SweetManager — Rapport généré automatiquement</p>
</body>
</html>\`;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.print(); }, 500);
  };`;

content = content.replace(oldHistBlock, newHistBlock);

// ─── 5. Replace the static stats section with functional one ─────────────
const oldStatsSection = `{/* ── STATS ─────────────────────────────────────────────────── */}
          {page === 'stats' && (
            <div className="space-y-gutter stagger-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-xl" style={{ animationDelay: '0.1s' }}>
                <div>
                  <h1 className="font-display-lg text-[28px] sm:text-[40px] md:text-display-lg text-primary mb-2">Statistiques</h1>
                  <p className="text-on-surface-variant max-w-[600px]">Performance financière</p>
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
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${k.bg}`}>
                        <span className={`material-symbols-outlined ${k.c}`}>{k.icon}</span>
                      </div>
                      <div>
                        <div className="font-label-md text-on-surface-variant tracking-wider uppercase mb-1">{k.l}</div>
                        <div className={`font-display-lg text-[24px] ${k.c} font-bold leading-none`}>{k.v}</div>
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
          )}`;

const newStatsSection = `{/* ── STATS ─────────────────────────────────────────────────── */}
          {page === 'stats' && (
            <div className="space-y-gutter stagger-in">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-md mb-xl" style={{ animationDelay: '0.1s' }}>
                <div>
                  <h1 className="font-display-lg text-[28px] sm:text-[40px] md:text-display-lg text-primary mb-2">Statistiques</h1>
                  <p className="text-on-surface-variant max-w-[600px]">Performance financière de votre boutique</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 no-print">
                  {/* Période selector */}
                  <div className="flex bg-surface-container rounded-full p-1 border border-outline-variant/30">
                    {[
                      { k: 'mois',      label: 'Mois' },
                      { k: 'trimestre', label: 'Trimestre' },
                      { k: 'annee',     label: 'Année' },
                    ].map(p => (
                      <button key={p.k} onClick={() => setStatsPeriode(p.k)}
                        className={\`px-4 py-1.5 rounded-full text-label-md font-medium transition-all duration-200 \${statsPeriode === p.k ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:text-on-surface'}\`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <button onClick={exporterStatsPDF}
                    className="flex items-center gap-2 px-5 py-2.5 satin-button rounded-full text-white font-medium active:scale-95 transition-transform shadow-lg shadow-primary/20 hover:scale-[1.02]">
                    <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                    <span>Exporter PDF</span>
                  </button>
                </div>
              </div>

              {/* Period label */}
              <div className="flex items-center gap-2 mb-2" style={{ animationDelay: '0.15s' }}>
                <span className="material-symbols-outlined text-primary text-[18px]">calendar_month</span>
                <span className="font-label-md text-on-surface-variant">
                  {statsPeriode === 'mois' ? 'Mois en cours' : statsPeriode === 'trimestre' ? 'Trimestre en cours' : 'Année en cours'}
                  {' '}— {recettesFiltrees.length + depensesFiltrees.length} transactions
                </span>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-xl">
                  {[1,2,3,4].map(i => <div key={i} className="glass-card h-28 rounded-2xl animate-pulse"></div>)}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-xl" style={{ animationDelay: '0.2s' }}>
                  {[
                    { l:'Recettes', v: afficherMontant(totalRecFiltrees), c:'text-primary', bg:'bg-primary/10', icon: 'trending_up', sub: \`\${recettesFiltrees.length} transaction\${recettesFiltrees.length !== 1 ? 's' : ''}\` },
                    { l:'Dépenses', v: afficherMontant(totalDepFiltrees), c:'text-error',   bg:'bg-error/10',   icon: 'trending_down', sub: \`\${depensesFiltrees.length} transaction\${depensesFiltrees.length !== 1 ? 's' : ''}\` },
                    { l:'Solde Net', v: afficherMontant(totalRecFiltrees - totalDepFiltrees), c: (totalRecFiltrees - totalDepFiltrees) >= 0 ? 'text-primary' : 'text-error', bg:'bg-tertiary/10', icon: 'account_balance_wallet', sub: 'Recettes − Dépenses' },
                    { l:'Commandes', v: String(commandes.items.length), c:'text-tertiary', bg:'bg-tertiary/10', icon: 'shopping_cart', sub: 'Total boutique' },
                  ].map(k => (
                    <div key={k.l} className="glass-card rounded-2xl p-md flex items-center gap-4 hover:shadow-lg transition-all duration-300 group">
                      <div className={\`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 \${k.bg} group-hover:scale-110 transition-transform duration-300\`}>
                        <span className={\`material-symbols-outlined \${k.c}\`} style={{ fontVariationSettings: "'FILL' 1" }}>{k.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-label-md text-on-surface-variant tracking-wider uppercase mb-1 truncate">{k.l}</div>
                        <div className={\`text-[22px] font-bold leading-none \${k.c} truncate\`}>{k.v}</div>
                        <div className="text-[11px] text-on-surface-variant mt-1">{k.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Chart */}
              <div className="glass-card rounded-2xl p-lg" style={{ animationDelay: '0.3s' }}>
                <div className="font-headline-md text-on-surface mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">bar_chart</span>
                  Évolution mensuelle (6 derniers mois)
                </div>
                <div className="w-full h-72">
                  <EvolutionChart recData={recHist} depData={depHist} barAreaHeight={220} />
                </div>
                <div className="flex gap-6 mt-6 justify-center">
                  <span className="flex items-center gap-2 font-label-md text-on-surface-variant"><span className="w-3 h-3 bg-primary rounded-full inline-block" /> Recettes</span>
                  <span className="flex items-center gap-2 font-label-md text-on-surface-variant"><span className="w-3 h-3 bg-error rounded-full inline-block" /> Dépenses</span>
                </div>
              </div>

              {/* Table des transactions filtrées */}
              <div className="glass-card rounded-2xl overflow-hidden" style={{ animationDelay: '0.4s' }}>
                <div className="p-md flex justify-between items-center border-b border-outline-variant/20">
                  <h3 className="font-headline-md text-on-surface">Transactions de la période</h3>
                  <div className="flex gap-2 text-label-sm">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">+{afficherMontant(totalRecFiltrees)}</span>
                    <span className="bg-error/10 text-error px-3 py-1 rounded-full font-medium">-{afficherMontant(totalDepFiltrees)}</span>
                  </div>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                  {recettesFiltrees.length + depensesFiltrees.length === 0 ? (
                    <div className="p-xl text-center text-on-surface-variant">Aucune transaction sur cette période.</div>
                  ) : (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-surface-container-low text-on-surface-variant font-label-sm uppercase tracking-widest text-[11px]">
                          <th className="px-lg py-3">Date</th>
                          <th className="px-lg py-3">Description</th>
                          <th className="px-lg py-3">Type</th>
                          <th className="px-lg py-3 text-right">Montant</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10">
                        {[
                          ...recettesFiltrees.map(r => ({ ...r, type: 'recette' })),
                          ...depensesFiltrees.map(d => ({ ...d, type: 'depense' })),
                        ].sort((a, b) => new Date(b.date) - new Date(a.date)).map((item, i) => (
                          <tr key={i} className="hover:bg-surface-container-lowest transition-colors">
                            <td className="px-lg py-4 text-on-surface-variant">{item.date || '—'}</td>
                            <td className="px-lg py-4 text-on-surface font-medium">{item.description || item.client || '—'}</td>
                            <td className="px-lg py-4">
                              {item.type === 'recette'
                                ? <span className="bg-primary/10 text-primary text-xs px-2.5 py-0.5 rounded-full font-medium border border-primary/20">Recette</span>
                                : <span className="bg-error/10 text-error text-xs px-2.5 py-0.5 rounded-full font-medium border border-error/20">Dépense</span>}
                            </td>
                            <td className={\`px-lg py-4 text-right font-bold \${item.type === 'recette' ? 'text-primary' : 'text-error'}\`}>
                              {item.type === 'recette' ? '+' : '-'} {afficherMontant(Number(item.montant || 0))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}`;

content = content.replace(oldStatsSection, newStatsSection);

// ─── 6. Add glow layer + mobile bottom nav + app-shell class to layout ────
content = content.replace(
  `<div className="flex min-h-screen bg-transparent text-gray-800 overflow-hidden flex-col md:flex-row">`,
  `<div className="flex min-h-screen bg-transparent text-gray-800 overflow-hidden flex-col md:flex-row relative">

      {/* ── Atmospheric dark mode glow ─────────────────────────────── */}
      <div className="dark-glow-layer">
        <div className="glow-1" />
        <div className="glow-2" />
        <div className="glow-3" />
      </div>`
);

// ─── 7. Add mobile bottom nav bar before the closing tag of the outer div ─
// Find the last closing div before the modals list
content = content.replace(
  `{/* ── MODALS ────────────────────────────────────────────────────── */}`,
  `{/* ── Mobile bottom nav ─────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface/95 dark:bg-[#0a0704]/95 backdrop-blur-lg border-t border-outline-variant/20 flex justify-around items-center z-50 shadow-xl no-print">
        {[
          { id: 'dashboard', icon: 'dashboard',   label: 'Accueil' },
          { id: 'finances',  icon: 'payments',    label: 'Finances' },
          { id: 'commandes', icon: 'shopping_bag',label: 'Commandes' },
          { id: 'stock',     icon: 'inventory_2', label: 'Stock' },
          { id: 'stats',     icon: 'analytics',   label: 'Stats' },
        ].map(item => (
          <button key={item.id} onClick={() => { setPage(item.id); setSidebarOpen(false); }}
            className={\`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all \${page === item.id ? 'text-primary' : 'text-on-surface-variant'}\`}>
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: page === item.id ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
            <span className="text-[9px] font-medium uppercase tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* ── MODALS ────────────────────────────────────────────────────── */}`
);

fs.writeFileSync(file, content);
console.log('Dark mode + Stats + Mobile nav all done.');
