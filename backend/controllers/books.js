const Book = require('../models/books');
const fs = require('fs');

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
                    res.status(401).json({ message : 'Not authorized'});
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
                res.status(401).json({message: 'Not authorized'});
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

//  Fonction liste de tous les livres.

exports.getAllBooks = (req, res, next) => {
    Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

// Fonction pour un seul livre.

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};

// Fonction pour noter un livre.

exports.createRating = (req, res, next) => {
    // Vérifier si la note est comprise entre 0 et 5.
    if (0 <= req.body.rating <= 5) {
        // On stocke la requête.
        const ratingObject = { ...req.body, grade: req.body.rating };
        // Suppression du faux _id envoyé par le front.
        delete ratingObject._id;
        // Récupération du livre dans lequel on veut ajouter une note.
        Book.findOne({_id: req.params.id})
            .then(book => {
                // Variable regroupant toutes les userId ayant déjà noté le livre en question.
                const newRatings = book.ratings;
                const userIdArray = newRatings.map(rating => rating.userId);
                // Vérifier que l'utilisateur n'a jamais noté le livre.
                if (userIdArray.includes(req.auth.userId)) {
                    res.status(403).json({ message : 'utilisateur non autorisé' });
                } else {
                    // Ajout de la note.
                    newRatings.push(ratingObject);
                    const totalRatings = book.ratings.length;
                    const sumRatings = book.ratings.reduce(
                        (sum, rating) => sum + rating.grade,
                        0
                    );
                    // Faire une moyenne.
                    const averageRating = (sumRatings / totalRatings);
                    book.averageRating = averageRating;
                    }})
                    // Sauvegarder les modifications.
                    Book.save()
                        .then((updatedBook) => {
                            res.status(200).json(updatedBook);
                        })
                        .catch((error) => {
                            res.status(500).json({ error });
                        })
                .catch((error) => { res.status(400).json({ message: 'La note doit être comprise entre 1 et 5' });
                });
        };}

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
