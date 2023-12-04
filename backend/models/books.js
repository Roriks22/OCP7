const mongoose = require('mongoose');
const mongooseUniqueValidator = require('mongoose-unique-validator');

// Création d'un shéma modèle pour les livres en utilisant Mongoose
const bookSchema = mongoose.Schema({
    userId : { type: String, required: true },
    title : { type: String, required: true },
    author: { type: String, required: true },
    imageUrl: { type: String, required: true },
    year: { type: Number, required: true },
    genre: { type: String, required: true },
    ratings: [
        {
            userId: { type: String, required: true },
            grade: { type: Number, required: true }
        }
    ],
    averageRating: { type: Number, required: true }
});

// Utilisation de Mongoose-unique-validator qui est un plugin qui ajoute une validation de pré-enregistrement pour les champs uniques dans un schéma Mongoose.
bookSchema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Book', bookSchema);
