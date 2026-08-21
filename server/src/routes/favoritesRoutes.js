const express = require('express');
const auth = require('../middleware/auth');
const {
  listFavorites,
  addFavorite,
  removeFavorite
} = require('../controllers/favoritesController');

const router = express.Router();

router.use(auth);

router.get('/', listFavorites);
router.post('/:productId', addFavorite);
router.delete('/:productId', removeFavorite);

module.exports = router;
