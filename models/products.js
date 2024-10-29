const mongoose = require('mongoose');


const productSchema = mongoose.Schema({
  name: String,
  upc: {type: Number, require: true},
  image: String,
  dlc: Date,
  dgccrf: [String],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Product = mongoose.model('products', productSchema);

module.exports = Product;