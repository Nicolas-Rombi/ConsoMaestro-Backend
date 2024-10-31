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
router.get('/fetch-recalls', (req, res) => {
    let offset = 0;
    const limit = 100; // Limite par page

    // Récupérer tous les utilisateurs et leurs produits en amont pour optimisation
    const userProductsMap = {}; // Objet pour stocker les UPCs par utilisateur
    Product.find({}).populate('user') // Récupère tous les produits et utilisateurs associés
        .then(allUsers => {
            if (allUsers.length > 0) { // Vérifier si on a des produits
                function fetchAndSaveRecalls() {
                    fetch(`https://data.economie.gouv.fr/api/v2/catalog/datasets/rappelconso0/records?where=categorie_de_produit="Alimentation"&limit=100`)
                        .then(response => response.json())
                        .then(data => {
                            if (data && data.records) {
                                const totalCount = data.total_count;

                                // Récupérer tous les produits de l'utilisateur
                                Product.find({})
                                    .then(userProducts => {
                                        const userUPCs = userProducts.map(product => product.upc); // Tableau des UPCs des produits

                                        data.records.forEach(recallData => {
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

                                                newRecall.save();
                                            }
                                        });

                                        // Incrémenter l'offset pour passer à la page suivante
                                        offset += limit;

                                        if (offset < totalCount) {
                                            fetchAndSaveRecalls(); // Continuer jusqu'à ce que tous les résultats soient récupérés
                                        } else {
                                            res.json({ result: true, message: 'Les rappels alimentaires ont été enregistrés dans la base de données.' });
                                        }
                                    });
                            } else {
                                res.json({ result: false, message: 'Aucun rappel trouvé.' });
                            }
                        });
                }

                fetchAndSaveRecalls(); // Déclenchement initial de la boucle de récupération des rappels
            } else {
                res.json({ result: false, message: 'Aucun produit trouvé pour les utilisateurs.' });
            }
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des produits des utilisateurs :", error);
            res.status(500).json({ result: false, message: 'Erreur serveur lors de la récupération des produits.' });
        });
});

module.exports = router;

// Route pour obtenir les rappels d'un utilisateur spécifique
router.get('/user-recalls/:userId', (req, res) => {
    const userId = req.params.userId;

    Product.find({ user: userId })
        .then(userProducts => {
            const userUPCs = userProducts.map(product => product.upc); // Tableau des UPCs des produits de l'utilisateur

            return RappelConso.find({
                'upcs': { $in: userUPCs } // Trouver les rappels qui ont des UPCs dans les produits de l'utilisateur
            });
        })
        .then(recalls => {
            res.json({ result: true, data: recalls });
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des rappels :", error);
            res.status(500).json({ result: false, message: 'Erreur serveur lors de la récupération des rappels.' });
        });
});

module.exports = router;
