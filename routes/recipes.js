var express = require('express');
var router = express.Router();
const Recipe = require('../models/recipes');
const fetch = require('node-fetch'); 
require('dotenv').config();


// Nouvelle route pour récupérer des recettes depuis Spoonacular.
router.get('/spoonacular', async (req, res) => {
    const { number = 4 } = req.query;
    const apiKey = process.env.SPOONACULAR_API_KEY;
  
    try {
      // Requête vers l'API Spoonacular
      const response = await fetch(`https://api.spoonacular.com/recipes/random?number=${number}&apiKey=${apiKey}`);
      
      // Vérification du statut de la réponse
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur API Spoonacular:', errorData);
        
        // Gérer les différents types d'erreurs
        if (response.status === 401) {
          return res.status(401).json({ error: 'Clé API Spoonacular invalide ou manquante.' });
        } else if (response.status === 402) {
          return res.status(402).json({ error: 'Limite de requêtes atteinte pour l\'API Spoonacular.' });
        } else {
          return res.status(response.status).json({ error: 'Erreur lors de la récupération des recettes depuis Spoonacular.' });
        }
      }
  
      // Traitement des données si la réponse est valide
      const data = await response.json();
      res.status(200).json(data);
  
    } catch (error) {
      // Gérer les erreurs réseau et autres exceptions
      console.error('Erreur de réseau ou interne lors de la récupération des recettes:', error);
      res.status(500).json({ error: 'Erreur de réseau ou serveur lors de la récupération des recettes.' });
    }
  });

// Route pour sauvegarder une recette en favori
router.post('/', async (req, res) => {
  const { userId, title, image, description, product } = req.body;

  try {
    const newRecipe = new Recipe({
      user: userId,
      title,
      image,
      description,
      product
    });

    await newRecipe.save();
    res.status(201).json({ message: 'Recette mise en favori sauvegardée avec succès', recipe: newRecipe });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la sauvegarde de la recette mise en favori' });
  }
});

// Route pour supprimer une recette mise en favori
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await Recipe.findByIdAndDelete(id);
    res.status(200).json({ message: 'Recette mise en favori supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de la recette mise en favori' });
  }
});

module.exports = router;