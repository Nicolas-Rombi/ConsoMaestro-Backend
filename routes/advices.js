var express = require('express');
var router = express.Router();
require('../models/connection');
const Advice = require('../models/advices');

// Route pour obtenir un conseil aléatoire
router.get('/', (req, res) => {
    Advice.find()  // Récupérer tous les conseils
      .then(advices => {
        const randomIndex = Math.floor(Math.random() * advices.length); // Choisir un indice aléatoire dans le tableau des conseils
        const randomAdvice = advices[randomIndex];
        
        res.json({ titre: randomAdvice.titre, description: randomAdvice.description }); // On renvoie le titre et la description du conseil choisi
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des conseils :", error);
        res.status(500).json({ message: "Erreur serveur." });
      });
  });

  module.exports = router;