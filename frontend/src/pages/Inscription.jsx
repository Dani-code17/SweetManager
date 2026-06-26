import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const Inscription = () => {
  const [form, setForm] = useState({ nom: '', email: '', motDePasse: '', confirmation: '' })
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { setMounted(true) }, [])

  const passwordStrength = (() => {
    const p = form.motDePasse
    if (!p) return { score: 0, label: '', color: '' }
    let s = 0
    if (p.length >= 8) s++
    if (p.length >= 12) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    if (s <= 1) return { score: 1, label: 'Faible', color: '#ef4444' }
    if (s <= 3) return { score: 2, label: 'Moyen', color: '#f59e0b' }
    if (s <= 4) return { score: 3, label: 'Bon', color: '#0FBD8C' }
    return { score: 4, label: 'Excellent', color: '#2AD39B' }
  })()

  // Palette adaptée pour ce design centré (Clair/Sombre) - Couleurs Sequence
  const t = dark ? {
    bg: '#0B1110', card: '#121C1A',
    txt: '#F8FAFC', txt2: '#94A3B8',
    acc: '#2AD39B', brd: 'rgba(42, 211, 155, 0.15)',
    inp: '#1A2826', inpbrd: 'rgba(42, 211, 155, 0.25)', btnBg: '#2AD39B', btnTxt: '#0B1110',
    glow: 'radial-gradient(circle at center, rgba(42, 211, 155, 0.12) 0%, transparent 60%)'
  } : {
    bg: '#F6F8F9', card: '#FFFFFF',
    txt: '#101828', txt2: '#475467',
    acc: '#0F5B5A', brd: 'rgba(15, 91, 90, 0.12)',
    inp: '#FFFFFF', inpbrd: '#D0D5DD', btnBg: '#101828', btnTxt: '#FFFFFF',
    glow: 'radial-gradient(circle at center, rgba(42, 211, 155, 0.15) 0%, transparent 60%)'
  }

  const gererSoumission = async (e) => {
    e.preventDefault()
    setErreur('')
    if (form.motDePasse !== form.confirmation) {
      setErreur('Les mots de passe ne correspondent pas.')
      return
    }
    if (form.motDePasse.length < 8) {
      setErreur('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    setChargement(true)
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/inscrire`, {
        nom: form.nom,
        email: form.email,
        motDePasse: form.motDePasse
      })
      navigate('/connexion')
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la création du compte.')
    } finally {
      setChargement(false)
    }
  }

  const champ = (key, label, type = 'text', placeholder = '') => {
    const isPwd = key === 'motDePasse' || key === 'confirmation'
    return (
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: t.txt, marginBottom: 8, transition: 'color .3s' }}>
          {label}
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type={isPwd ? (showPass ? 'text' : 'password') : type}
            value={form[key]}
            onChange={e => setForm({ ...form, [key]: e.target.value })}
            placeholder={placeholder}
            required
            style={{
              width: '100%', background: t.inp, border: `1px solid ${t.inpbrd}`, borderRadius: 12,
              padding: isPwd ? '14px 48px 14px 16px' : '14px 16px', fontSize: 15, color: t.txt, outline: 'none',
              transition: 'border-color .2s, box-shadow .2s, background .3s',
            }}
            onFocus={e => {
              e.target.style.borderColor = '#2AD39B'
              e.target.style.boxShadow = `0 0 0 4px ${dark ? 'rgba(42,211,155,0.1)' : 'rgba(42,211,155,0.15)'}`
            }}
            onBlur={e => { e.target.style.borderColor = t.inpbrd; e.target.style.boxShadow = 'none' }}
          />
          {isPwd && (
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              style={{
                position: 'absolute', right: 4, top: 4, bottom: 4, width: 40,
                background: 'none', border: 'none', cursor: 'pointer', color: t.txt2, fontSize: 16,
              }}
            >
              {showPass ? '🙈' : '👁'}
            </button>
          )}
        </div>
        {key === 'motDePasse' && form.motDePasse && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 4, background: t.inpbrd, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 2, width: `${(passwordStrength.score / 4) * 100}%`,
                background: passwordStrength.color, transition: 'width .3s ease, background .3s ease',
              }} />
            </div>
            <span style={{ fontSize: 11, color: passwordStrength.color, fontWeight: 600, minWidth: 60, textAlign: 'right' }}>
              {passwordStrength.label}
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: t.bg, fontFamily: "'Jost', sans-serif",
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', transition: 'background .3s ease'
    }}>
      {/* Background Glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: t.glow, pointerEvents: 'none', zIndex: 0
      }}></div>

      {/* Grid Pattern */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, opacity: dark ? 0.05 : 0.03,
        backgroundImage: 'linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)',
        backgroundSize: '40px 40px', pointerEvents: 'none'
      }}></div>

      {/* Theme Toggle */}
      <button
        onClick={() => setDark(d => !d)}
        style={{
          position: 'absolute', top: 24, right: 24, zIndex: 10,
          background: dark ? '#1A2826' : '#eef2f3', border: `1px solid ${t.brd}`, borderRadius: 24,
          padding: '8px 16px', fontSize: 13, color: t.txt2, cursor: 'pointer',
          fontWeight: 500, transition: 'all .3s ease',
        }}
      >
        {dark ? '☀ Clair' : '🌙 Sombre'}
      </button>

      <div style={{
        zIndex: 1, width: '100%', maxWidth: 440, padding: '20px',
        opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity .6s ease, transform .6s ease',
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        
        {/* Logo / Header */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px',
          background: dark ? 'rgba(42, 211, 155, 0.1)' : 'rgba(42, 211, 155, 0.15)',
          borderRadius: 20, marginBottom: 20, border: `1px solid ${dark ? 'rgba(42, 211, 155, 0.2)' : 'rgba(42, 211, 155, 0.3)'}`
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2AD39B', boxShadow: `0 0 8px #2AD39B` }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: dark ? '#2AD39B' : '#0F5B5A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            SweetManager Inscription
          </span>
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 700, color: t.txt, marginBottom: 32, letterSpacing: '-0.02em', transition: 'color .3s' }}>
          Créez un compte
        </h1>

        {/* Card */}
        <div style={{
          width: '100%', background: t.card, padding: '40px', borderRadius: 24,
          border: `1px solid ${t.brd}`,
          boxShadow: dark ? '0 24px 48px rgba(0,0,0,0.4)' : '0 12px 32px rgba(15,91,90,0.06)',
          transition: 'background .3s, border-color .3s, box-shadow .3s'
        }}>
          <form onSubmit={gererSoumission}>
            {champ('nom', 'Nom complet', 'text', 'Jean Dupont')}
            {champ('email', 'Adresse e-mail', 'email', 'nom@entreprise.com')}
            {champ('motDePasse', 'Mot de passe', 'password', '••••••••')}
            {champ('confirmation', 'Confirmer le mot de passe', 'password', '••••••••')}

            {erreur && (
              <div style={{
                background: dark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2',
                border: `1px solid ${dark ? 'rgba(239, 68, 68, 0.3)' : '#f87171'}`,
                borderRadius: 12, padding: '12px 16px', fontSize: 14, color: dark ? '#fca5a5' : '#b91c1c',
                marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center', fontWeight: 500
              }}>
                ⚠ <span>{erreur}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={chargement || !form.email || !form.motDePasse || !form.nom || !form.confirmation}
              style={{
                width: '100%', background: t.btnBg, color: t.btnTxt, border: 'none', borderRadius: 12,
                padding: '16px', fontSize: 15, fontWeight: 600, cursor: chargement ? 'default' : 'pointer', marginTop: 8,
                opacity: (chargement || !form.email || !form.motDePasse || !form.nom || !form.confirmation) ? .6 : 1, transition: 'all .2s ease',
              }}
            >
              {chargement ? 'Création…' : 'Créer mon compte'}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: t.brd }}></div>
            <span style={{ fontSize: 12, color: t.txt2, fontWeight: 500, textTransform: 'uppercase' }}>Ou</span>
            <div style={{ flex: 1, height: 1, background: t.brd }}></div>
          </div>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <span style={{ fontSize: 14, color: t.txt2 }}>Déjà un compte ? </span>
            <Link to="/connexion" style={{ fontSize: 14, color: t.acc, textDecoration: 'none', fontWeight: 600 }}>
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Inscription
