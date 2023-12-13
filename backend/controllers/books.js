const Book = require('../models/books');
const fs = require('fs');
const path = require('path');

// Fonction pour ajouter un nouveau livre.

exports.createBook = (req, res, next) => {
    // Récupération des infos de la requête.
    const bookObject = JSON.parse(req.body.book);
    // Suppression du faux id envoyé par le front.
    delete bookObject._id;
    // Suppression de l'userId pour la sécurité.
    delete bookObject._userId;
    // Création d'un nouveau modèle Book.
    const book = new Book ({
        ...bookObject,
        userId : req.auth.userId,
        imageUrl : `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        averageRating : bookObject.ratings[0].grade,
    });
    // L'enregistrer dans la base de donnée.
    book.save()
    .then(() => { res.status(201).json({ message: 'Livre enregistré !'})})
    .catch(error => { res.status(400).json({ error })})};

// Fonction pour modifier un livre.

    exports.modifyBook = (req, res, next) => {
        // Si l'image a été modifié... alors nouveau chemin d'accès.
        const bookObject = req.file ? {
            ...JSON.parse(req.body.book),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
        delete bookObject._userId;
        // Récupération du livre à modifier.
        Book.findOne({_id: req.params.id})
            .then((book) => {
                // Mettre une condition pour que ça soit seulement le créateur qui puisse modifier.
                if (book.userId != req.auth.userId) {
                    res.status(403).json({ message : 'Demande non autorisé.'});
                } else {
                    // Séparation du nom d'image existant.
                    const filename = book.imageUrl.split('/images')[1];
                    // Si image modifiée alors on supprime l'ancienne.
                    req.file && fs.unlink(`images/${filename}`, (err => {
                        if (err) console.log(err);
                    }));
                    // Mettre à jour le livre.
                    Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
                    .then(() => res.status(200).json({message : 'Livre modifié!'}))
                    .catch(error => res.status(401).json({ error }));
                    }
                    })
                    .catch((error) => { res.status(400).json({ error });
            });
};

// Fonction pour supprimer un livre.

exports.deleteBook = (req, res, next) => {
    // Récupération du livre à supprimer.
    Book.findOne({ _id: req.params.id})
        .then(book => {
            // Condition pour que ce soit seulement le créateur du livre qui puisse supprimer.
            if (book.userId != req.auth.userId) {
                res.status(403).json({message: 'Demande non autorisé.'});
            } else {
                // Séparation du nom du fichier image.
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    // Suppression du fichier image.
                    Book.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Livre supprimé !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
 };

// Fonction pour un seul livre.

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};

//  Fonction liste de tous les livres.

exports.getAllBooks = (req, res, next) => {
    Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

// Fonction pour noter un livre.

exports.createRating = (req, res, next) => {

    const { userId, rating } = req.body;
    const user = req.body.userId;
    // Stockage de la requête dans une constante
    const ratingObject = { ...req.body, grade: req.body.rating };
    // Suppression du faux _id envoyé par le front
    delete ratingObject._id;

// Vérifier si l'utilisateur est autorisé ou non.
    if (user !== req.auth.userId) {
        return res.status(403).json({ message: "Demande non autorisé." });
    }

    // Vérifier que la  note est comprise entre 0 et 5.
    if (rating < 0 || rating > 5) {
        return res.status(400).json({ error: "La note doit être comprise entre 0 et 5." });
    }
    // Récupération du livre auquel on veut ajouter une note.
    Book.findOne({_id: req.params.id})
        .then((book) => {
            // Si introuvable... alors message d'erreur.
            if (!book) {
                return res.status(404).json({ error: "Ce livre est introuvable." });
            }

            // Vérifier si l'utilisateur a déjà noté le livre
            const userRating = book.ratings.find(
                (rating) => rating.userId === userId
            );
            // Si livre dejà noté alors message d'erreur.
            if (userRating) {
                return res.status(400).json({ error: "Vous avez déjà noté ce livre." });
            }

            // Ajouter la note à la liste de notation
            book.ratings.push({ userId, grade: rating });

            // Calculer la nouvelle note moyenne
            const totalRatings = book.ratings.length;
            const sumRatings = book.ratings.reduce(
                (sum, rating) => sum + rating.grade,0);
            const averageRating = (sumRatings / totalRatings);
            book.averageRating = averageRating;

            // Sauvegarder les modifications
            book.save()
                .then((updatedBook) => { res.status(200).json(updatedBook); })
                .catch((error) => { res.status(400).json({ error });});
        })
        .catch((error) => { res.status(500).json({ error });});
};

// Fonction pour récupérer les 3 premiers livres les mieux notés.

exports.getBestRating = (req, res, next) => {
    // Récupération de tous les livres.
    Book.find()
    // Renvoyer seulement les 3 premiers qui ont les meilleurs notes.
    .sort({ averageRating: -1 })
    .limit(3)
    .then(books => res.status(200).json(books))
    .catch(error => res.status(404).json({ error }));
};
