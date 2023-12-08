const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config');
const booksCtrl = require('../controllers/books');

router.get('/', auth, booksCtrl.getAllBooks);
router.get('/bestrating', auth, booksCtrl.getBestRating);
router.get('/:id', auth, booksCtrl.getOneBook);
router.post('/', auth, multer, booksCtrl.createBook);
router.post('/:id/rating', auth, multer, booksCtrl.createRating);
router.put('/:id', auth, multer, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);

module.exports = router;


