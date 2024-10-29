var express = require('express');
var router = express.Router();
const Product = require('../models/products');

router.get('/:userId/:UPC', async (req, res) => {
 const UPC = req.params.UPC;
 const userId = req.params.userId;
 console.log(UPC);
 await fetch (`https://world.openfoodfacts.org/api/v0/product/${UPC}.json`)
 
    .then(response => response.json())
    .then(data => {
    const newProduct = new Product({
        name: data.product.product_name,
        image: data.product.image_url,
        upc: UPC,
        user: userId,
    });
    newProduct.save().then(newDoc => {
        res.json({ result: true, message: 'Produit ajouté !' });
    });
    })
    .catch(error => {
        res.json({ result: false, error });
    });
}
);

router.post('/:DLC', async (req, res) => {
    const DLC = req.params.DLC;
    Product.findOneAndUpdate({ upc: req.body.upc }, { dlc: DLC });
    res.json({ result: true, message: 'DLC enregistrée !' });
}
);

module.exports = router;