const User = require('../models/users');

// Middleware d'authentification pour vérifier que le token dans la req matche avec la db
const authMiddleware = async (req, res, next) => {
  // Récupère le token de l'en-tête Authorization (format "Bearer <token>")
  const token = req.headers['authorization']?.split(' ')[1];
  console.log('req.headers:', req.headers)
  console.log('token :', token);

  // Vérifie si un token est présent
  if (!token) {
    return res.status(401).json({ message: 'Accès refusé : aucun token fourni.' });
  }
  
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(403).json({ message: 'Token invalide ou utilisateur non authentifié.' });
    }
    req.user = { id: user._id }; // Ajoute l'ID de l'utilisateur dans la req
    next(); 
  } catch (error) {
    console.error('Erreur d’authentification :', error);
    return res.status(500).json({ message: 'Erreur du serveur lors de la vérification du token.' });
  }
};

module.exports = authMiddleware;
