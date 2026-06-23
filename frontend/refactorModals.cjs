const fs = require('fs');

const file = 'c:/SweetManager/SweetManager/frontend/src/pages/TableauDeBord.jsx';
let content = fs.readFileSync(file, 'utf8');

const markerStart = `const BADGE_CLS = {`;
const markerEnd = `// Skeleton loader pour les KPI`;

const startIndex = content.indexOf(markerStart);
const endIndex = content.indexOf(markerEnd);

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = `// ─── Composants utilitaires ───────────────────────────────────────────────────
const Badge = ({ v }) => {
  const isWarn = v === 'En cours' || v === 'faible' || v === 'Ingrédients' || v === 'Emballages';
  const isErr = v === 'Annulé' || v === 'critique';
  let colorCls = 'bg-primary/10 text-primary border-primary/20';
  if (isWarn) colorCls = 'bg-tertiary/10 text-tertiary border-tertiary/20';
  if (isErr) colorCls = 'bg-error/10 text-error border-error/20';
  return (
    <span className={\`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border \${colorCls}\`}>
      {v}
    </span>
  );
};

const Th = ({ children }) => (
  <th className="px-lg py-4 font-label-sm uppercase tracking-widest text-[11px] text-on-surface-variant">
    {children}
  </th>
);

const Td = ({ children, className = '' }) => (
  <td className={\`px-lg py-5 text-on-surface font-body-md \${className}\`}>
    {children}
  </td>
);

const ActBtn = ({ icon: Icon, danger, title: t, onClick }) => (
  <button
    title={t}
    onClick={onClick}
    className={\`p-2 rounded-full transition-colors \${danger ? 'hover:bg-error-container/30 text-error' : 'hover:bg-surface-container text-primary'}\`}
  >
    <Icon size={16} strokeWidth={1.5} />
  </button>
);

const Field = ({ label, children }) => (
  <div className="mb-4">
    <label className="block font-label-md text-on-surface-variant uppercase tracking-wider mb-2">{label}</label>
    {children}
  </div>
);

const inp = 'w-full bg-transparent border border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface focus:ring-primary focus:border-primary transition-colors';

const ModalFooter = ({ onClose, onSave, saving }) => (
  <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-outline-variant/20">
    <button onClick={onClose} className="px-6 py-2 border border-outline-variant rounded-full text-on-surface-variant font-medium active:scale-95 transition-transform hover:bg-surface-container">
      Annuler
    </button>
    <button 
      onClick={onSave} 
      disabled={saving}
      className="satin-button px-6 py-2 rounded-full text-white font-medium active:scale-95 transition-transform shadow-lg shadow-primary/20 hover:scale-[1.02] disabled:opacity-50">
      {saving ? 'Enregistrement...' : 'Enregistrer'}
    </button>
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="glass-card rounded-2xl p-lg w-full max-w-lg shadow-2xl relative" onClick={e => e.stopPropagation()} style={{ animation: 'staggerIn 0.3s ease-out forwards' }}>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/20">
        <h2 className="font-headline-md text-on-surface">{title}</h2>
        <button onClick={onClose} className="text-on-surface-variant hover:text-error transition-colors p-2 rounded-full hover:bg-error-container/30">
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>
      <div className="max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
        {children}
      </div>
    </div>
  </div>
);

`;

  content = content.substring(0, startIndex) + newContent + content.substring(endIndex);
  fs.writeFileSync(file, content);
  console.log("Modals updated");
} else {
  console.log("Markers not found");
}
