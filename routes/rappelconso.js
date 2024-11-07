const express = require('express');
const router = express.Router();
const RappelConso = require('../models/rappelconso'); 
const Product = require('../models/products'); 

// Route pour récupérer et enregistrer les rappels.
router.get('/fetch-recalls', (req, res) => {
    const apiUrl = `https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/rappelconso0/records?limit=100&refine=categorie_de_produit%3A%22Alimentation%22`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data && data.records) {
                const recallPromises = data.records.map(record => {
                    const fields = record.record.fields;

                    // Extraction des codes-barres à partir de l'identification
                    const barcodes = fields.identification_des_produits.match(/\b\d{13}\b/g);

                    const newRecall = new RappelConso({
                        categorie_de_produit: fields.categorie_de_produit,
                        nom_de_la_marque_du_produit: fields.nom_de_la_marque_du_produit,
                        noms_des_modeles_ou_references: fields.noms_des_modeles_ou_references,
                        identification_des_produits: fields.identification_des_produits,
                        upc: barcodes || [], // Stocker les codes-barres extraits
                        motif_du_rappel: fields.motif_du_rappel,
                        risques_encourus_par_le_consommateur: fields.risques_encourus_par_le_consommateur,
                        preconisations_sanitaires: fields.preconisations_sanitaires,
                        description_complementaire_du_risque: fields.description_complementaire_du_risque,
                        conduites_a_tenir_par_le_consommateur: fields.conduites_a_tenir_par_le_consommateur,
                    });

                    return newRecall.save();
                });

                Promise.all(recallPromises)
                    .then(() => res.json({ result: true, message: 'Les rappels alimentaires ont été enregistrés dans la base de données.' }))
                    .catch(error => {
                        console.error("Erreur lors de la sauvegarde des rappels :", error);
                        res.json({ result: false, message: 'Erreur lors de la sauvegarde des rappels.' });
                    });
            } else {
                res.json({ result: false, message: 'Aucun rappel trouvé dans la réponse API.' });
            }
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des rappels :", error);
            res.json({ result: false, message: 'Erreur lors de la récupération des rappels.' });
        });
});

// Route pour vérifier les rappels dans les produits de l'utilisateur
router.get('/check-recall/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log("Vérification des rappels pour l'utilisateur avec ID :", userId);

        // Récupérer tous les produits de l'utilisateur
        const userProducts = await Product.find({ user: userId });
        console.log("Produits de l'utilisateur :", userProducts);

        // Vérifier si userProducts est un tableau
        if (!Array.isArray(userProducts)) {
            console.error("userProducts n'est pas un tableau", userProducts);
            return res.status(500).json({ result: false, message: 'Erreur lors de la récupération des produits.' });
        }

        // Extraire les codes-barres des produits de l'utilisateur
        const userUPCs = userProducts.map(product => {
            if (!product.upc) {
                console.warn("Produit sans UPC trouvé :", product);
                return null; // ou gérer autrement
            }
            return product.upc;
        }).filter(upc => upc !== null); // Filtrer les valeurs nulles si nécessaire

        console.log("Codes-barres des produits de l'utilisateur :", userUPCs);

        // Rechercher les rappels dont les codes-barres correspondent aux produits de l'utilisateur
        const recalls = await RappelConso.find({ upc: { $in: userUPCs } });
        console.log("Rappels trouvés :", recalls);

        if (recalls.length > 0) {
            console.log("recall", recalls)
            res.json({
                result: true,
                message: 'Produits rappelés trouvés dans votre stockage.',
                recalls,
            });
        } else {
            res.json({ result: false, message: 'Aucun produit rappelé trouvé dans votre stockage.' });
        }
    } catch (error) {
        console.error("Erreur lors de la vérification des rappels :", error);
        res.status(500).json({ result: false, message: 'Erreur serveur lors de la vérification des rappels.' });
    }
});
module.exports = router;
