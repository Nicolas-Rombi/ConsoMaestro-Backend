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
        res.json({ result: true, message: 'Produit ajouté !',product: newDoc });
    });
    })
    .catch(error => {
        res.json({ result: false, error });
    });
}
);

router.post('/:DLC', async (req, res) => {
    const { upc, user, storagePlace } = req.body;
    const DLC = req.params.DLC;

    try {
        const updatedProduct = await Product.findOneAndUpdate(
            { upc: upc, user: user },
            { dlc: DLC,  storagePlace: storagePlace },
            { new: true } // Cela retourne le document mis à jour
        );

        if (updatedProduct) {
            res.json({ result: true, message: 'Produit enregistrée !' });
        } else {
            res.json({ result: false, message: 'Produit non trouvé ou non mis à jour.' });
        }
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la DLC :", error);
        res.status(500).json({ result: false, message: 'Erreur serveur lors de la mise à jour de la DLC.' });
    }
});

module.exports = router;