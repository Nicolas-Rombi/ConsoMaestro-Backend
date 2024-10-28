const mongoose = require('mongoose');



const recipesSchema = mongoose.Schema({
  product: [{ type: mongoose.Schema.Types.ObjectId, ref: 'product' }],
  title: {type: String, require: true},
  image: Number,
  description: {type: String, require: true}
});

const Recipe = mongoose.model('recipes', recipesSchema);

module.exports = Recipe;