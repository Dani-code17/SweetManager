import jwt from 'jsonwebtoken'

export const proteger = (req, res, next) => {
  const authHeader = req.headers.authorization
  const tokenQuery = req.query.token

  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : tokenQuery

  if (!token) return res.status(401).json({ message: 'Token manquant' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.utilisateurId = decoded.utilisateurId
    next()
  } catch {
    res.status(401).json({ message: 'Token invalide ou expiré' })
  }
}