const mongoose = require('mongoose');

const recipesSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Référence à l'utilisateur
  products: [{ type: String, required: true}], // Liste de références de produits associés
  title: { type: String, required: true },
  image: { type: String, required: true }, 
  description: { type: String },
  recipeId: { type: Number, required: true, unique: true },
});

const Recipe = mongoose.model('Recipe', recipesSchema);

module.exports = Recipe;
