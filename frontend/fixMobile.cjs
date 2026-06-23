const fs = require('fs');
const file = 'c:/SweetManager/SweetManager/frontend/src/pages/TableauDeBord.jsx';
let content = fs.readFileSync(file, 'utf8');

// ─── Fix 1: Modal padding on mobile ──────────────────────────────────────
// Change modal inner div padding from p-lg (48px) to smaller on mobile
content = content.replace(
  `<div className="glass-card rounded-2xl p-lg w-full max-w-[500px] shadow-2xl relative" onClick={e => e.stopPropagation()} style={{ animation: 'staggerIn 0.3s ease-out forwards' }}>`,
  `<div className="glass-card rounded-2xl p-4 sm:p-8 w-full max-w-[500px] shadow-2xl relative" onClick={e => e.stopPropagation()} style={{ animation: 'staggerIn 0.3s ease-out forwards' }}>`
);

// ─── Fix 2: NaN in finances transactions ─────────────────────────────────
// Replace the bugged line
content = content.replace(
  `{finTab === 'depenses' ? '- ' : '+ '}{afficherMontant(Number(item.montant))}`,
  `{item.montant != null && !Number.isNaN(Number(item.montant)) ? (finTab === 'depenses' ? \`- \${afficherMontant(Number(item.montant))}\` : \`+ \${afficherMontant(Number(item.montant))}\`) : '—'}`
);

// ─── Fix 3: Page title too large on mobile ────────────────────────────────
// font-display-lg is 48px which wraps badly on mobile, switch to responsive sizes
content = content.replace(
  /className="font-display-lg text-display-lg text-primary mb-2"/g,
  'className="font-display-lg text-[28px] sm:text-[40px] md:text-display-lg text-primary mb-2"'
);

// ─── Fix 4: Finances header buttons wrap on mobile ────────────────────────
content = content.replace(
  `<div className="flex items-center gap-2">\n                  <button onClick={() => setModal('recette')} className="satin-button`,
  `<div className="flex flex-wrap items-center gap-2">\n                  <button onClick={() => setModal('recette')} className="satin-button`
);

// ─── Fix 5: Modal content area can't scroll properly on mobile ─────────────
content = content.replace(
  `<div className="max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">`,
  `<div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">`
);

// ─── Fix 6: Modal outer backdrop click zone ───────────────────────────────
// Make sure the modal is scrollable even on very short screens (align to start)
content = content.replace(
  `<div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>`,
  `<div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto" onClick={onClose}>`
);

// ─── Fix 7: Commande form product list max-height too small ──────────────
content = content.replace(
  `<div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">`,
  `<div className="space-y-2 max-h-32 overflow-y-auto border border-outline-variant/30 rounded-lg p-2">`
);

// ─── Fix 8: Remove old gray border from commande product items ─────────────
content = content.replace(
  `<div key={p.id} className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded">`,
  `<div key={p.id} className="flex items-center justify-between gap-2 p-2 bg-surface-container rounded-lg">`
);
content = content.replace(
  `<div className="text-xs font-medium text-gray-700 truncate">{p.nom}</div>`,
  `<div className="text-xs font-medium text-on-surface truncate">{p.nom}</div>`
);
content = content.replace(
  `<div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">`,
  `<div className="flex items-center gap-2 text-xs text-on-surface-variant mt-0.5">`
);
content = content.replace(
  `className="w-16 text-xs px-2 py-1 border border-gray-200 rounded-md bg-white text-gray-700"`,
  `className="w-16 text-xs px-2 py-1 border border-outline-variant/30 rounded-md bg-transparent text-on-surface"`
);

// ─── Fix 9: Total line in commande form ───────────────────────────────────
content = content.replace(
  `<div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5 mb-3">
            <div className="text-xs font-medium text-blue-700">`,
  `<div className="bg-primary/10 border border-primary/20 rounded-xl p-3 mb-4">
            <div className="text-sm font-medium text-primary">`
);

fs.writeFileSync(file, content);
console.log('All fixes applied.');
