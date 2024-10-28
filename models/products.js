const mongoose = require('mongoose');


const productSchema = mongoose.Schema({
  name: String,
  upc: {type: Number, require: true},
  image: String,
  dlc: Date,
  dgccrf: [String],
});

const Product = mongoose.model('products', productSchema);

module.exports = Product;