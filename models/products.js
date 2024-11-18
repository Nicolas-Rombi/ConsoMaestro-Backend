const mongoose = require('mongoose');


const productSchema = mongoose.Schema({
  name: String,
  upc: {type: Number, require: true},
  image: String,
  dlc: Date,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  storagePlace: String,
});

const Product = mongoose.model('products', productSchema);

module.exports = Product;