const express = require('express');
const router = express.Router();
const RappelConso = require('../models/rappelconso');

// Route pour récupérer les données et les sauvegarder dans la base de données

router.get('/fetch-recalls', (req, res) => {

    const apiUrl = `https://data.economie.gouv.fr/api/v2/catalog/datasets/rappelconso0/records?where=categorie_de_produit="Alimentation"&limit=100`;

    // Récupérer les données depuis l'API
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data && data.records) {
                // Pour chaque enregistrement de rappel, créer et sauvegarder un document dans MongoDB
                const recallPromises = data.records.map(record => {
                    const fields = record.fields;
                    const newRecall = new RappelConso({
                        categorie_de_produit: fields.categorie_de_produit,
                        nom_de_la_marque_du_produit: fields.nom_de_la_marque_du_produit,
                        noms_des_modeles_ou_references: fields.noms_des_modeles_ou_references,
                        identification_des_produits: fields.identification_des_produits,
                        motif_du_rappel: fields.motif_du_rappel,
                        risques_encourus_par_le_consommateur: fields.risques_encourus_par_le_consommateur,
                        preconisations_sanitaires: fields.preconisations_sanitaires,
                        description_complementaire_du_risque: fields.description_complementaire_du_risque,
                        conduites_a_tenir_par_le_consommateur: fields.conduites_a_tenir_par_le_consommateur,
                        date_de_fin_de_la_procedure_de_rappel: fields.date_de_fin_de_la_procedure_de_rappel ? new Date(fields.date_de_fin_de_la_procedure_de_rappel) : null,
                        date_debut_fin_de_commercialisation: fields.date_debut_fin_de_commercialisation ? new Date(fields.date_debut_fin_de_commercialisation) : null,
                    });

                    return newRecall.save(); // Sauvegarde chaque document dans la base de données
                });

                // Attendre que toutes les opérations de sauvegarde soient terminées

                Promise.all(recallPromises)
                    .then(() => res.json({ result: true, message: 'Les rappels alimentaires ont été enregistrés dans la base de données.' }))
                    .catch(error => {
                        console.error("Erreur lors de la sauvegarde des rappels :", error);
                        res.status(500).json({ result: false, message: 'Erreur lors de la sauvegarde des rappels.' });
                    });
            } else {
                res.json({ result: false, message: 'Aucun rappel trouvé dans la réponse API.' });
            }
        })
});

module.exports = router;
