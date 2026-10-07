const express = require('express');
const router = express.Router();
const WishlistController = require('../controllers/wishlistController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', WishlistController.getWishlist);
router.post('/toggle', WishlistController.toggleWishlist);

module.exports = router;
