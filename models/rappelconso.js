const mongoose = require('mongoose');

const RappelConsoSchema = new mongoose.Schema({
  categorie_de_produit: String,
  nom_de_la_marque_du_produit: String,
  noms_des_modeles_ou_references: String,
  identification_des_produits: String,
  motif_du_rappel: String,
  risques_encourus_par_le_consommateur: String,
  preconisations_sanitaires: String,
  description_complementaire_du_risque: String,
  conduites_a_tenir_par_le_consommateur: String,
  date_de_fin_de_la_procedure_de_rappel: Date,
  date_debut_fin_de_commercialisation: Date,
}, { timestamps: true });

const RappelConso = mongoose.model('RappelConso', RappelConsoSchema);

module.exports = RappelConso;
