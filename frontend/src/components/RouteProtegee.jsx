import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const RouteProtegee = ({ children }) => {
  const { token } = useAuth()
  return token ? children : <Navigate to="/connexion" />
}

export default RouteProtegee