import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Connexion from './pages/Connexion'
import RouteProtegee from './components/RouteProtegee'
import TableauDeBord from './pages/TableauDeBord' 
import Inscription from './pages/Inscription'

const App = () => {
  return (
    <AuthProvider>
      <div className="dark-glow-layer">
        <div className="glow-1"></div>
        <div className="glow-2"></div>
        <div className="glow-3"></div>
      </div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/connexion" />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/tableau-de-bord" element={
            <RouteProtegee>
              <TableauDeBord />
            </RouteProtegee>
          } />
          <Route path="/inscription" element={<Inscription />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App