// routes/rappelconso.js
const express = require('express');
const router = express.Router();
const RappelConso = require('../models/rappelconso'); // Importer le modèle
const Product = require('../models/products'); // Importer le modèle Product

// Fonction pour extraire les UPCs d'une chaîne d'identification des produits
function extractUPCs(identificationString) {
    // Utilise une expression régulière pour trouver toutes les suites de 13 chiffres
    const regex = /(\d{13})/g;
    const matches = identificationString.match(regex);
    return matches ? matches : []; // Retourne les UPCs ou un tableau vide si aucun match
}

// Route pour récupérer et sauvegarder les rappels de produits alimentaires
router.get('/fetch-recalls', async (req, res) => {
    try {
        let offset = 0;
        const limit = 100; // Limite par page

        // Boucle pour récupérer tous les rappels alimentaires
        do {
            // Construction de l'URL
            const response = await fetch(`https://data.economie.gouv.fr/api/v2/catalog/datasets/rappelconso0/records?where=categorie_de_produit="Alimentation"&limit=100`);
            const data = await response.json();

            if (data && data.records) {
                const totalCount = data.total_count;

                // Récupérer tous les produits de l'utilisateur
                const userProducts = await Product.find({});
                const userUPCs = userProducts.map(product => product.upc); // Tableau des UPCs des produits

                for (const recallData of data.records) {
                    const identificationProduits = recallData.fields.identification_des_produits || '';
                    const upcs = extractUPCs(identificationProduits); // Extraire les UPCs

                    // Vérifier si l'un des UPCs correspond aux produits de l'utilisateur
                    const relevantUPCs = upcs.filter(upc => userUPCs.includes(upc));

                    // Sauvegarder uniquement si des UPCs pertinents existent
                    if (relevantUPCs.length > 0) {
                        const newRecall = new RappelConso({
                            categorie_de_produit: recallData.fields.categorie_de_produit,
                            nom_de_la_marque_du_produit: recallData.fields.nom_de_la_marque_du_produit,
                            noms_des_modeles_ou_references: recallData.fields.noms_des_modeles_ou_references,
                            identification_des_produits: identificationProduits, // Garder cette info
                            motif_du_rappel: recallData.fields.motif_du_rappel,
                            risques_encourus_par_le_consommateur: recallData.fields.risques_encourus_par_le_consommateur,
                            preconisations_sanitaires: recallData.fields.preconisations_sanitaires,
                            description_complementaire_du_risque: recallData.fields.description_complementaire_du_risque,
                            conduites_a_tenir_par_le_consommateur: recallData.fields.conduites_a_tenir_par_le_consommateur,
                            date_de_fin_de_la_procedure_de_rappel: recallData.fields.date_de_fin_de_la_procedure_de_rappel ? new Date(recallData.fields.date_de_fin_de_la_procedure_de_rappel) : null,
                            date_debut_fin_de_commercialisation: recallData.fields.date_debut_fin_de_commercialisation ? new Date(recallData.fields.date_debut_fin_de_commercialisation) : null,
                            upcs: relevantUPCs, // Ajouter les UPCs pertinents ici si besoin
                        });

                        await newRecall.save();
                    }
                }

                // Incrémenter l'offset pour passer à la page suivante
                offset += limit;

            } else {
                res.json({ result: false, message: 'Aucun rappel trouvé.' });
                return; // Sortir si aucun rappel trouvé
            }

        } while (offset < totalCount); // Continuer jusqu'à ce que tous les résultats soient récupérés

        res.json({ result: true, message: 'Les rappels alimentaires ont été enregistrés dans la base de données.' });
    } catch (error) {
        console.error("Erreur lors de la récupération des rappels :", error);
        res.status(500).json({ result: false, message: 'Erreur serveur lors de la récupération des rappels.' });
    }
});

// Route pour obtenir les rappels d'un utilisateur spécifique

router.get('/user-recalls/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const userProducts = await Product.find({ user: userId });
        const userUPCs = userProducts.map(product => product.upc); // Tableau des UPCs des produits de l'utilisateur

        const recalls = await RappelConso.find({
            'upcs': { $in: userUPCs } // Trouver les rappels qui ont des UPCs dans les produits de l'utilisateur
        });

        res.json({ result: true, data: recalls });
    } catch (error) {
        console.error("Erreur lors de la récupération des rappels :", error);
        res.status(500).json({ result: false, message: 'Erreur serveur lors de la récupération des rappels.' });
    }
});

module.exports = router;