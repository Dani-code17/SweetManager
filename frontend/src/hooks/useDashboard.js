// src/hooks/useDashboard.js
import { useState, useEffect, useCallback } from 'react'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

const defaultState = {
  depenses:  { total: 0, items: [] },
  recettes:  { total: 0, items: [] },
  stock:     { items: [] },
  commandes: { items: [] },
}

// ─── fetchJSON sécurisé avec token JWT ───────────────────────────────────────
async function fetchJSON(url, fallback) {
  const token = localStorage.getItem('token')

  let res
  try {
    res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  } catch {
    throw new Error('Impossible de joindre le serveur.')
  }

  const contentType = res.headers.get('content-type') ?? ''
  const isJSON = contentType.includes('application/json')

  if (!res.ok) {
    if (res.status === 401) throw new Error('SESSION_EXPIREE')
    const detail = isJSON ? (await res.json()).message ?? res.statusText : res.statusText
    throw new Error(`[${res.status}] ${detail}`)
  }

  if (!isJSON) {
    console.warn(`[useDashboard] ${url} a renvoyé du HTML. Vérifiez VITE_API_URL.`)
    return fallback
  }

  return res.json()
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useDashboard() {
  const [data,    setData]    = useState(defaultState)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [depenses, recettes, stock, commandes, recHist, depHist] = await Promise.all([
        fetchJSON(`${BASE_URL}/api/depenses?periode=all`, defaultState.depenses),
        fetchJSON(`${BASE_URL}/api/recettes?periode=all`, defaultState.recettes),
        fetchJSON(`${BASE_URL}/api/stock`,                 defaultState.stock),
        fetchJSON(`${BASE_URL}/api/commandes`,             defaultState.commandes),
        fetchJSON(`${BASE_URL}/api/recettes/historique`,   [0,0,0,0,0,0]),
        fetchJSON(`${BASE_URL}/api/depenses/historique`,   [0,0,0,0,0,0]),
      ])

      setData({
        depenses:  { ...depenses,  historique: depHist },
        recettes:  { ...recettes,  historique: recHist },
        stock,
        commandes,
      })
    } catch (err) {
      console.error('[useDashboard]', err)
      if (err.message === 'SESSION_EXPIREE') {
        localStorage.removeItem('token')
        window.location.href = '/connexion'
        return
      }
      setError(err.message ?? 'Erreur inconnue')
      setData(defaultState)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const soldeNet = (data.recettes.total ?? 0) - (data.depenses.total ?? 0)

  const alertesStock = (data.stock.items ?? []).filter(
    s => Number(s.quantite) <= Number(s.seuil)
  )

  const now = new Date()
  const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const prochainesCommandes = (data.commandes.items ?? []).filter(c => {
    const d = new Date(c.date_livraison ?? c.date)
    return d >= now && d <= in7
  })

  return {
    depenses: data.depenses,
    recettes: data.recettes,
    stock:    data.stock,
    commandes: data.commandes,
    soldeNet,
    alertesStock,
    prochainesCommandes,
    loading,
    error,
    refetch: fetchAll,
  }
}