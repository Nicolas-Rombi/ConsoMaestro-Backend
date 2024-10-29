var express = require('express');
var router = express.Router();
const Product = require('../models/products');

router.get('/', async (req, res) => {
 await fetch (`https://world.openfoodfacts.org/api/v0/product/${UPC}.json`)
 .then(response => response.json())
    .then(data => {
    const newProduct = new Product({
        name: data.product.product_name,
        image: data.product.image_url,
        
    });
    newProduct.save().then(newDoc => {
        res.json({ result: true, message: 'Produit ajouté !' });
    });
    });
}
);