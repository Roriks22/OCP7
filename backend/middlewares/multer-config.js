const multer = require('multer');

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