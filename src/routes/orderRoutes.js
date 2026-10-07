const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public order tracking by order number
router.get('/track/:orderNumber', OrderController.trackOrder);

// Authenticated user order actions
router.post('/checkout', authenticateToken, OrderController.placeOrder);
router.get('/my-orders', authenticateToken, OrderController.getUserOrders);
router.get('/:id', authenticateToken, OrderController.getOrderById);

module.exports = router;
