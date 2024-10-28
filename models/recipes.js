const mongoose = require('mongoose');



const recipesSchema = mongoose.Schema({
  product: [{ type: mongoose.Schema.Types.ObjectId, ref: 'product' }],
  title: String,
  image: Number,
  description: Number,
});

const Recipe = mongoose.model('recipes', recipesSchema);

module.exports = Recipe;