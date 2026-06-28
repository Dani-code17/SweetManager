// src/pages/TableauDeBord.jsx
//
// Dépendances npm à installer :
//   npm install @tabler/icons-react react-router-dom
//
// Fichier complémentaire : src/hooks/useDashboard.js

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconLayoutDashboard,
  IconCoin,
  IconBox,
  IconClipboardList,
  IconChartBar,
  IconSettings,
  IconLogout,
  IconChevronDown,
  IconChevronUp,
  IconChevronRight,
  IconPlus,
  IconBell,
  IconTrendingUp,
  IconTrendingDown,
  IconWallet,
  IconCalendar,
  IconAlertTriangle,
  IconDownload,
  IconEdit,
  IconTrash,
  IconEye,
  IconFileText,
  IconX,
  IconCake,
  IconTag,
  IconCheck,
} from '@tabler/icons-react';

import { useAuth }      from '../context/AuthContext';
import { useDashboard } from '../hooks/useDashboard';

// ─── Constantes graphiques ────────────────────────────────────────────────────
const MOIS_LABELS = ['Jan','Fév','Mar','Avr','Mai','Juin'];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n, devise = 'FCFA') =>
  typeof n === 'number'
    ? n.toLocaleString('fr-FR') + ' ' + devise
    : `0 ${devise}`;

// ─── Composants utilitaires ───────────────────────────────────────────────────
const Badge = ({ v }) => {
  const isWarn = v === 'En cours' || v === 'faible' || v === 'Ingrédients' || v === 'Emballages';
  const isErr = v === 'Annulé' || v === 'critique';
  let colorCls = 'bg-primary/10 text-primary border-primary/20';
  if (isWarn) colorCls = 'bg-tertiary/10 text-tertiary border-tertiary/20';
  if (isErr) colorCls = 'bg-error/10 text-error border-error/20';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorCls}`}>
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
  <td className={`px-lg py-5 text-on-surface font-body-md ${className}`}>
    {children}
  </td>
);

const ActBtn = ({ icon: Icon, danger, title: t, onClick }) => (
  <button
    title={t}
    onClick={onClick}
    className={`p-2 rounded-full transition-colors ${danger ? 'hover:bg-error-container/30 text-error' : 'hover:bg-surface-container text-primary'}`}
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
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto" onClick={onClose}>
    <div className="glass-card rounded-2xl p-4 sm:p-8 w-full max-w-[500px] shadow-2xl relative" onClick={e => e.stopPropagation()} style={{ animation: 'staggerIn 0.3s ease-out forwards' }}>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/20">
        <h2 className="font-headline-md text-on-surface">{title}</h2>
        <button onClick={onClose} className="text-on-surface-variant hover:text-error transition-colors p-2 rounded-full hover:bg-error-container/30">
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>
      <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
        {children}
      </div>
    </div>
  </div>
);

// Skeleton loader pour les KPI
const KpiSkeleton = () => (
  <div className="bg-white border border-gray-100 rounded-xl p-3.5 flex items-center gap-3 animate-pulse">
    <div className="w-9 h-9 rounded-lg bg-gray-100" />
    <div className="flex-1">
      <div className="h-2.5 bg-gray-100 rounded w-24 mb-2" />
      <div className="h-4 bg-gray-100 rounded w-32" />
    </div>
  </div>
);

const TableSkeleton = ({ rows = 3, cols = 5 }) => (
  <div className="bg-white border border-gray-100 rounded-xl overflow-hidden animate-pulse">
    <div className="h-8 bg-gray-50 border-b border-gray-100" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-3 px-3 py-2.5 border-b border-gray-50 last:border-0">
        {Array.from({ length: cols }).map((_, j) => (
          <div key={j} className="h-3 bg-gray-100 rounded flex-1" />
        ))}
      </div>
    ))}
  </div>
);

// Graphique barres côte à côte (recettes / dépenses par mois)
const EvolutionChart = ({ recData, depData, labels = MOIS_LABELS, barAreaHeight = 96, showLabels = true, className = '', onClick }) => {
  const mx = Math.max(...recData, ...depData, 1);
  const gapClass = labels.length > 12 ? 'gap-[2px]' : 'gap-1.5';
  return (
    <div className={`flex items-end ${gapClass} ${className}`} onClick={onClick}>
      {labels.map((m, i) => (
        <div key={m} className="flex-1 flex flex-col items-center min-w-0">
          <div
            className="w-full flex items-end justify-center gap-0.5"
            style={{ height: `${barAreaHeight}px` }}
          >
            <div
              className="flex-1 rounded-t bg-primary hover:opacity-90 transition-opacity"
              style={{ height: `${Math.max(((recData[i] ?? 0) > 0 ? 2 : 0), Math.round(((recData[i] ?? 0) / mx) * barAreaHeight))}px` }}
            />
            <div
              className="flex-1 rounded-t bg-error hover:opacity-90 transition-opacity"
              style={{ height: `${Math.max(((depData[i] ?? 0) > 0 ? 2 : 0), Math.round(((depData[i] ?? 0) / mx) * barAreaHeight))}px` }}
            />
          </div>
          {showLabels && <span className={`text-gray-400 mt-1 ${labels.length > 12 ? 'text-[8px] sm:text-[10px]' : 'text-xs'}`}>{m}</span>}
        </div>
      ))}
    </div>
  );
};

const MiniChart = ({ recData, depData, onClick }) => (
  <EvolutionChart
    recData={recData}
    depData={depData}
    barAreaHeight={48}
    showLabels={false}
    className="h-14 cursor-pointer"
    onClick={onClick}
  />
);

const nettoyerCsv = (valeur) => {
  if (valeur === null || valeur === undefined) return '';
  return String(valeur)
    .replace(/"/g, '""')
    .replace(/\r?\n/g, ' ');
};

const convertirEnCsv = (enTetes, lignes) => {
  const ligneEntete = enTetes.map(nettoyerCsv).join(';');
  const corps = lignes
    .map(ligne => ligne.map(cellule => nettoyerCsv(cellule)).join(';'))
    .join('\n');
  return `${ligneEntete}\n${corps}`;
};

const telechargerCsv = (nomFichier, enTetes, lignes) => {
  const contenu = convertirEnCsv(enTetes, lignes);
  const blob = new Blob(["\ufeff" + contenu], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = nomFichier;
  document.body.appendChild(lien);

  lien.click();
  document.body.removeChild(lien);
  URL.revokeObjectURL(url);
};

// ─── Composant principal ──────────────────────────────────────────────────────
export default function TableauDeBord() {
  const navigate              = useNavigate();
  const { utilisateur, deconnecter, mettreAJourUtilisateur } = useAuth();
  const devise = utilisateur?.devise ?? 'FCFA';
  const afficherMontant = (n) => fmt(n, devise);

  const {
    depenses,
    recettes,
    stock,
    commandes,
    soldeNet,
    alertesStock,
    prochainesCommandes,
    loading,
    error,
    refetch,
  } = useDashboard();

  useEffect(() => {
    const saved = localStorage.getItem('sm_theme');
    if (saved === 'dark') document.documentElement.classList.add('dark');
    else if (saved === 'light') document.documentElement.classList.remove('dark');
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const [page,    setPage]    = useState('dashboard');
  const [finTab,  setFinTab]  = useState('depenses');
  const [finOpen, setFinOpen] = useState(false);
  const [cmdView, setCmdView] = useState('liste');
  const [modal,   setModal]   = useState(null);
  const [statuts, setStatuts] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Mobile action menu
  const [commandeAffichee, setCommandeAffichee] = useState(null);
  const [statsPeriode, setStatsPeriode] = useState('mois');
  const [recherche, setRecherche] = useState('');

  // ── Stock : formulaire nouvel article ───────────────────────────────────────
  const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
  
  // Dépense
  const [depenseForm, setDepenseForm] = useState({
    date: '', categorie: 'Ingrédients', description: '', montant: '',
  });
  const [depenseSaving, setDepenseSaving] = useState(false);

  // Recette
  const [recetteForm, setRecetteForm] = useState({
    date: '', client: '', description: '', montant: '',
  });
  const [recetteSaving, setRecetteSaving] = useState(false);

  // Commande
  const [commandeForm, setCommandeForm] = useState({
    client: '', commande: '', date: '', lignes: [],
  });
  const [commandeSaving, setCommandeSaving] = useState(false);

  const [stockForm, setStockForm] = useState({
    nom: '', categorie: '', quantite: '', unite: 'kg', seuilAlerte: '',
  });
  const [stockCatSaisie, setStockCatSaisie] = useState(false); // bascule champ libre
  const [stockSaving,    setStockSaving]    = useState(false);
  const [stockFiltreCateg, setStockFiltreCateg] = useState('');
  const [quantitesModif, setQuantitesModif] = useState({}); // { [id]: newQty }
  const [produits, setProduits] = useState([])
  const [produitEnEdition, setProduitEnEdition] = useState(null)
  const [produitForm, setProduitForm] = useState({
    nom: '', categorie: '', prix: '', description: '',
    ingredients: []
  })
  const [produitSaving, setProduitSaving] = useState(false)

  const [paramsForm, setParamsForm] = useState({
    nom: '', nomBoutique: '', telephone: '', email: '', devise: 'FCFA', seuilAlerteDefaut: 5,
  });
  const [paramsLoading, setParamsLoading] = useState(false);
  const [paramsSaving, setParamsSaving] = useState(false);
  const [paramsMsg, setParamsMsg] = useState(null);

  const [toastMessage, setToastMessage] = useState(null); // { type: 'error' | 'success', text: '' }
  const [confirmDialog, setConfirmDialog] = useState(null); // { title: '', message: '', onConfirm: () => void }

  const showToast = (text, type = 'error') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Initialise les statuts dès que les commandes arrivent
  const statutsEffectifs = commandes.items.reduce(
    (acc, c) => ({ ...acc, [c.id]: statuts[c.id] ?? c.statut }),
    {}
  );

  const gererDeconnexion = () => {
    deconnecter();
    navigate('/connexion');
  };

  // ── Charger les produits au montage ────────────────────────────────────────
  useEffect(() => {
    chargerProduits();
  }, []);

  useEffect(() => {
    if (page !== 'params') return;
    chargerProfil();
  }, [page]);

  const chargerProfil = async () => {
    setParamsLoading(true);
    setParamsMsg(null);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/profil`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error('Impossible de charger le profil');
      const profil = await res.json();
      setParamsForm({
        nom: profil.nom ?? '',
        nomBoutique: profil.nomBoutique ?? '',
        telephone: profil.telephone ?? '',
        email: profil.email ?? '',
        devise: profil.devise ?? 'FCFA',
        seuilAlerteDefaut: profil.seuilAlerteDefaut ?? 5,
      });
    } catch (e) {
      setParamsMsg({ type: 'error', text: e.message });
    } finally {
      setParamsLoading(false);
    }
  };

  const sauvegarderParams = async () => {
    if (!paramsForm.nom.trim()) {
      setParamsMsg({ type: 'error', text: 'Le nom du responsable est obligatoire.' });
      return;
    }
    setParamsSaving(true);
    setParamsMsg(null);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/profil`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          nom: paramsForm.nom.trim(),
          nomBoutique: paramsForm.nomBoutique.trim(),
          telephone: paramsForm.telephone.trim(),
          devise: paramsForm.devise,
          seuilAlerteDefaut: Number(paramsForm.seuilAlerteDefaut) || 0,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.erreur || data.message || `Erreur ${res.status}`);
      }
      mettreAJourUtilisateur(data.utilisateur);
      setParamsMsg({ type: 'success', text: 'Paramètres enregistrés avec succès.' });
      refetch();
      chargerProduits();
    } catch (e) {
      setParamsMsg({ type: 'error', text: e.message });
    } finally {
      setParamsSaving(false);
    }
  };

  // ── Helpers API stock ────────────────────────────────────────────────────────
  const token = () => localStorage.getItem('token');

  // ── Sauvegarder Dépense ─────────────────────────────────────────────────────
  const sauvegarderDepense = async () => {
    if (!depenseForm.date || !depenseForm.montant || depenseForm.montant <= 0) {
      alert('Veuillez remplir tous les champs (date et montant > 0)');
      return;
    }
    setDepenseSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/api/depenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          dateDepense: depenseForm.date,
          categorie: depenseForm.categorie,
          description: depenseForm.description,
          montant: parseFloat(depenseForm.montant),
        }),
      });
      if (!res.ok) {
        const erreur = await res.json();
        throw new Error(erreur.message || `Erreur ${res.status}`);
      }
      setDepenseForm({ date: '', categorie: 'Ingrédients', description: '', montant: '' });
      setModal(null);
      refetch();
    } catch (e) { 
      console.error('Erreur dépense:', e);
      alert('Erreur : ' + e.message);
    } finally { 
      setDepenseSaving(false);
    }
  };

  // ── Sauvegarder Recette ─────────────────────────────────────────────────────
  const sauvegarderRecette = async () => {
    if (!recetteForm.date || !recetteForm.montant || recetteForm.montant <= 0) {
      alert('Veuillez remplir tous les champs (date et montant > 0)');
      return;
    }
    setRecetteSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/api/recettes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          date: recetteForm.date,
          client: recetteForm.client,
          description: recetteForm.description,
          montant: parseFloat(recetteForm.montant),
        }),
      });
      if (!res.ok) {
        const erreur = await res.json();
        throw new Error(erreur.message || `Erreur ${res.status}`);
      }
      setRecetteForm({ date: '', client: '', description: '', montant: '' });
      setModal(null);
      refetch();
    } catch (e) { 
      console.error('Erreur recette:', e);
      alert('Erreur : ' + e.message);
    } finally { 
      setRecetteSaving(false);
    }
  };

  // ── Sauvegarder Commande ────────────────────────────────────────────────────
  const sauvegarderCommande = async () => {
    if (!commandeForm.client || !commandeForm.date) return;
    if (!commandeForm.lignes?.length) {
      alert('Ajoutez au moins un produit.');
      return;
    }
    setCommandeSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/api/commandes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          clientId: null,
          client: commandeForm.client,
          dateLivraison: commandeForm.date,
          notes: commandeForm.commande,
          lignes: commandeForm.lignes
        })
      });
      if (!res.ok) {
        const erreur = await res.json();
        throw new Error(erreur.message || `Erreur ${res.status}`);
      }
      setCommandeForm({ client: '', commande: '', date: '', lignes: [] });
      setModal(null);
      refetch();
    } catch (e) {
      console.error('Erreur commande:', e);
      alert('Erreur : ' + e.message);
    } finally {
      setCommandeSaving(false);
    }
  };

  const sauvegarderArticle = async () => {
    if (!stockForm.nom.trim() || !stockForm.unite) return;
    setStockSaving(true);
    try {
      await fetch(`${BASE_URL}/api/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          nom:         stockForm.nom.trim(),
          categorie:   stockForm.categorie.trim() || 'Autre',
          quantite:    parseFloat(stockForm.quantite) || 0,
          unite:       stockForm.unite,
          seuilAlerte: parseFloat(stockForm.seuilAlerte) || utilisateur?.seuilAlerteDefaut || 5,
        }),
      });
      setStockForm({ nom:'', categorie:'', quantite:'', unite:'kg', seuilAlerte:'' });
      setModal(null);
      refetch();
    } catch (e) { console.error(e); }
    finally { setStockSaving(false); }
  };

  const triggerDelete = (title, message, deleteFn) => {
    setConfirmDialog({
      title,
      message,
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await deleteFn();
          showToast('Supprimé avec succès', 'success');
        } catch (e) {
          showToast(e.message, 'error');
        }
      }
    });
  };

  const supprimerArticleStock = (id) => {
    triggerDelete('Supprimer cet article ?', 'Êtes-vous sûr de vouloir supprimer cet article du stock ? Cette action est irréversible.', async () => {
      const res = await fetch(`${BASE_URL}/api/stock/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Erreur serveur');
      refetch();
    });
  };

  const supprimerDepenseItem = (id) => {
    triggerDelete('Supprimer cette dépense ?', 'Cette dépense sera définitivement supprimée de vos historiques.', async () => {
      const res = await fetch(`${BASE_URL}/api/depenses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` }
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Erreur serveur');
      refetch();
    });
  };

  const supprimerRecetteItem = (id) => {
    triggerDelete('Supprimer cette recette ?', 'Cette recette sera définitivement supprimée de vos historiques.', async () => {
      const res = await fetch(`${BASE_URL}/api/recettes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` }
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Erreur serveur');
      refetch();
    });
  };

  const chargerProduits = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/produits`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      const data = await res.json();
      setProduits(data.items ?? []);
    } catch (e) { console.error(e); }
  };

  const sauvegarderProduit = async () => {
    if (!produitForm.nom || !produitForm.prix) return;
    setProduitSaving(true);
    try {
      if (produitEnEdition) {
        // Modification
        await fetch(`${BASE_URL}/api/produits/${produitEnEdition.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
          body: JSON.stringify({
            nom: produitForm.nom,
            categorie: produitForm.categorie,
            prix: parseFloat(produitForm.prix),
            description: produitForm.description,
            ingredients: produitForm.ingredients
          })
        });
        showToast('Produit modifié', 'success');
      } else {
        // Création
        await fetch(`${BASE_URL}/api/produits`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
          body: JSON.stringify({
            nom: produitForm.nom,
            categorie: produitForm.categorie,
            prix: parseFloat(produitForm.prix),
            description: produitForm.description,
            ingredients: produitForm.ingredients
          })
        });
        showToast('Produit sauvegardé', 'success');
      }
      setProduitForm({ nom: '', categorie: '', prix: '', description: '', ingredients: [] });
      setProduitEnEdition(null);
      setModal(null);
      chargerProduits();
    } catch (e) { console.error(e); }
    finally { setProduitSaving(false); }
  };

  const ouvrirEditionProduit = (p) => {
    setProduitEnEdition(p);
    setProduitForm({
      nom: p.nom ?? '',
      categorie: p.categorie ?? '',
      prix: p.prix ?? '',
      description: p.description ?? '',
      ingredients: (p.ingredients ?? []).map(i => ({ stockArticleId: i.stockArticleId, quantite: Number(i.quantite) }))
    });
    setModal('produit');
  };

  const supprimerProduit = (id) => {
    triggerDelete('Supprimer ce produit ?', 'Ce produit ne sera plus disponible dans votre catalogue.', async () => {
      const res = await fetch(`${BASE_URL}/api/produits/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` }
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Erreur serveur');
      chargerProduits();
    });
  };

  const supprimerCommandeItem = (id) => {
    triggerDelete('Supprimer cette commande ?', 'Êtes-vous sûr de vouloir supprimer cette commande ?', async () => {
      const res = await fetch(`${BASE_URL}/api/commandes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` }
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Erreur serveur');
      refetch();
    });
  };

  const sauvegarderQuantite = async (id, quantite) => {
    await fetch(`${BASE_URL}/api/stock/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ quantite: parseFloat(quantite) }),
    });
    refetch();
  };

  // Catégories dédupliquées depuis les articles existants
  const categoriesExistantes = [...new Set((stock.items ?? []).map(s => s.categorie).filter(Boolean))];

  const navTo = (p) => {
    setPage(p);
    if (p !== 'finances') setFinOpen(false);
  };

  // Données graphique : on utilise recettes.items si l'API le fournit,
  // sinon on montre des zéros (pas de données fictives)
  const recHist = recettes.historique ?? Array(6).fill(0);
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

  const genererStatsChart = () => {
    const now = new Date();
    let labels = [];
    let rec = [];
    let dep = [];

    if (statsPeriode === 'mois') {
      const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      labels = Array.from({ length: days }, (_, i) => String(i + 1));
      rec = Array(days).fill(0);
      dep = Array(days).fill(0);
      
      recettesFiltrees.forEach(r => {
        const d = new Date(r.date);
        rec[d.getDate() - 1] += Number(r.montant || 0);
      });
      depensesFiltrees.forEach(d_ => {
        const d = new Date(d_.date);
        dep[d.getDate() - 1] += Number(d_.montant || 0);
      });
    } else if (statsPeriode === 'trimestre') {
      const trim = Math.floor(now.getMonth() / 3);
      const allMonths = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
      labels = [allMonths[trim * 3], allMonths[trim * 3 + 1], allMonths[trim * 3 + 2]];
      rec = [0, 0, 0];
      dep = [0, 0, 0];

      recettesFiltrees.forEach(r => {
        const d = new Date(r.date);
        rec[d.getMonth() % 3] += Number(r.montant || 0);
      });
      depensesFiltrees.forEach(d_ => {
        const d = new Date(d_.date);
        dep[d.getMonth() % 3] += Number(d_.montant || 0);
      });
    } else {
      labels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
      rec = Array(12).fill(0);
      dep = Array(12).fill(0);

      recettesFiltrees.forEach(r => {
        const d = new Date(r.date);
        rec[d.getMonth()] += Number(r.montant || 0);
      });
      depensesFiltrees.forEach(d_ => {
        const d = new Date(d_.date);
        dep[d.getMonth()] += Number(d_.montant || 0);
      });
    }
    return { labels, recData: rec, depData: dep };
  };
  const statsChart = genererStatsChart();

  const commandesRecherchees = (commandes.items ?? []).filter(c => {
    if (!recherche.trim()) return true;
    const term = recherche.toLowerCase();
    return (c.client?.toLowerCase().includes(term) || c.commande?.toLowerCase().includes(term));
  });

  // PDF export for stats
  const exporterStatsPDF = () => {
    const periode = statsPeriode === 'mois' ? 'Mois en cours' : statsPeriode === 'trimestre' ? 'Trimestre' : 'Année';
    const html = `<!DOCTYPE html>
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
<p class="sub">Période : <strong>${periode}</strong> — Généré le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>

<div class="kpis">
  <div class="kpi"><div class="kpi-label">Total Recettes</div><div class="kpi-value">${totalRecFiltrees.toLocaleString('fr-FR')} ${utilisateur?.devise || 'FCFA'}</div></div>
  <div class="kpi"><div class="kpi-label">Total Dépenses</div><div class="kpi-value">${totalDepFiltrees.toLocaleString('fr-FR')} ${utilisateur?.devise || 'FCFA'}</div></div>
  <div class="kpi"><div class="kpi-label">Solde Net</div><div class="kpi-value">${(totalRecFiltrees - totalDepFiltrees).toLocaleString('fr-FR')} ${utilisateur?.devise || 'FCFA'}</div></div>
  <div class="kpi"><div class="kpi-label">Nb Commandes</div><div class="kpi-value">${commandes.items.length}</div></div>
</div>

<h2>Recettes (${recettesFiltrees.length} transactions)</h2>
<table>
  <thead><tr><th>Date</th><th>Description</th><th>Montant</th></tr></thead>
  <tbody>
    ${recettesFiltrees.map(r => `<tr><td>${r.date || '—'}</td><td>${r.description || r.client || '—'}</td><td>${Number(r.montant || 0).toLocaleString('fr-FR')} ${utilisateur?.devise || 'FCFA'}</td></tr>`).join('')}
    ${recettesFiltrees.length === 0 ? '<tr><td colspan="3" style="text-align:center;color:#bbb">Aucune recette sur cette période</td></tr>' : ''}
  </tbody>
</table>

<h2>Dépenses (${depensesFiltrees.length} transactions)</h2>
<table>
  <thead><tr><th>Date</th><th>Description</th><th>Montant</th></tr></thead>
  <tbody>
    ${depensesFiltrees.map(d => `<tr><td>${d.date || '—'}</td><td>${d.description || '—'}</td><td>${Number(d.montant || 0).toLocaleString('fr-FR')} ${utilisateur?.devise || 'FCFA'}</td></tr>`).join('')}
    ${depensesFiltrees.length === 0 ? '<tr><td colspan="3" style="text-align:center;color:#bbb">Aucune dépense sur cette période</td></tr>' : ''}
  </tbody>
</table>

<p class="footer">SweetManager — Rapport généré automatiquement</p>
</body>
</html>`;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.print(); }, 500);
  };

  const stockAffiche = stock.items.filter(s => !stockFiltreCateg || s.categorie === stockFiltreCateg);
  const stockCritique = alertesStock.filter(s => Number(s.quantite) <= Number(s.seuil) / 2);

  const exporterCsvFinances = () => {
    if (finTab === 'depenses') {
      telechargerCsv(
        'depenses.csv',
        ['Date', 'Catégorie', 'Description', 'Montant'],
        depenses.items.map(d => [d.date, d.categorie, d.description, d.montant])
      );
      return;
    }

    if (finTab === 'recettes') {
      telechargerCsv(
        'recettes.csv',
        ['Date', 'Client', 'Description', 'Montant'],
        recettes.items.map(r => [r.date, r.client, r.description, r.montant])
      );
      return;
    }

    const byCategorie = depenses.items.reduce((acc, depense) => {
      acc[depense.categorie] = (acc[depense.categorie] ?? 0) + Number(depense.montant);
      return acc;
    }, {});

    telechargerCsv(
      'bilan.csv',
      ['Section', 'Libellé', 'Valeur'],
      [
        ['Résumé', 'Total recettes', recettes.total],
        ['Résumé', 'Total dépenses', depenses.total],
        ['Résumé', 'Solde net', soldeNet],
        ...Object.entries(byCategorie).map(([categorie, montant]) => ['Répartition dépenses', categorie, montant]),
      ]
    );
  };

  const exporterCsvStock = () => {
    telechargerCsv(
      'stock.csv',
      ['Article', 'Catégorie', 'Quantité', 'Unité', 'Seuil', 'Statut'],
      stockAffiche.map(s => {
        const statut = s.quantite <= 0 || s.quantite < s.seuil / 2
          ? 'critique'
          : s.quantite < s.seuil
          ? 'faible'
          : 'ok';

        return [s.nom, s.categorie, s.quantite, s.unite, s.seuil, statut];
      })
    );
  };

  const exporterCsvCommandes = () => {
    telechargerCsv(
      'commandes.csv',
      ['Client', 'Commande', 'Livraison', 'Montant', 'Statut', 'Notes'],
      commandes.items.map(c => [c.client, c.commande ?? c.description, c.date_livraison ?? c.date, c.montant, c.statut, c.notes ?? ''])
    );
  };

  const evaluerStockProduit = (produit) => {
    const ingredients = produit.ingredients ?? [];
    if (ingredients.length === 0) {
      return { label: 'Sans recette', classe: 'bg-gray-100 text-gray-500' };
    }

    const ratioMin = ingredients.reduce((min, ingredient) => {
      const quantiteStock = Number(ingredient.stockArticle?.quantite ?? 0);
      const seuilStock = Number(ingredient.stockArticle?.seuil ?? 0);
      const ratio = seuilStock > 0 ? quantiteStock / seuilStock : 1;
      return Math.min(min, ratio);
    }, 1);

    if (ratioMin <= 0.5) return { label: 'Stock critique', classe: 'bg-red-50 text-red-700' };
    if (ratioMin < 1) return { label: 'Stock faible', classe: 'bg-amber-50 text-amber-700' };
    return { label: 'OK', classe: 'bg-green-50 text-green-700' };
  };

  // ── Sidebar NavItem ──────────────────────────────────────────────────────
  const NavItem = ({ id, Icon, label, sub }) => (
    <div>
      <button
        onClick={() => {
          if (sub) { setFinOpen(o => !o); setPage('finances'); }
          else navTo(id);
        }}
        className={`flex items-center gap-2.5 w-full px-5 py-2 text-sm text-left transition-colors
          ${page === id
            ? 'bg-blue-50 text-blue-600 font-medium'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
      >
        <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
        <span className="flex-1">{label}</span>
        {sub && (finOpen
          ? <IconChevronUp size={12} strokeWidth={1.5} className="opacity-60" />
          : <IconChevronDown size={12} strokeWidth={1.5} className="opacity-60" />
        )}
      </button>
      {sub && finOpen && (
        <div className="pl-11 py-1">
          {['depenses','recettes','bilan'].map(t => (
            <button key={t} onClick={() => { setFinTab(t); setPage('finances'); }}
              className={`block w-full text-left text-xs py-1.5 pr-4
                ${finTab === t && page === 'finances'
                  ? 'text-blue-500 font-medium'
                  : 'text-gray-400 hover:text-gray-700'}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // ── Bandeau erreur ───────────────────────────────────────────────────────
  const ErrorBanner = () => error ? (
    <div className="mx-5 mt-3 px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 flex items-center gap-2">
      <IconAlertTriangle size={13} strokeWidth={1.5} />
      {error} — Les données affichées sont à zéro.
    </div>
  ) : null;

  // ── Nom affiché dans le chip ─────────────────────────────────────────────
  const nomAffiche = utilisateur?.nom ?? utilisateur?.email ?? 'Utilisateur';
  const initiales  = nomAffiche.slice(0, 2).toUpperCase();

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex min-h-screen bg-transparent text-gray-800 overflow-hidden flex-col md:flex-row relative">

      {/* ── Atmospheric dark mode glow ─────────────────────────────── */}
      <div className="dark-glow-layer">
        <div className="glow-1" />
        <div className="glow-2" />
        <div className="glow-3" />
      </div>

      {/* ── Sidebar (Mobile overlay + Desktop) ─────────────────────── */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed md:relative left-0 top-0 h-full md:h-screen flex flex-col p-md bg-surface-container-low dark:bg-inverse-surface border-r border-outline-variant/30 dark:border-outline/20 w-64 z-50 transition-transform duration-300 flex-shrink-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="flex items-center gap-3 mb-xl">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>bakery_dining</span>
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md text-primary dark:text-primary-fixed-dim leading-none">{utilisateur?.nomBoutique || 'SweetManager'}</h1>
            <p className="font-label-md text-label-md text-on-surface-variant opacity-70">Artisanal Admin</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md transition-all duration-300 ${
                page === item.id || (page === 'finances' && item.id === 'finances')
                  ? 'bg-secondary-container dark:bg-on-secondary-fixed-variant text-on-secondary-container dark:text-secondary-fixed border-l-4 border-primary translate-x-1'
                  : 'text-on-surface-variant dark:text-outline hover:text-primary hover:bg-surface-container-highest dark:hover:bg-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button 
          onClick={() => setModal('commande')}
          className="mb-lg w-full py-3 px-4 bg-primary text-white rounded-xl font-label-md flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 600" }}>add</span>
          <span>Nouvelle commande</span>
        </button>

        <div className="pt-md border-t border-outline-variant/30 dark:border-outline/20 space-y-2">
          <button onClick={() => setPage('params')} className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-outline hover:text-primary hover:bg-surface-container-highest dark:hover:bg-surface-variant transition-all duration-300 font-label-md text-label-md">
            <span className="material-symbols-outlined">settings</span>
            <span>Paramètres</span>
          </button>
          <button onClick={gererDeconnexion} className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-outline hover:text-primary hover:bg-surface-container-highest dark:hover:bg-surface-variant transition-all duration-300 font-label-md text-label-md">
            <span className="material-symbols-outlined">logout</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden w-full md:w-auto">

        {/* Topbar */}
        <header className="sticky top-0 z-40 h-16 px-4 md:px-margin-desktop flex items-center justify-between bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-md border-b border-outline-variant/30 dark:border-outline/20 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-primary" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="hidden sm:flex items-center bg-surface-container px-4 py-1.5 rounded-full border border-outline-variant/20">
              <span className="material-symbols-outlined text-outline mr-2 text-[20px]">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-body-md font-body-md text-on-surface placeholder:text-outline-variant w-48 lg:w-64" placeholder="Rechercher une commande..." type="text"
                value={recherche}
                onChange={(e) => {
                  setRecherche(e.target.value);
                  if (e.target.value.trim() && page !== 'commandes') setPage('commandes');
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-sm">
            <button className="p-2.5 rounded-full hover:bg-surface-container-high transition-colors duration-200 active:scale-95 transition-transform text-primary relative" onClick={() => {
              const isDark = document.documentElement.classList.toggle('dark');
              localStorage.setItem('sm_theme', isDark ? 'dark' : 'light');
            }}>
              <span className="material-symbols-outlined dark:hidden">contrast</span>
              <span className="material-symbols-outlined hidden dark:block">light_mode</span>
            </button>
            <button className="p-2.5 rounded-full hover:bg-surface-container-high transition-colors duration-200 active:scale-95 transition-transform text-primary relative" onClick={() => setPage('stock')}>
              <span className="material-symbols-outlined">notifications</span>
              {alertesStock.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>}
            </button>
            <div className="h-8 w-[1px] bg-outline-variant/30 mx-2"></div>
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setPage('params')}>
              <div className="hidden lg:block text-right">
                <p className="font-label-md text-on-surface">{nomAffiche}</p>
                <p className="text-[11px] text-primary uppercase tracking-widest font-bold">Responsable</p>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-primary bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold shadow-sm">
                {initiales}
              </div>
            </div>
          </div>
        </header>

        <ErrorBanner />

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5">

          {/* ── DASHBOARD ─────────────────────────────────────────────── */}
          {page === 'dashboard' && (
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
                  <p className="font-display-lg text-[32px] text-primary leading-tight">{afficherMontant(totalRecFiltrees)}</p>
                </div>

                {/* Daily Orders KPI */}
                <div className="glass-card p-md rounded-xl shadow-sm hover:shadow-lg transition-all duration-500" onClick={() => navTo('commandes')} style={{ cursor: 'pointer', animationDelay: '0.3s' }}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-primary-fixed rounded-lg text-on-primary-fixed-variant">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_cart</span>
                    </div>
                  </div>
                  <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Commandes du Jour</h3>
                  <p className="font-display-lg text-[32px] text-on-surface leading-tight">{(commandes.items || []).reduce((acc, c) => acc + (c.date === new Date().toISOString().split('T')[0] ? 1 : 0), 0) || prochainesCommandes.length}</p>
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
                  <p className="font-display-lg text-[32px] text-tertiary leading-tight">{afficherMontant(totalDepFiltrees)}</p>
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
                    <MiniChart recData={recHist} depData={depHist} onClick={() => navTo('stats')} />
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
          {page === 'finances' && (
            <div className="space-y-gutter stagger-in">
              {/* Header & CTA */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md mb-xl" style={{ animationDelay: '0.1s' }}>
                <div>
                  <h1 className="font-display-lg text-[28px] sm:text-[40px] md:text-display-lg text-primary mb-2">Finances</h1>
                  <p className="text-on-surface-variant max-w-full md:max-w-[600px]">Suivez la santé financière de votre boutique avec précision et élégance. Analysez vos revenus et optimisez vos dépenses.</p>
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
                    <h3 className="font-headline-lg text-headline-lg text-on-surface">{afficherMontant(totalRecFiltrees)}</h3>
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
                    <h3 className="font-headline-lg text-headline-lg text-on-surface">{afficherMontant(totalDepFiltrees)}</h3>
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
                    <h3 className="font-headline-lg text-headline-lg text-primary font-bold">{afficherMontant(totalRecFiltrees - totalDepFiltrees)}</h3>
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter" style={{ animationDelay: '0.3s' }}>
                <div className="lg:col-span-12 glass-card p-md rounded-xl overflow-hidden flex flex-col shadow-sm">
                  <div className="flex justify-between items-center mb-md border-b border-outline-variant/20 pb-4">
                    <h4 className="font-headline-md text-headline-md text-on-surface">Transactions Récentes</h4>
                    <div className="flex gap-2">
                       <button onClick={() => setFinTab('recettes')} className={`px-4 py-1.5 rounded-full text-label-sm font-medium transition-colors ${finTab === 'recettes' ? 'bg-primary text-white' : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}>Recettes</button>
                       <button onClick={() => setFinTab('depenses')} className={`px-4 py-1.5 rounded-full text-label-sm font-medium transition-colors ${finTab === 'depenses' ? 'bg-primary text-white' : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}>Dépenses</button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-x-auto custom-scrollbar">
                    {loading ? (
                       <TableSkeleton rows={4} cols={4} />
                    ) : (finTab === 'depenses' ? depenses.items : recettes.items).length === 0 ? (
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
                          {(finTab === 'depenses' ? depenses.items : recettes.items).map(item => (
                            <tr key={item.id} className="hover:bg-surface-container-lowest transition-colors group">
                              <td className="px-lg py-5 font-body-md text-on-surface-variant">{item.date}</td>
                              <td className="px-lg py-5 text-on-surface font-medium">{item.description}</td>
                              <td className={`px-lg py-5 text-right font-bold ${finTab === 'depenses' ? 'text-on-surface' : 'text-primary'}`}>
                                {item.montant != null && !Number.isNaN(Number(item.montant)) ? (finTab === 'depenses' ? `- ${afficherMontant(Number(item.montant))}` : `+ ${afficherMontant(Number(item.montant))}`) : '—'}
                              </td>
                              <td className="px-lg py-5 text-right">
                                <button onClick={() => confirm(`Supprimer cette ${finTab.slice(0,-1)} ?`) && supprimerFin(finTab.slice(0,-1), item.id)} className="text-on-surface-variant hover:text-error transition-colors p-2 rounded-full hover:bg-error-container/30">
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
          
          {/* ── STOCK ─────────────────────────────────────────────── */}
          {page === 'stock' && (
            <div className="space-y-gutter stagger-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-xl" style={{ animationDelay: '0.1s' }}>
                <div>
                  <h1 className="font-display-lg text-[28px] sm:text-[40px] md:text-display-lg text-primary mb-2">Stock</h1>
                  <p className="text-on-surface-variant max-w-[600px]">Ingrédients et matériaux</p>
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
                          const statut = s.quantite <= 0 || s.quantite <= s.seuil / 2 ? 'critique' : s.quantite <= s.seuil ? 'faible' : 'ok';
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
                                      await fetch(`${BASE_URL}/api/stock/${s.id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
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
                                      await fetch(`${BASE_URL}/api/stock/${s.id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
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
                  <h1 className="font-display-lg text-[28px] sm:text-[40px] md:text-display-lg text-primary mb-2">Produits</h1>
                  <p className="text-on-surface-variant max-w-[600px]">Catalogue de vos pâtisseries</p>
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
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => ouvrirEditionProduit(p)} className="text-on-surface-variant hover:text-primary transition-all p-2 rounded-full hover:bg-primary/10">
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button onClick={() => supprimerProduit(p.id)} className="text-on-surface-variant hover:text-error transition-all p-2 rounded-full hover:bg-error-container/30">
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </div>
                        <div className="text-[28px] font-display-lg text-primary mb-4">
                          {afficherMontant(Number(p.prix))}
                        </div>
                        <div className="mb-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeColor}`}>{etatStock.label}</span>
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
                  <h1 className="font-display-lg text-[28px] sm:text-[40px] md:text-display-lg text-primary mb-2">Commandes</h1>
                  <p className="text-on-surface-variant max-w-[600px]">Suivi des commandes clients</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex bg-surface-container rounded-full p-1 border border-outline-variant/30">
                    <button onClick={() => setCmdView('liste')} className={`px-4 py-1.5 rounded-full text-label-md font-medium transition-colors ${cmdView === 'liste' ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:text-on-surface'}`}>
                      Liste
                    </button>
                    <button onClick={() => setCmdView('calendrier')} className={`px-4 py-1.5 rounded-full text-label-md font-medium transition-colors ${cmdView === 'calendrier' ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:text-on-surface'}`}>
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
                          {commandesRecherchees.map(c => (
                            <tr key={c.id} className="hover:bg-surface-container-lowest transition-colors group">
                              <td className="px-lg py-5 font-headline-md text-on-surface">{c.client}</td>
                              <td className="px-lg py-5 text-on-surface-variant font-body-md max-w-xs truncate" title={c.commande ?? c.description}>{c.commande ?? c.description}</td>
                              <td className="px-lg py-5 text-on-surface-variant font-body-md">{c.date_livraison ?? c.date}</td>
                              <td className="px-lg py-5 font-bold text-primary">{afficherMontant(c.montant)}</td>
                              <td className="px-lg py-5">
                                <select
                                  value={statutsEffectifs[c.id] ?? c.statut}
                                  disabled={(statutsEffectifs[c.id] ?? c.statut) === 'Livré'}
                                  onChange={async e => {
                                    const nouveauStatut = e.target.value
                                    const ancienStatut = statutsEffectifs[c.id] ?? c.statut
                                    setStatuts(s => ({ ...s, [c.id]: nouveauStatut }))
                                    try {
                                      const res = await fetch(`${BASE_URL}/api/commandes/${c.id}/statut`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                                        body: JSON.stringify({ statut: nouveauStatut })
                                      })
                                      if (!res.ok) throw new Error(`Erreur ${res.status}`)
                                      refetch()
                                    } catch (err) {
                                      console.error(err)
                                      setStatuts(s => ({ ...s, [c.id]: ancienStatut }))
                                    }
                                  }}
                                  className={`bg-transparent border border-outline-variant/30 rounded-lg px-3 py-1.5 focus:ring-primary focus:border-primary text-on-surface font-medium text-sm ${
                                    (statutsEffectifs[c.id] ?? c.statut) === 'Livré'
                                      ? 'opacity-60 cursor-not-allowed bg-primary/5 border-primary/20 text-primary'
                                      : ''
                                  }`}>
                                  {['En cours','Confirmé','Prêt','Livré','Annulé'].map(s => <option key={s}>{s}</option>)}
                                </select>
                              </td>
                              <td className="px-lg py-5 text-right">
                                <div className="flex gap-1 justify-end">
                                  <button onClick={() => { setCommandeAffichee(c); setModal('commande_detail'); }} className="p-2 rounded-full hover:bg-surface-container text-primary transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                                  </button>
                                  <button onClick={() => { window.open(`${BASE_URL}/api/pdf/commande/${c.id}?token=${localStorage.getItem('token')}`, '_blank') }} className="p-2 rounded-full hover:bg-surface-container text-tertiary transition-colors">
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
                      const cmdsJour = commandesRecherchees.filter(c => {
                        const date = new Date(c.date_livraison ?? c.date);
                        return date.getDate() === d;
                      });
                      const hasCmd = cmdsJour.length > 0;
                      return (
                        <div key={d} onClick={() => { if(hasCmd) { setCommandeAffichee(cmdsJour[0]); setModal('commande_detail'); } }} className={`p-3 text-center rounded-xl border transition-all ${hasCmd ? 'border-primary/30 bg-primary/10 text-primary font-bold shadow-sm hover:bg-primary/20 cursor-pointer' : 'border-outline-variant/10 text-on-surface-variant hover:bg-surface-container cursor-pointer'}`}>
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
                        className={`px-4 py-1.5 rounded-full text-label-md font-medium transition-all duration-200 ${statsPeriode === p.k ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:text-on-surface'}`}>
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
                    { l:'Recettes', v: afficherMontant(totalRecFiltrees), c:'text-primary', bg:'bg-primary/10', icon: 'trending_up', sub: `${recettesFiltrees.length} transaction${recettesFiltrees.length !== 1 ? 's' : ''}` },
                    { l:'Dépenses', v: afficherMontant(totalDepFiltrees), c:'text-error',   bg:'bg-error/10',   icon: 'trending_down', sub: `${depensesFiltrees.length} transaction${depensesFiltrees.length !== 1 ? 's' : ''}` },
                    { l:'Solde Net', v: afficherMontant(totalRecFiltrees - totalDepFiltrees), c: (totalRecFiltrees - totalDepFiltrees) >= 0 ? 'text-primary' : 'text-error', bg:'bg-tertiary/10', icon: 'account_balance_wallet', sub: 'Recettes − Dépenses' },
                    { l:'Commandes', v: String(commandes.items.length), c:'text-tertiary', bg:'bg-tertiary/10', icon: 'shopping_cart', sub: 'Total boutique' },
                  ].map(k => (
                    <div key={k.l} className="glass-card rounded-2xl p-md flex items-center gap-4 hover:shadow-lg transition-all duration-300 group">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${k.bg} group-hover:scale-110 transition-transform duration-300`}>
                        <span className={`material-symbols-outlined ${k.c}`} style={{ fontVariationSettings: "'FILL' 1" }}>{k.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-label-md text-on-surface-variant tracking-wider uppercase mb-1 truncate">{k.l}</div>
                        <div className={`text-[22px] font-bold leading-none ${k.c} truncate`}>{k.v}</div>
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
                  Évolution de la période ({statsPeriode === 'mois' ? 'Jours du mois' : statsPeriode === 'trimestre' ? 'Mois du trimestre' : 'Mois de l\'année'})
                </div>
                <div className="w-full h-72">
                  <EvolutionChart recData={statsChart.recData} depData={statsChart.depData} labels={statsChart.labels} barAreaHeight={220} />
                </div>
                <div className="flex gap-6 mt-6 justify-center">
                  <span className="flex items-center gap-2 font-label-md text-on-surface-variant"><span className="w-3 h-3 bg-primary rounded-full inline-block" /> Recettes</span>
                  <span className="flex items-center gap-2 font-label-md text-on-surface-variant"><span className="w-3 h-3 bg-error rounded-full inline-block" /> Dépenses</span>
                </div>
              </div>

              {/* Table des transactions filtrées */}
              <div className="glass-card rounded-2xl overflow-hidden mt-6" style={{ animationDelay: '0.4s' }}>
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
                            <td className={`px-lg py-4 text-right font-bold ${item.type === 'recette' ? 'text-primary' : 'text-error'}`}>
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
          )}

          {/* ── PARAMÈTRES ────────────────────────────────────────────── */}
          {page === 'params' && (
            <div className="space-y-gutter stagger-in">
              <div className="mb-xl" style={{ animationDelay: '0.1s' }}>
                <h1 className="font-display-lg text-[28px] sm:text-[40px] md:text-display-lg text-primary mb-2">Paramètres</h1>
                <p className="text-on-surface-variant max-w-[600px]">Configurez votre profil et les préférences de la boutique.</p>
              </div>

              <div className="glass-card rounded-2xl p-lg max-w-[800px] mx-auto" style={{ animationDelay: '0.2s' }}>
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
                          <option className="bg-surface text-on-surface dark:bg-[#121C1A]" value="FCFA">FCFA</option>
                          <option className="bg-surface text-on-surface dark:bg-[#121C1A]" value="EUR">EUR</option>
                          <option className="bg-surface text-on-surface dark:bg-[#121C1A]" value="USD">USD</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="font-label-md text-on-surface-variant uppercase tracking-wider">Seuil alerte stock par défaut</label>
                        <input type="number" min="0" value={paramsForm.seuilAlerteDefaut} onChange={(e) => setParamsForm({ ...paramsForm, seuilAlerteDefaut: e.target.value })} className="bg-transparent border border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface focus:ring-primary focus:border-primary transition-colors" />
                      </div>
                    </div>

                    {paramsMsg && (
                      <div className={`p-4 rounded-xl flex items-center gap-3 ${paramsMsg.type === 'success' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-error/10 text-error border border-error/20'}`}>
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

        </main>
      </div>

      {/* ── MODALS ────────────────────────────────────────────────────── */}
      {modal === 'depense' && (
        <Modal title="Nouvelle dépense" onClose={() => setModal(null)}>
          <Field label="Date">
            <input 
              type="date" 
              className={inp}
              value={depenseForm.date}
              onChange={(e) => setDepenseForm({ ...depenseForm, date: e.target.value })}
            />
          </Field>
          <Field label="Catégorie">
            <select 
              className={inp}
              value={depenseForm.categorie}
              onChange={(e) => setDepenseForm({ ...depenseForm, categorie: e.target.value })}
            >
              <option>Ingrédients</option>
              <option>Emballages</option>
              <option>Matériel</option>
              <option>Autre</option>
            </select>
          </Field>
          <Field label="Description">
            <input 
              placeholder="Ex : Farine, sucre..." 
              className={inp}
              value={depenseForm.description}
              onChange={(e) => setDepenseForm({ ...depenseForm, description: e.target.value })}
            />
          </Field>
          <Field label={`Montant (${devise})`}>
            <input 
              type="number" 
              placeholder="0" 
              min="0"
              className={inp}
              value={depenseForm.montant}
              onChange={(e) => setDepenseForm({ ...depenseForm, montant: Math.max(0, parseFloat(e.target.value) || 0) })}
            />
          </Field>
          <ModalFooter onClose={() => setModal(null)} onSave={sauvegarderDepense} saving={depenseSaving} />
        </Modal>
      )}
      {modal === 'recette' && (
        <Modal title="Nouvelle recette" onClose={() => setModal(null)}>
          <Field label="Date">
            <input 
              type="date" 
              className={inp}
              value={recetteForm.date}
              onChange={(e) => setRecetteForm({ ...recetteForm, date: e.target.value })}
            />
          </Field>
          <Field label="Client">
            <input 
              placeholder="Nom du client" 
              className={inp}
              value={recetteForm.client}
              onChange={(e) => setRecetteForm({ ...recetteForm, client: e.target.value })}
            />
          </Field>
          <Field label="Description">
            <input 
              placeholder="Ex : Gâteau anniversaire" 
              className={inp}
              value={recetteForm.description}
              onChange={(e) => setRecetteForm({ ...recetteForm, description: e.target.value })}
            />
          </Field>
          <Field label={`Montant (${devise})`}>
            <input 
              type="number" 
              placeholder="0" 
              min="0"
              className={inp}
              value={recetteForm.montant}
              onChange={(e) => setRecetteForm({ ...recetteForm, montant: Math.max(0, parseFloat(e.target.value) || 0) })}
            />
          </Field>
          <ModalFooter onClose={() => setModal(null)} onSave={sauvegarderRecette} saving={recetteSaving} />
        </Modal>
      )}
      {modal === 'commande' && (
        <Modal title="Nouvelle commande" onClose={() => setModal(null)}>
          <Field label="Client">
            <input 
              placeholder="Nom du client" 
              className={inp}
              value={commandeForm.client}
              onChange={(e) => setCommandeForm({ ...commandeForm, client: e.target.value })}
            />
          </Field>

          <Field label="Produits commandés">
            {produits.length === 0 ? (
              <p className="text-xs text-gray-400">Aucun produit dans le catalogue.</p>
            ) : (
              <div className="space-y-2 max-h-32 overflow-y-auto border border-outline-variant/30 rounded-lg p-2">
                {produits.map(p => {
                  const ligne = commandeForm.lignes?.find(l => l.produitId === p.id)
                  return (
                    <div key={p.id} className="flex items-center justify-between gap-2 p-2 bg-surface-container rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-on-surface truncate">{p.nom}</div>
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-0.5">
                          <span>{afficherMontant(Number(p.prix))}</span>
                        </div>
                      </div>
                      <input 
                        type="number" 
                        min="0" 
                        placeholder="Qté"
                        value={ligne?.quantite ?? 0}
                        onChange={(e) => {
                          const qte = parseInt(e.target.value) || 0
                          const lignes = commandeForm.lignes?.filter(l => l.produitId !== p.id) ?? []
                          if (qte > 0) {
                            setCommandeForm({
                              ...commandeForm,
                              lignes: [...lignes, { produitId: p.id, quantite: qte, prixUnitaire: Number(p.prix) }]
                            })
                          } else {
                            setCommandeForm({ ...commandeForm, lignes })
                          }
                        }}
                        className="w-16 text-xs px-2 py-1 border border-outline-variant/30 rounded-md bg-transparent text-on-surface"
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </Field>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5 mb-3">
            <div className="text-xs font-medium text-blue-700">
              Total : 
              <span className="font-semibold ml-1">
                {afficherMontant((commandeForm.lignes ?? []).reduce((acc, l) => acc + l.quantite * l.prixUnitaire, 0))}
              </span>
            </div>
          </div>

          <Field label="Date livraison">
            <input 
              type="date" 
              className={inp}
              value={commandeForm.date}
              onChange={(e) => setCommandeForm({ ...commandeForm, date: e.target.value })}
            />
          </Field>

          <Field label="Notes">
            <input 
              placeholder="Notes supplémentaires..." 
              className={inp}
              value={commandeForm.commande}
              onChange={(e) => setCommandeForm({ ...commandeForm, commande: e.target.value })}
            />
          </Field>

          <ModalFooter onClose={() => setModal(null)} onSave={sauvegarderCommande} saving={commandeSaving} />
        </Modal>
      )}
      {modal === 'commande_detail' && commandeAffichee && (
        <Modal title={`Détails commande de ${commandeAffichee.client}`} onClose={() => { setModal(null); setCommandeAffichee(null); }}>
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
      {modal === 'stock' && (
        <Modal title="Nouvel article" onClose={() => setModal(null)}>
          <Field label="Nom de l'article">
            <input 
              placeholder="Ex : Farine T45" 
              className={inp}
              value={stockForm.nom}
              onChange={(e) => setStockForm({ ...stockForm, nom: e.target.value })}
            />
          </Field>
          <Field label="Catégorie">
            {!stockCatSaisie ? (
              <div className="space-y-2">
                <select 
                  className={inp}
                  value={stockForm.categorie}
                  onChange={(e) => setStockForm({ ...stockForm, categorie: e.target.value })}
                >
                  <option className="bg-surface text-on-surface dark:bg-[#121C1A]" value="">Sélectionner...</option>
                  <option className="bg-surface text-on-surface dark:bg-[#121C1A]">Farine & céréales</option>
                  <option className="bg-surface text-on-surface dark:bg-[#121C1A]">Matières grasses</option>
                  <option className="bg-surface text-on-surface dark:bg-[#121C1A]">Chocolat & cacao</option>
                  <option className="bg-surface text-on-surface dark:bg-[#121C1A]">Emballages</option>
                  <option className="bg-surface text-on-surface dark:bg-[#121C1A]">Autre</option>
                </select>
                <button 
                  onClick={() => { setStockCatSaisie(true); setStockForm({ ...stockForm, categorie: '' }); }}
                  className="w-full text-xs px-2 py-1.5 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                  Créer une catégorie personnalisée
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input 
                  placeholder="Ex : Fruits & légumes" 
                  className={inp}
                  value={stockForm.categorie}
                  onChange={(e) => setStockForm({ ...stockForm, categorie: e.target.value })}
                />
                <button 
                  onClick={() => { setStockCatSaisie(false); setStockForm({ ...stockForm, categorie: '' }); }}
                  className="w-full text-xs px-2 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                  Utiliser catégories prédéfinies
                </button>
              </div>
            )}
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Quantité">
              <input 
                type="number" 
                placeholder="0" 
                min="0"
                className={inp}
                value={stockForm.quantite}
                onChange={(e) => setStockForm({ ...stockForm, quantite: Math.max(0, parseFloat(e.target.value) || 0) })}
              />
            </Field>
            <Field label="Unité">
              <select 
                className={inp}
                value={stockForm.unite}
                onChange={(e) => setStockForm({ ...stockForm, unite: e.target.value })}
              >
                <option className="bg-surface text-on-surface dark:bg-[#121C1A]">kg</option>
                <option className="bg-surface text-on-surface dark:bg-[#121C1A]">g</option>
                <option className="bg-surface text-on-surface dark:bg-[#121C1A]">L</option>
                <option className="bg-surface text-on-surface dark:bg-[#121C1A]">unités</option>
              </select>
            </Field>
          </div>
          <Field label="Seuil d'alerte">
            <input 
              type="number" 
              placeholder="5" 
              min="0"
              className={inp}
              value={stockForm.seuilAlerte}
              onChange={(e) => setStockForm({ ...stockForm, seuilAlerte: Math.max(0, parseFloat(e.target.value) || 0) })}
            />
          </Field>
          <ModalFooter onClose={() => setModal(null)} onSave={sauvegarderArticle} saving={stockSaving} />
        </Modal>
      )}
      {modal === 'produit' && (
        <Modal title={produitEnEdition ? 'Modifier le produit' : 'Nouveau produit'} onClose={() => { setModal(null); setProduitEnEdition(null); setProduitForm({ nom: '', categorie: '', prix: '', description: '', ingredients: [] }); }}>
          <Field label="Nom du produit">
            <input 
              placeholder="Ex : Gâteau au chocolat" 
              className={inp}
              value={produitForm.nom}
              onChange={(e) => setProduitForm({ ...produitForm, nom: e.target.value })}
            />
          </Field>
          <Field label="Catégorie">
            <input 
              placeholder="Ex : Gâteaux" 
              className={inp}
              value={produitForm.categorie}
              onChange={(e) => setProduitForm({ ...produitForm, categorie: e.target.value })}
            />
          </Field>
          <Field label={`Prix (${devise})`}>
            <input 
              type="number" 
              placeholder="0" 
              min="0"
              className={inp}
              value={produitForm.prix}
              onChange={(e) => setProduitForm({ ...produitForm, prix: Math.max(0, parseFloat(e.target.value) || 0) })}
            />
          </Field>
          <Field label="Description">
            <input 
              placeholder="Détails du produit" 
              className={inp}
              value={produitForm.description}
              onChange={(e) => setProduitForm({ ...produitForm, description: e.target.value })}
            />
          </Field>
          <Field label="Ingrédients nécessaires">
            {stock.items.map(s => (
              <div key={s.id} className="flex items-center gap-2 py-1.5 border-b border-outline-variant/30 last:border-0">
                <span className="text-xs text-on-surface flex-1">{s.nom} ({s.unite})</span>
                <input 
                  type="number" 
                  placeholder="0" 
                  min="0"
                  className="w-16 text-xs px-2 py-1 border border-outline-variant/30 rounded-md bg-transparent text-on-surface focus:ring-primary focus:border-primary focus:outline-none transition-colors"
                  value={produitForm.ingredients.find(i => i.stockArticleId === s.id)?.quantite || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    const exists = produitForm.ingredients.find(i => i.stockArticleId === s.id);
                    if (val > 0) {
                      if (exists) {
                        setProduitForm({ 
                          ...produitForm, 
                          ingredients: produitForm.ingredients.map(i => 
                            i.stockArticleId === s.id ? { ...i, quantite: val } : i
                          ) 
                        });
                      } else {
                        setProduitForm({ 
                          ...produitForm, 
                          ingredients: [...produitForm.ingredients, { stockArticleId: s.id, quantite: val }] 
                        });
                      }
                    } else {
                      setProduitForm({ 
                        ...produitForm, 
                        ingredients: produitForm.ingredients.filter(i => i.stockArticleId !== s.id) 
                      });
                    }
                  }}
                />
              </div>
            ))}
            {stock.items.length === 0 && (
              <div className="text-xs text-gray-400 py-2 italic">
                Ajoutez d'abord des articles en stock.
              </div>
            )}
          </Field>
          <ModalFooter onClose={() => { setModal(null); setProduitEnEdition(null); setProduitForm({ nom: '', categorie: '', prix: '', description: '', ingredients: [] }); }} onSave={sauvegarderProduit} saving={produitSaving} />
        </Modal>
      )}

      {/* ── Mobile bottom nav ─────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface/95 dark:bg-[#0a0704]/95 backdrop-blur-lg border-t border-outline-variant/20 flex justify-around items-center z-50 shadow-xl no-print pb-safe">
        {[
          { id: 'dashboard', icon: 'dashboard',   label: 'Accueil' },
          { id: 'finances',  icon: 'payments',    label: 'Finances' },
          { id: 'commandes', icon: 'shopping_bag',label: 'Commandes' },
          { id: 'stock',     icon: 'inventory_2', label: 'Stock' },
          { id: 'stats',     icon: 'analytics',   label: 'Stats' },
        ].map(item => (
          <button key={item.id} onClick={() => { setPage(item.id); setSidebarOpen(false); }}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all ${page === item.id ? 'text-primary' : 'text-on-surface-variant'}`}>
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: page === item.id ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
            <span className="text-[9px] font-medium uppercase tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* ── Confirm Dialog ────────────────────────────────────────────── */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface dark:bg-[#1a1614] border border-outline-variant/30 rounded-2xl p-6 w-[90%] min-w-[300px] max-w-sm shadow-2xl animate-staggerIn">
            <h3 className="text-headline-sm font-headline-sm text-on-surface mb-2 break-words">{confirmDialog.title}</h3>
            <p className="text-body-md text-on-surface-variant mb-6 break-words">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3 mt-2">
              <button onClick={() => setConfirmDialog(null)} className="px-5 py-2 rounded-full font-medium text-on-surface-variant hover:bg-surface-container transition-colors">
                Annuler
              </button>
              <button onClick={confirmDialog.onConfirm} className="px-5 py-2 rounded-full font-medium bg-error/10 text-error hover:bg-error/20 transition-colors">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification ────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed top-safe mt-4 left-1/2 -translate-x-1/2 z-[100] animate-staggerIn">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-lg border backdrop-blur-md ${toastMessage.type === 'error' ? 'bg-error/10 border-error/20 text-error' : 'bg-primary/10 border-primary/20 text-primary'}`}>
            <span className="material-symbols-outlined text-[20px]">{toastMessage.type === 'error' ? 'error' : 'check_circle'}</span>
            <span className="font-medium text-sm">{toastMessage.text}</span>
            <button onClick={() => setToastMessage(null)} className="ml-2 opacity-70 hover:opacity-100">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}