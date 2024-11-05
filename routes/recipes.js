var express = require('express');
var router = express.Router();
const Recipe = require('../models/recipes');

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
