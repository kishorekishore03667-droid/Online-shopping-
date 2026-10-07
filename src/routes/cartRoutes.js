const express = require('express');
const router = express.Router();
const CartController = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/authMiddleware');

// All cart actions require authenticated user
router.use(authenticateToken);

router.get('/', CartController.getCart);
router.post('/add', CartController.addToCart);
router.put('/update', CartController.updateQuantity);
router.delete('/remove/:productId', CartController.removeItem);
router.delete('/clear', CartController.clearCart);

module.exports = router;
