var express = require('express');
var router = express.Router();
const Recipe = require('../models/recipes');
const fetch = require('node-fetch'); 
require('dotenv').config();


// Nouvelle route pour récupérer des recettes depuis Spoonacular
router.get('/spoonacular', (req, res) => {
    const { number = 5 } = req.query;
    const apiKey = process.env.SPOONACULAR_API_KEY;
  
    fetch(`https://api.spoonacular.com/recipes/random?number=${number}&apiKey=${apiKey}`)
      .then(response => {
        if (!response.ok) {
          return response.json().then(errorData => {
            console.error('Erreur API Spoonacular:', errorData);
  
            if (response.status === 401) {
              res.status(401).json({ error: 'Clé API Spoonacular invalide ou manquante.' });
            } else if (response.status === 402) {
              res.status(402).json({ error: 'Limite de requêtes atteinte pour l\'API Spoonacular.' });
            } else {
              res.status(response.status).json({ error: 'Erreur lors de la récupération des recettes depuis Spoonacular.' });
            }
          });
        } else {
          return response.json().then(data => res.status(200).json(data));
        }
      })
      .catch(error => {
        console.error('Erreur de réseau ou interne lors de la récupération des recettes:', error);
        res.status(500).json({ error: 'Erreur de réseau ou serveur lors de la récupération des recettes.' });
      });
  });

// Route pour sauvegarder une recette en favori
{/* 
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
}); */}

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