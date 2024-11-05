// Importation des modules nécessaires
var express = require('express');
var router = express.Router();
const Product = require('../models/products');

// Route GET pour récupérer les informations d'un produit via son UPC
router.get('/:userId/:UPC', async (req, res) => {
    const UPC = req.params.UPC; // Récupération du code UPC du produit depuis les paramètres
    const userId = req.params.userId; // Récupération de l'ID utilisateur depuis les paramètres
    console.log(UPC); // Affichage du code UPC dans la console

    // Appel à l'API OpenFoodFacts pour récupérer les données du produit
    await fetch(`https://world.openfoodfacts.org/api/v0/product/${UPC}.json`)
        .then(response => response.json()) // Conversion de la réponse en JSON
        .then(data => {
            // Création d'un nouvel objet produit avec les informations récupérées
            const newProduct = new Product({
                name: data.product.product_name,
                image: data.product.image_url,
                upc: UPC,
                user: userId,
            });

            // Sauvegarde du nouveau produit dans la base de données
            newProduct.save().then(newDoc => {
                res.json({ result: true, message: 'Produit ajouté !', product: newDoc });
            });
        })
        .catch(error => {
            // Gestion des erreurs en cas de produit non disponible
            res.json({ result: false, message: "Ce produit n'est pas disponible.", error });
        });
});

// Route POST pour ajouter ou mettre à jour la DLC (Date Limite de Consommation) d'un produit et son endroit de stockage
router.post('/:DLC', async (req, res) => {
    const { _id, storagePlace } = req.body; // Récupération de l'ID et du lieu de stockage du produit depuis le corps de la requête
    const DLC = req.params.DLC; // Récupération de la DLC depuis les paramètres

    try {
        // Mise à jour du produit correspondant avec la DLC et le lieu de stockage
        const updatedProduct = await Product.findOneAndUpdate(
            { _id },
            { dlc: DLC, storagePlace: storagePlace },
            { new: true } // Retourner le document mis à jour
        );

        // Vérification de la réussite de la mise à jour
        if (updatedProduct) {
            res.json({ result: true, message: 'Produit enregistré !' });
        } else {
            res.json({ result: false, message: 'Produit non trouvé ou non mis à jour.' });
        }
    } catch (error) {
        // Gestion des erreurs serveur
        console.error("Erreur lors de la mise à jour de la DLC :", error);
        res.status(500).json({ result: false, message: 'Erreur serveur lors de la mise à jour de la DLC.' });
    }
});


// Route DELETE pour supprimer un produit par son ID
router.delete('/:productId', async (req, res) => {
    const productId = req.params.productId; // Récupération de l'ID du produit à supprimer

    try {
        // Suppression du produit correspondant dans la base de données
        const deletedProduct = await Product.findByIdAndDelete(productId);
        
        // Vérification de la réussite de la suppression
        if (deletedProduct) {
            res.json({ result: true, message: 'Produit supprimé !' });
        } else {
            res.json({ result: false, message: 'Produit non trouvé ou non supprimé.' });
        }
    } catch (error) {
        // Gestion des erreurs serveur lors de la suppression
        console.error("Erreur lors de la suppression du produit :", error);
        res.status(500).json({ result: false, message: 'Erreur serveur lors de la suppression du produit.' });
    }
});

// Route PUT pour mettre à jour le lieu de stockage d'un produit par son ID
router.put('/:productId', async (req, res) => {
    const productId = req.params.productId; // Récupération de l'ID du produit à mettre à jour
    const newStoragePlace = req.body.newStoragePlace; // Récupération du nouveau lieu de stockage depuis le corps de la requête

    try {
        // Mise à jour du produit avec le nouveau lieu de stockage
        const updatedProduct = await Product.findByIdAndUpdate(
            { _id: productId },
            { storagePlace: newStoragePlace },
            { new: true } // Retourner le document mis à jour
        );

        // Vérification de la réussite de la mise à jour
        if (updatedProduct) {
            res.json({ result: true, message: 'Produit mis à jour !' });
        } else {
            res.json({ result: false, message: 'Produit non trouvé ou non mis à jour.' });
        }
    } catch (error) {
        // Gestion des erreurs serveur lors de la mise à jour
        console.error("Erreur lors de la mise à jour du produit :", error);
        res.status(500).json({ result: false, message: 'Erreur serveur lors de la mise à jour du produit.' });
    }
});

// Exportation du routeur pour l'utiliser dans l'application principale
module.exports = router;
