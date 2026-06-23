const fs = require('fs');

const file = 'c:/SweetManager/SweetManager/frontend/src/pages/TableauDeBord.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Inject state
content = content.replace(
  `const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Mobile action menu`,
  `const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Mobile action menu\n  const [commandeAffichee, setCommandeAffichee] = useState(null);`
);

// 2. Fix Finances wrapper responsiveness
content = content.replace(
  `<div className="flex items-center gap-2">\n                  <button onClick={() => setModal('recette')} className="satin-button`,
  `<div className="flex flex-wrap items-center gap-2 mt-4 md:mt-0">\n                  <button onClick={() => setModal('recette')} className="satin-button`
);
content = content.replace(
  `<p className="text-on-surface-variant max-w-xl">Suivez la santé financière`,
  `<p className="text-on-surface-variant max-w-full md:max-w-xl">Suivez la santé financière`
);

// 3. Fix NaN FCFA bug
const oldMontantCell = `<td className={\`px-lg py-5 text-right font-bold \${finTab === 'depenses' ? 'text-on-surface' : 'text-primary'}\`}>
                                {finTab === 'depenses' ? '- ' : '+ '}{afficherMontant(Number(item.montant))}
                              </td>`;
const newMontantCell = `<td className={\`px-lg py-5 text-right font-bold \${finTab === 'depenses' ? 'text-on-surface' : 'text-primary'}\`}>
                                {item.montant && !Number.isNaN(Number(item.montant)) ? (finTab === 'depenses' ? '- ' : '+ ') + afficherMontant(Number(item.montant)) : '—'}
                              </td>`;
content = content.replace(oldMontantCell, newMontantCell);

// 4. Commandes Calendar Bug
const oldCalendarDiv = `const hasCmd = commandes.items.some(c => {
                        const date = new Date(c.date_livraison ?? c.date);
                        return date.getDate() === d;
                      });
                      return (
                        <div key={d} className={\`p-3 text-center rounded-xl border transition-all \${hasCmd ? 'border-primary/30 bg-primary/10 text-primary font-bold shadow-sm hover:bg-primary/20 cursor-pointer' : 'border-outline-variant/10 text-on-surface-variant hover:bg-surface-container cursor-pointer'}\`}>
                          {d}
                        </div>
                      );`;

const newCalendarDiv = `const cmdsJour = commandes.items.filter(c => {
                        const date = new Date(c.date_livraison ?? c.date);
                        return date.getDate() === d;
                      });
                      const hasCmd = cmdsJour.length > 0;
                      return (
                        <div key={d} onClick={() => { if(hasCmd) { setCommandeAffichee(cmdsJour[0]); setModal('commande_detail'); } }} className={\`p-3 text-center rounded-xl border transition-all \${hasCmd ? 'border-primary/30 bg-primary/10 text-primary font-bold shadow-sm hover:bg-primary/20 cursor-pointer' : 'border-outline-variant/10 text-on-surface-variant hover:bg-surface-container cursor-pointer'}\`}>
                          {d}
                        </div>
                      );`;
content = content.replace(oldCalendarDiv, newCalendarDiv);

// 5. Eye icon modal
content = content.replace(
  `<button onClick={() => alert(\`Détails commande de \${c.client}:\\n\\n\${c.commande || c.description}\`)} className="p-2 rounded-full hover:bg-surface-container text-primary transition-colors">`,
  `<button onClick={() => { setCommandeAffichee(c); setModal('commande_detail'); }} className="p-2 rounded-full hover:bg-surface-container text-primary transition-colors">`
);

// 6. Add the commande_detail Modal
const modalMarker = `{modal === 'stock' && (`;
const commandeDetailModal = `{modal === 'commande_detail' && commandeAffichee && (
        <Modal title={\`Détails commande de \${commandeAffichee.client}\`} onClose={() => { setModal(null); setCommandeAffichee(null); }}>
          <div className="space-y-4">
            <div>
              <p className="text-label-md text-on-surface-variant uppercase tracking-widest mb-1">Date</p>
              <p className="font-body-md text-on-surface">{commandeAffichee.date_livraison ?? commandeAffichee.date}</p>
            </div>
            <div>
              <p className="text-label-md text-on-surface-variant uppercase tracking-widest mb-1">Montant</p>
              <p className="font-headline-md text-primary">{afficherMontant(commandeAffichee.montant)}</p>
            </div>
            <div>
              <p className="text-label-md text-on-surface-variant uppercase tracking-widest mb-1">Description / Produits</p>
              <div className="p-3 bg-surface-container rounded-lg font-body-md text-on-surface whitespace-pre-wrap">
                {commandeAffichee.commande || commandeAffichee.description || 'Aucun détail'}
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button onClick={() => { setModal(null); setCommandeAffichee(null); }} className="satin-button px-6 py-2 rounded-full text-white font-medium shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">Fermer</button>
          </div>
        </Modal>
      )}
      `;

content = content.replace(modalMarker, commandeDetailModal + modalMarker);

fs.writeFileSync(file, content);
console.log("Bugfixes applied successfully.");
