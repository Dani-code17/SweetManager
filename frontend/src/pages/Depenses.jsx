import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

// ──────────────────────────────────────────────────────────────────────────
// Dépenses — harmonisée avec la palette Indigo Premium
// Utilise les tokens Tailwind personnalisés (bg-primary, bg-surface-container,
// text-on-surface-variant, border-outline-variant, etc.) pour être cohérent
// avec le TableauDeBord.
// ──────────────────────────────────────────────────────────────────────────

const categoriesDisponibles = [
  'Matières premières', 'Emballages', 'Loyer', 'Électricité',
  'Transport', 'Salaires', 'Équipement', 'Autres'
]
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

const Depenses = () => {
  const { token } = useAuth()
  const [depenses, setDepenses] = useState([])
  const [afficherFormulaire, setAfficherFormulaire] = useState(false)
  const [chargement, setChargement] = useState(false)
  const [formulaire, setFormulaire] = useState({
    montant: '', categorie: '', fournisseur: '',
    description: '', dateDepense: '', modePaiement: 'cash',
    quantite: '', libelle: ''
  })

  const entetes = { Authorization: `Bearer ${token}` }

  const chargerDepenses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/depenses`, { headers: entetes })
      setDepenses(res.data.items ?? [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => { chargerDepenses() }, [])

  const gererSoumission = async (e) => {
    e.preventDefault()
    setChargement(true)
    try {
      await axios.post(`${BASE_URL}/api/depenses`, formulaire, { headers: entetes })
      setFormulaire({ montant: '', categorie: '', fournisseur: '', description: '', dateDepense: '', modePaiement: 'cash', quantite: '', libelle: '' })
      setAfficherFormulaire(false)
      chargerDepenses()
    } catch (err) {
      console.error(err)
    } finally {
      setChargement(false)
    }
  }

  const supprimerDepense = async (id) => {
    if (!confirm('Supprimer cette dépense ?')) return
    try {
      await axios.delete(`${BASE_URL}/api/depenses/${id}`, { headers: entetes })
      chargerDepenses()
    } catch (err) {
      console.error(err)
    }
  }

  const totalDepenses = depenses.reduce((acc, d) => acc + Number(d.montant), 0)

  // Classes Tailwind réutilisables (palette indigo via tokens M3)
  const inputCls = 'w-full bg-transparent border border-outline-variant/40 rounded-lg px-4 py-2.5 mt-1 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors'
  const labelCls = 'text-sm text-on-surface-variant font-medium'

  return (
    <div className="min-h-screen bg-surface-container-low p-6 transition-colors">
      <div className="max-w-4xl mx-auto">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Dépenses</h1>
            <p className="text-error font-semibold mt-1 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-error" />
              Total : {totalDepenses.toLocaleString()} FCFA
            </p>
          </div>
          <button
            onClick={() => setAfficherFormulaire(!afficherFormulaire)}
            className="satin-button text-white px-5 py-2.5 rounded-full font-medium flex items-center gap-2 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nouvelle dépense
          </button>
        </div>

        {/* ── Formulaire ─────────────────────────────────────────────────── */}
        {afficherFormulaire && (
          <div className="glass-card rounded-2xl p-6 mb-6 stagger-in" style={{ animationDelay: '0s' }}>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Nouvelle dépense</h2>
            <form onSubmit={gererSoumission} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Libellé */}
              <div className="sm:col-span-2">
                <label className={labelCls}>Libellé <span className="text-on-surface-variant/50 text-xs">(optionnel)</span></label>
                <input type="text" maxLength={200} value={formulaire.libelle}
                  onChange={e => setFormulaire({ ...formulaire, libelle: e.target.value })}
                  placeholder="Ex : Achat farine, Facture électricité…"
                  className={inputCls} />
              </div>
              {/* Montant + Quantité */}
              <div>
                <label className={labelCls}>Montant (FCFA)</label>
                <input type="number" required min="0" step="0.01" value={formulaire.montant}
                  onChange={e => setFormulaire({ ...formulaire, montant: e.target.value })}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Quantité <span className="text-on-surface-variant/50 text-xs">(optionnel)</span></label>
                <input type="number" min="0" step="0.001" value={formulaire.quantite}
                  onChange={e => setFormulaire({ ...formulaire, quantite: e.target.value })}
                  placeholder="Ex : 5, 2.5…"
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Catégorie</label>
                <select required value={formulaire.categorie}
                  onChange={e => setFormulaire({ ...formulaire, categorie: e.target.value })}
                  className={inputCls}>
                  <option value="">Choisir...</option>
                  {categoriesDisponibles.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Fournisseur</label>
                <input type="text" value={formulaire.fournisseur}
                  onChange={e => setFormulaire({ ...formulaire, fournisseur: e.target.value })}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Date</label>
                <input type="date" required value={formulaire.dateDepense}
                  onChange={e => setFormulaire({ ...formulaire, dateDepense: e.target.value })}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Mode de paiement</label>
                <select value={formulaire.modePaiement}
                  onChange={e => setFormulaire({ ...formulaire, modePaiement: e.target.value })}
                  className={inputCls}>
                  <option value="cash">Cash</option>
                  <option value="orange_money">Orange Money</option>
                  <option value="wave">Wave</option>
                  <option value="mtn_money">MTN Money</option>
                  <option value="banque">Banque</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <input type="text" value={formulaire.description}
                  onChange={e => setFormulaire({ ...formulaire, description: e.target.value })}
                  className={inputCls} />
              </div>
              <div className="sm:col-span-2 flex gap-3 justify-end mt-2">
                <button type="button" onClick={() => setAfficherFormulaire(false)}
                  className="px-5 py-2.5 border border-outline-variant rounded-full text-on-surface-variant font-medium hover:bg-surface-container transition-colors active:scale-95">
                  Annuler
                </button>
                <button type="submit" disabled={chargement}
                  className="satin-button px-5 py-2.5 text-white rounded-full font-medium disabled:opacity-50 active:scale-95 transition-transform">
                  {chargement ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Liste ──────────────────────────────────────────────────────── */}
        <div className="glass-card rounded-2xl overflow-hidden">
          {depenses.length === 0 ? (
            <p className="text-on-surface-variant text-center py-10 flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-[40px] opacity-30">receipt_long</span>
              Aucune dépense enregistrée.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low text-on-surface-variant uppercase text-xs">
                <tr>
                  <th className="px-lg py-3 text-left font-label-sm tracking-widest">Date</th>
                  <th className="px-lg py-3 text-left font-label-sm tracking-widest">Libellé / Catégorie</th>
                  <th className="px-lg py-3 text-left font-label-sm tracking-widest">Fournisseur</th>
                  <th className="px-lg py-3 text-right font-label-sm tracking-widest">Qté</th>
                  <th className="px-lg py-3 text-right font-label-sm tracking-widest">Montant</th>
                  <th className="px-lg py-3 text-center font-label-sm tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15">
                {depenses.map(d => (
                  <tr key={d.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-lg py-4 text-on-surface-variant whitespace-nowrap">{new Date(d.dateDepense ?? d.date).toLocaleDateString('fr-FR')}</td>
                    <td className="px-lg py-4 text-on-surface">
                      {d.libelle && (
                        <p className="font-medium text-on-surface text-sm mb-0.5">{d.libelle}</p>
                      )}
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-tertiary/10 text-tertiary border border-tertiary/20">
                        {d.categorie}
                      </span>
                    </td>
                    <td className="px-lg py-4 text-on-surface-variant">{d.fournisseur || '—'}</td>
                    <td className="px-lg py-4 text-right text-on-surface-variant text-sm">
                      {d.quantite !== null && d.quantite !== undefined ? Number(d.quantite).toLocaleString() : '—'}
                    </td>
                    <td className="px-lg py-4 text-right font-semibold text-error whitespace-nowrap">
                      {Number(d.montant).toLocaleString()} FCFA
                    </td>
                    <td className="px-lg py-4 text-center">
                      <button
                        onClick={() => supprimerDepense(d.id)}
                        className="text-on-surface-variant hover:text-error hover:bg-error-container/30 p-2 rounded-full transition-colors text-xs inline-flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        Supprimer
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
  )
}

export default Depenses
