var express = require('express');
var router = express.Router();
const Product = require('../models/products');

router.get('/:UPC', async (req, res) => {
 const UPC = req.params.UPC;
 await fetch (`https://world.openfoodfacts.org/api/v0/product/${UPC}.json`)
 .then(response => response.json())
    .then(data => {
    const newProduct = new Product({
        name: data.product.product_name,
        image: data.product.image_url,
        upc: UPC,
    });
    newProduct.save().then(newDoc => {
        res.json({ result: true, message: 'Produit ajouté !' });
    });
    });
}
);