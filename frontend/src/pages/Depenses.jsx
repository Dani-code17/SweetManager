import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const categoriesDisponibles = [
  'Matières premières', 'Emballages', 'Loyer', 'Électricité',
  'Transport', 'Salaires', 'Équipement', 'Autres'
]

const Depenses = () => {
  const { token } = useAuth()
  const [depenses, setDepenses] = useState([])
  const [afficherFormulaire, setAfficherFormulaire] = useState(false)
  const [chargement, setChargement] = useState(false)
  const [formulaire, setFormulaire] = useState({
    montant: '', categorie: '', fournisseur: '',
    description: '', dateDepense: '', modePaiement: 'cash'
  })

  const entetes = { Authorization: `Bearer ${token}` }

  const chargerDepenses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/depenses', { headers: entetes })
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
      await axios.post('http://localhost:5000/api/depenses', formulaire, { headers: entetes })
      setFormulaire({ montant: '', categorie: '', fournisseur: '', description: '', dateDepense: '', modePaiement: 'cash' })
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
      await axios.delete(`http://localhost:5000/api/depenses/${id}`, { headers: entetes })
      chargerDepenses()
    } catch (err) {
      console.error(err)
    }
  }

  const totalDepenses = depenses.reduce((acc, d) => acc + Number(d.montant), 0)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dépenses</h1>
            <p className="text-red-500 font-semibold mt-1">
              Total : {totalDepenses.toLocaleString()} FCFA
            </p>
          </div>
          <button
            onClick={() => setAfficherFormulaire(!afficherFormulaire)}
            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            + Nouvelle dépense
          </button>
        </div>

        {/* Formulaire */}
        {afficherFormulaire && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="font-semibold text-gray-700 mb-4">Nouvelle dépense</h2>
            <form onSubmit={gererSoumission} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Montant (FCFA)</label>
                <input type="number" required value={formulaire.montant}
                  onChange={e => setFormulaire({ ...formulaire, montant: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-pink-400" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Catégorie</label>
                <select required value={formulaire.categorie}
                  onChange={e => setFormulaire({ ...formulaire, categorie: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-pink-400">
                  <option value="">Choisir...</option>
                  {categoriesDisponibles.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600">Fournisseur</label>
                <input type="text" value={formulaire.fournisseur}
                  onChange={e => setFormulaire({ ...formulaire, fournisseur: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-pink-400" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Date</label>
                <input type="date" required value={formulaire.dateDepense}
                  onChange={e => setFormulaire({ ...formulaire, dateDepense: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-pink-400" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Mode de paiement</label>
                <select value={formulaire.modePaiement}
                  onChange={e => setFormulaire({ ...formulaire, modePaiement: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-pink-400">
                  <option value="cash">Cash</option>
                  <option value="orange_money">Orange Money</option>
                  <option value="wave">Wave</option>
                  <option value="mtn_money">MTN Money</option>
                  <option value="banque">Banque</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600">Description</label>
                <input type="text" value={formulaire.description}
                  onChange={e => setFormulaire({ ...formulaire, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-pink-400" />
              </div>
              <div className="sm:col-span-2 flex gap-3 justify-end">
                <button type="button" onClick={() => setAfficherFormulaire(false)}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100">
                  Annuler
                </button>
                <button type="submit" disabled={chargement}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg disabled:opacity-50">
                  {chargement ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {depenses.length === 0 ? (
            <p className="text-gray-400 text-center py-10">Aucune dépense enregistrée.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Catégorie</th>
                  <th className="px-4 py-3 text-left">Fournisseur</th>
                  <th className="px-4 py-3 text-right">Montant</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {depenses.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{new Date(d.dateDepense).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3">{d.categorie}</td>
                    <td className="px-4 py-3 text-gray-500">{d.fournisseur || '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-red-500">
                      {Number(d.montant).toLocaleString()} FCFA
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => supprimerDepense(d.id)}
                        className="text-red-400 hover:text-red-600 text-xs">
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