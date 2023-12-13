const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users');

exports.signup = (req, res, next) => {
    // Crypter le password.
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        // Création d'un nouveau user.
        const user = new User({
          email: req.body.email,
          password: hash
        });
        // Enregistrement du nouveau user.
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    // Recherche du user dans la base de donnée.
    User.findOne({ email: req.body.email })
        .then(user => {
            // Envoyer une erreur si l'user n'existe pas.
            if (!user) {
                return res.status(403).json({ error: 'Demande non autorisé.' });
            }
            // Comparer les password base de donnée et celui de la requête. 
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    // Si pas valide alors message d'erreur.
                    if (!valid) {
                        return res.status(403).json({ error: 'Demande non autorisé.' });
                    }
                    // Si valide alors renvoie d'un token et du userId.
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '5h' }
                        )
                    });
                })
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
 };