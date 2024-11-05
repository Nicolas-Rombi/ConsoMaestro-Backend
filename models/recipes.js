const mongoose = require('mongoose');

const recipesSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Référence à l'utilisateur
  product: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // Liste de références de produits associés
  title: { type: String, required: true },
  image: { type: String, required: true }, // Image en tant qu'URL (string)
  description: { type: String, required: true }
});

const Recipe = mongoose.model('Recipe', recipesSchema);

module.exports = Recipe;
