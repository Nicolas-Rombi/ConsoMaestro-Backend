var express = require('express');
var router = express.Router();
const Recipe = require('../models/recipes');
require('dotenv').config();


// Nouvelle route pour récupérer des recettes depuis Spoonacular
router.get('/spoonacular', (req, res) => {
    const { number = 1 } = req.query;
    const apiKey = process.env.SPOONACULAR_API_KEY;
  
    fetch(`https://api.spoonacular.com/recipes/random?number=${number}&apiKey=${apiKey}`)
      .then(async response => {
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Erreur API Spoonacular:', errorData);
          if (response.status === 401) {
            res.status(401).json({ error: 'Clé API Spoonacular invalide ou manquante.' });
          } else if (response.status === 402) {
            res.status(402).json({ error: 'Limite de requêtes atteinte pour l\'API Spoonacular.' });
          } else {
            res.status(response.status).json({ error: 'Erreur lors de la récupération des recettes depuis Spoonacular.' });
          }
        } else {
          const data = await response.json();
          return res.status(200).json(data);
        }
      })
      .catch(error => {
        console.error('Erreur de réseau ou interne lors de la récupération des recettes:', error);
        res.status(500).json({ error: 'Erreur de réseau ou serveur lors de la récupération des recettes.' });
      });
  });

// Route pour sauvegarder une recette en favori
router.post('/', async (req, res) => {
  const { userId, title, image, description, products, recipeId } = req.body;

  try {
    // Rechercher si la recette existe déjà dans la base de données
    let recipe = await Recipe.findOne({ recipeId });
    console.log(recipe);
    
    if (recipe) {
      
      // La recette existe, vérifier si l'utilisateur est déjà dans la liste des favoris
      if (!recipe.users.includes(userId)) {
        recipe.users.push(userId); // Ajouter l'utilisateur
        await recipe.save();
      }
    } else {
      // La recette n'existe pas, la créer
      recipe = new Recipe({
        recipeId,
        title,
        image,
        description,
        products,
        users: [userId] // Associer l'utilisateur
      });
      await recipe.save();
    }

    res.status(201).json({ message: 'Recette mise en favori sauvegardée avec succès', recipe });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la recette mise en favori:', error);
    res.status(500).json({ error: 'Erreur lors de la sauvegarde de la recette mise en favori' });
  }
});

// Route pour supprimer une recette mise en favori
router.delete('/:recipeId', async (req, res) => {
  const { recipeId } = req.params;
  const { userId } = req.body;

  try {
    // Trouver la recette par son ID
    const recipe = await Recipe.findOne({recipeId});
    console.log("recipe", recipe);

    if (!recipe) {
      return res.status(404).json({ error: 'Recette non trouvée' });
    }
    else {
    // Retirer l'utilisateur de la liste des favoris
    recipe.users = recipe.users.filter(user => user.toString() !== userId);

    await recipe.save();
    res.status(200).json({ message: 'Recette retirée des favoris avec succès' });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de la recette mise en favori:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la recette mise en favori' });
  }
});

router.get('/favorites/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Rechercher les recettes favorites où l'utilisateur est dans la liste des utilisateurs associés
    const favoriteRecipes = await Recipe.find({ users: userId }); // Modifiez `users` selon la structure du modèle

    res.status(200).json({ favorites: favoriteRecipes });
  } catch (error) {
    console.error("Erreur lors de la récupération des recettes favorites :", error);
    res.status(500).json({ error: 'Erreur lors de la récupération des recettes favorites' });
  }
});

module.exports = router;