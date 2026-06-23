import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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

  const t = dark ? {
    bg: '#1a1210', bg2: '#221815', bg3: '#2e1f1a',
    txt: '#f0e8e4', txt2: '#9a8880', txt3: '#5a4a44',
    acc: '#c97a68', acc2: '#b5695a',
    brd: '#3a2820', inp: '#2a1c18', inpbrd: '#3a2820',
  } : {
    bg: '#fdf8f5', bg2: '#ffffff', bg3: '#f5ede8',
    txt: '#2a1f1a', txt2: '#8a7570', txt3: '#b8a8a2',
    acc: '#b5695a', acc2: '#d4927f',
    brd: '#ecddd8', inp: '#ffffff', inpbrd: '#ddd0ca',
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
      await axios.post('http://localhost:5000/api/auth/inscrire', {
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

  const champ = (key, label, type = 'text', placeholder = '') => (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 10, fontWeight: 500, letterSpacing: '.12em', textTransform: 'uppercase', color: t.txt3, marginBottom: 7 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={key.includes('mot') || key === 'confirmation' ? (showPass ? 'text' : 'password') : type}
          value={form[key]}
          onChange={e => setForm({ ...form, [key]: e.target.value })}
          placeholder={placeholder}
          required
          style={{
            width: '100%', background: t.inp, border: `1px solid ${t.inpbrd}`,
            borderRadius: 8, padding: key.includes('mot') || key === 'confirmation' ? '12px 44px 12px 16px' : '12px 16px',
            fontSize: 13, fontFamily: "'Jost', sans-serif", color: t.txt, outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = t.acc}
          onBlur={e => e.target.style.borderColor = t.inpbrd}
        />
        {(key === 'motDePasse') && (
          <button type="button" onClick={() => setShowPass(v => !v)}
            style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: 44, background: 'none', border: 'none', cursor: 'pointer', color: t.txt3, fontSize: 14 }}>
            {showPass ? '🙈' : '👁'}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 760px) { .left-panel { display: none !important; } .right-panel { width: 100% !important; } }
      `}</style>

      <div style={{ minHeight: '100vh', background: t.bg, fontFamily: "'Jost', sans-serif", display: 'flex' }}>

        {/* Panneau gauche */}
        <div className="left-panel" style={{
          flex: 1, background: t.bg3, display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', padding: '48px 56px',
          borderRight: `1px solid ${t.brd}`, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -100, right: -80, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle,rgba(181,105,90,.12) 0%,transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -40, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle,rgba(181,105,90,.08) 0%,transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, zIndex: 1 }}>
            <div style={{ width: 34, height: 34, background: t.acc, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎂</div>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: t.txt, fontWeight: 600 }}>SweetManager</span>
          </div>

          <div style={{ zIndex: 1 }}>
            <div style={{ width: 32, height: 2, background: t.acc, marginBottom: 20 }} />
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 28, lineHeight: 1.5, color: t.txt, marginBottom: 16 }}>
              Gérez votre pâtisserie<br />
              avec <em style={{ color: t.acc, fontStyle: 'normal' }}>élégance</em>.
            </p>
            <p style={{ fontSize: 11, color: t.txt3, letterSpacing: '.14em', textTransform: 'uppercase' }}>Créez votre espace en 30 secondes</p>
          </div>

          <div style={{ display: 'flex', gap: 36, zIndex: 1 }}>
            {[['Stock', 'Intelligent'], ['Commandes', 'Simplifiées'], ['Finances', 'Claires']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: t.acc, fontWeight: 600 }}>{n}</div>
                <div style={{ fontSize: 10, color: t.txt3, letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Panneau droit */}
        <div className="right-panel" style={{
          width: 400, flexShrink: 0, background: t.bg2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '48px', position: 'relative',
        }}>
          <button onClick={() => setDark(d => !d)} style={{
            position: 'absolute', top: 20, right: 20,
            background: t.bg3, border: `1px solid ${t.brd}`, borderRadius: 20,
            padding: '6px 14px', fontSize: 11, fontFamily: "'Jost', sans-serif",
            color: t.txt2, cursor: 'pointer',
          }}>
            {dark ? '☀ Clair' : '🌙 Sombre'}
          </button>

          <div style={{
            width: '100%', maxWidth: 320,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity .5s ease, transform .5s ease',
          }}>
            <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '.16em', textTransform: 'uppercase', color: t.acc, marginBottom: 10 }}>
              Nouveau compte
            </p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, color: t.txt, lineHeight: 1.1, marginBottom: 6 }}>
              Bienvenue
            </h1>
            <p style={{ fontSize: 13, color: t.txt2, fontWeight: 300, marginBottom: 32 }}>
              Créez votre espace de gestion
            </p>

            <form onSubmit={gererSoumission}>
              {champ('nom', 'Nom complet', 'text', 'Marie Koné')}
              {champ('email', 'Adresse e-mail', 'email', 'votre@email.com')}
              {champ('motDePasse', 'Mot de passe', 'password', '••••••••')}
              {champ('confirmation', 'Confirmer le mot de passe', 'password', '••••••••')}

              {erreur && (
                <div style={{
                  background: 'rgba(180,60,50,.07)', border: '1px solid rgba(180,60,50,.2)',
                  borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#c46060',
                  marginBottom: 16, display: 'flex', gap: 8,
                }}>
                  <span>⚠</span><span>{erreur}</span>
                </div>
              )}

              <button type="submit" disabled={chargement} style={{
                width: '100%', background: t.acc, color: '#fff', border: 'none',
                borderRadius: 8, padding: 14, fontSize: 11, fontFamily: "'Jost', sans-serif",
                fontWeight: 500, letterSpacing: '.15em', textTransform: 'uppercase',
                cursor: chargement ? 'default' : 'pointer', marginTop: 4,
                opacity: chargement ? .5 : 1, transition: 'opacity .2s',
              }}>
                {chargement
                  ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                      Création…
                    </span>
                  : 'Créer mon compte'
                }
              </button>
            </form>

            <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${t.brd}`, textAlign: 'center' }}>
              <span style={{ fontSize: 12, color: t.txt3 }}>Déjà un compte ? </span>
              <a href="/connexion" style={{ fontSize: 12, color: t.acc, textDecoration: 'none', fontWeight: 500 }}>
                Se connecter
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Inscription