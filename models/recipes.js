const mongoose = require('mongoose');

const recipesSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Référence à l'utilisateur
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // Liste de références de produits associés
  title: { type: String, required: true },
  image: { type: String, required: true }, // Image en tant qu'URL (string)
  description: { type: String, required: true },
  recipeId: { type: Number, required: true },
});

const Recipe = mongoose.model('Recipe', recipesSchema);

module.exports = Recipe;
