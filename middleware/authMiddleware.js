const jwt = require('jsonwebtoken');

// Middleware d'authentification pour vérifier le token JWT
const authMiddleware = (req, res, next) => {
  // Récupère le token de l'en-tête Authorization (format "Bearer <token>")
  const token = req.headers['authorization']?.split(' ')[1];

  // Vérifie si un token est présent
  if (!token) {
    return res.status(401).json({ message: 'Accès refusé : aucun token fourni.' });
  }

  try {
    // Vérifie et décode le token avec la clé secrète
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ajoute les informations de l'utilisateur décodées (ID, rôle, etc.) à la requête
    req.user = decoded;

    // Passe à la route suivante
    next();
  } catch (error) {
    // Gère les erreurs de validation du token
    return res.status(403).json({ message: 'Token invalide.' });
  }
};

module.exports = authMiddleware;
