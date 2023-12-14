const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Création des Mime_Types pour gérer l'extension du fichier.
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/png': 'png'
};

// Utilisatio de diskStorage pour configurer le chemin et le nom de fichier pour les fichiers entrants.
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
//   Création du nom du fichier.
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    // Création du nom du ficher avec la date de la mise en ligne.
    callback(null, name + Date.now() + '.' + extension);
  }
});

module.exports = multer({storage: storage}).single('image');

// Optimiser les images.
module.exports.optimiseImage = (req, res, next) => {
  // On met une condition pour vérifier si un fichier a été téléchargé.
  if (!req.file) {
    return next();
  }

  const filePath = req.file.path;
  const fileName = req.file.filename;
  const sharpFilePath = path.join('images', `optimisation_${fileName}`);

  sharp(filePath)
    .resize({ width: 400, height: 400, fit: 'contain' })
    .toFile(sharpFilePath)
    .then(() => {
      // Remplacer le fichier original par le fichier redimensionné
      fs.unlink(filePath, () => {
        req.file.path = sharpFilePath;
        next();
      });
    })
    .catch((error) => { res.status(403).json({ error });
  });
};