import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const Connexion = () => {
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { connecter } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { setMounted(true) }, [])

  const gererSoumission = async (e) => {
    e.preventDefault()
    setChargement(true)
    setErreur('')
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/connecter`, { email, motDePasse })
      connecter(res.data.utilisateur, res.data.token)
      navigate('/tableau-de-bord')
    } catch (err) {
      setErreur(err.response?.data?.message || 'Identifiants incorrects')
    } finally {
      setChargement(false)
    }
  }

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

  const transition = 'background .3s, color .3s, border-color .3s'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .cm-input::placeholder { color: #b8a8a2; }
        .cm-input-dark::placeholder { color: #5a4a44; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 760px) { .left-panel { display: none !important; } .right-panel { width: 100% !important; } }
      `}</style>

      <div style={{ minHeight: '100vh', background: t.bg, fontFamily: "'Jost', sans-serif", display: 'flex', transition }}>

        {/* Panneau gauche */}
        <div
          className="left-panel"
          style={{
            flex: 1, background: t.bg3, display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between', padding: '48px 56px',
            borderRight: `1px solid ${t.brd}`, position: 'relative', overflow: 'hidden', transition,
          }}
        >
          {/* cercles décoratifs */}
          <div style={{ position: 'absolute', top: -100, right: -80, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle,rgba(181,105,90,.12) 0%,transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -40, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle,rgba(181,105,90,.08) 0%,transparent 70%)', pointerEvents: 'none' }} />

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, zIndex: 1 }}>
            <div style={{ width: 34, height: 34, background: t.acc, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎂</div>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: t.txt, fontWeight: 600, transition }}>SweetManager</span>
          </div>

          {/* Citation */}
          <div style={{ zIndex: 1 }}>
            <div style={{ width: 32, height: 2, background: t.acc, marginBottom: 20 }} />
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 28, lineHeight: 1.5, color: t.txt, marginBottom: 16, transition }}>
              L'art de la pâtisserie mérite<br />
              un outil à sa{' '}
              <em style={{ color: t.acc, fontStyle: 'normal' }}>hauteur</em>.
            </p>
            <p style={{ fontSize: 11, fontWeight: 400, color: t.txt3, letterSpacing: '.14em', textTransform: 'uppercase', transition }}>Votre espace de gestion</p>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 36, zIndex: 1 }}>
            {[['2 400+', 'Commandes'], ['98%', 'Satisfaction'], ['24/7', 'Disponible']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: t.acc, fontWeight: 600 }}>{n}</div>
                <div style={{ fontSize: 10, color: t.txt3, letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 3, transition }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Panneau droit */}
        <div
          className="right-panel"
          style={{
            width: 400, flexShrink: 0, background: t.bg2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '48px 48px', position: 'relative', transition,
          }}
        >
          {/* Toggle thème */}
          <button
            onClick={() => setDark(d => !d)}
            style={{
              position: 'absolute', top: 20, right: 20,
              background: t.bg3, border: `1px solid ${t.brd}`, borderRadius: 20,
              padding: '6px 14px', fontSize: 11, fontFamily: "'Jost', sans-serif",
              color: t.txt2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              letterSpacing: '.05em', transition,
            }}
          >
            {dark ? '☀ Clair' : '🌙 Sombre'}
          </button>

          {/* Formulaire */}
          <div style={{
            width: '100%', maxWidth: 320,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity .5s ease, transform .5s ease',
          }}>
            <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '.16em', textTransform: 'uppercase', color: t.acc, marginBottom: 10 }}>
              Espace professionnel
            </p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, color: t.txt, lineHeight: 1.1, marginBottom: 6, transition }}>
              Bon retour
            </h1>
            <p style={{ fontSize: 13, color: t.txt2, fontWeight: 300, marginBottom: 32, transition }}>
              Connectez-vous à votre espace
            </p>

            <form onSubmit={gererSoumission}>
              {/* Email */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 500, letterSpacing: '.12em', textTransform: 'uppercase', color: t.txt3, marginBottom: 7, transition }}>
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  className={dark ? 'cm-input-dark' : 'cm-input'}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  style={{
                    width: '100%', background: t.inp, border: `1px solid ${t.inpbrd}`,
                    borderRadius: 8, padding: '12px 16px', fontSize: 13,
                    fontFamily: "'Jost', sans-serif", color: t.txt, outline: 'none', transition,
                  }}
                  onFocus={e => e.target.style.borderColor = t.acc}
                  onBlur={e => e.target.style.borderColor = t.inpbrd}
                />
              </div>

              {/* Mot de passe */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 500, letterSpacing: '.12em', textTransform: 'uppercase', color: t.txt3, marginBottom: 7, transition }}>
                  Mot de passe
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className={dark ? 'cm-input-dark' : 'cm-input'}
                    value={motDePasse}
                    onChange={e => setMotDePasse(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%', background: t.inp, border: `1px solid ${t.inpbrd}`,
                      borderRadius: 8, padding: '12px 44px 12px 16px', fontSize: 13,
                      fontFamily: "'Jost', sans-serif", color: t.txt, outline: 'none', transition,
                    }}
                    onFocus={e => e.target.style.borderColor = t.acc}
                    onBlur={e => e.target.style.borderColor = t.inpbrd}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: 44, background: 'none', border: 'none', cursor: 'pointer', color: t.txt3, fontSize: 14 }}
                  >
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              {/* Erreur */}
              {erreur && (
                <div style={{
                  background: 'rgba(180,60,50,.07)', border: '1px solid rgba(180,60,50,.2)',
                  borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#c46060',
                  marginBottom: 16, animation: 'fadeIn .25s ease', display: 'flex', gap: 8,
                }}>
                  <span>⚠</span><span>{erreur}</span>
                </div>
              )}

              {/* Bouton */}
              <button
                type="submit"
                disabled={chargement || !email || !motDePasse}
                style={{
                  width: '100%', background: t.acc, color: '#fff', border: 'none',
                  borderRadius: 8, padding: 14, fontSize: 11, fontFamily: "'Jost', sans-serif",
                  fontWeight: 500, letterSpacing: '.15em', textTransform: 'uppercase',
                  cursor: chargement ? 'default' : 'pointer', marginTop: 4,
                  opacity: (chargement || !email || !motDePasse) ? .5 : 1, transition: 'opacity .2s',
                }}
              >
                {chargement
                  ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                      Connexion…
                    </span>
                  : 'Se connecter'
                }
              </button>
            </form>

            <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${t.brd}`, display: 'flex', justifyContent: 'space-between', transition }}>
              <a href="/mot-de-passe-oublie" style={{ fontSize: 11, color: t.txt3, textDecoration: 'none', transition }}>Mot de passe oublié ?</a>
              <a href="/inscription" style={{ fontSize: 11, color: t.txt3, textDecoration: 'none' }}> Créer un compte</a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Connexion