import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [utilisateur, setUtilisateur] = useState(
    JSON.parse(localStorage.getItem('utilisateur')) || null
  )
  const [token, setToken] = useState(localStorage.getItem('token') || null)

  const connecter = (donneesUtilisateur, tokenJWT) => {
    setUtilisateur(donneesUtilisateur)
    setToken(tokenJWT)
    localStorage.setItem('utilisateur', JSON.stringify(donneesUtilisateur))
    localStorage.setItem('token', tokenJWT)
  }

  const deconnecter = () => {
    setUtilisateur(null)
    setToken(null)
    localStorage.removeItem('utilisateur')
    localStorage.removeItem('token')
  }

  const mettreAJourUtilisateur = (donnees) => {
    setUtilisateur((prev) => {
      const updated = { ...prev, ...donnees }
      localStorage.setItem('utilisateur', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <AuthContext.Provider value={{ utilisateur, token, connecter, deconnecter, mettreAJourUtilisateur }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)