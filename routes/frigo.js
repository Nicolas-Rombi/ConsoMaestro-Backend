var express = require('express');
var router = express.Router();
const Product = require('../models/products');

router.get('/:userId', async (req, res) => {
    const userId = req.params.userId;
    
    try {
        const products = await Product.find({ user: userId, storagePlace:"Frigo" }); // Rechercher les produits liés à l'utilisateur
        if (products) {
            res.json({ result: true, data: products });
        } else {
            res.json({ result: false, message: 'Aucun produit trouvé pour cet utilisateur.' });
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des produits :", error);
        res.status(500).json({ result: false, message: 'Erreur serveur lors de la récupération des produits.' });
    }
});

module.exports = router;