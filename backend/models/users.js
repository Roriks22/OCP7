const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Utilisation de mongoose.Schema permettant de créer un schéma de données pour la base de données mongodb.
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Utilisation de uniqueValidator qui est plugin qui ajoute une validation de pré-enregistrement pour les champs uniques dans un schéma Mongoose.
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('user', userSchema);