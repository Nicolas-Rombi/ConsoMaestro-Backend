const express = require('express');
const router = express.Router();
const RappelConso = require('../models/rappelconso'); // Importer le modèle

// Route pour récupérer et sauvegarder les rappels de produits alimentaires
router.get('/fetch-recalls', async (req, res) => {
  try {
    const response = await fetch('https://data.economie.gouv.fr/api/v2/catalog/datasets/rappelconso0/records');
    const data = await response.json();

    if (data && data.records) {
      // Parcourir chaque rappel et l'enregistrer dans MongoDB
      for (const recallData of data.records) {
        // Vérifier si la catégorie de produit est "Alimentaire"
        if (recallData.fields.categorie_de_produit && recallData.fields.categorie_de_produit === 'Alimentaire') {
          const newRecall = new RappelConso({
            categorie_de_produit: recallData.fields.categorie_de_produit,
            nom_de_la_marque_du_produit: recallData.fields.nom_de_la_marque_du_produit,
            noms_des_modeles_ou_references: recallData.fields.noms_des_modeles_ou_references,
            identification_des_produits: recallData.fields.identification_des_produits,
            motif_du_rappel: recallData.fields.motif_du_rappel,
            risques_encourus_par_le_consommateur: recallData.fields.risques_encourus_par_le_consommateur,
            preconisations_sanitaires: recallData.fields.preconisations_sanitaires,
            description_complementaire_du_risque: recallData.fields.description_complementaire_du_risque,
            conduites_a_tenir_par_le_consommateur: recallData.fields.conduites_a_tenir_par_le_consommateur,
            date_de_fin_de_la_procedure_de_rappel: recallData.fields.date_de_fin_de_la_procedure_de_rappel ? new Date(recallData.fields.date_de_fin_de_la_procedure_de_rappel) : null,
            date_debut_fin_de_commercialisation: recallData.fields.date_debut_fin_de_commercialisation ? new Date(recallData.fields.date_debut_fin_de_commercialisation) : null,
          });

          await newRecall.save(); // Enregistrement dans MongoDB
        }
      }

      res.json({ result: true, message: 'Les rappels alimentaires ont été enregistrés dans la base de données.' });
    } else {
      res.json({ result: false, message: 'Aucun rappel trouvé.' });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des rappels :", error);
    res.status(500).json({ result: false, message: 'Erreur serveur lors de la récupération des rappels.' });
  }
});

router.get('/search-recall', async (req, res) => {
    const { productName } = req.query;
  
    try {
      const results = await RappelConso.find({
        nom_de_la_marque_du_produit: new RegExp(productName, 'i') // Recherche insensible à la casse
      });
  
      if (results.length > 0) {
        res.json({ result: true, data: results });
      } else {
        res.json({ result: false, message: "Aucun rappel trouvé pour ce produit." });
      }
    } catch (error) {
      console.error("Erreur lors de la recherche :", error);
      res.status(500).json({ result: false, message: "Erreur serveur lors de la recherche." });
    }
  });

module.exports = router;
