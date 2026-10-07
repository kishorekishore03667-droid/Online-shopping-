const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// Protect all admin endpoints
router.use(authenticateToken, requireAdmin);

// Dashboard metrics
router.get('/stats', AdminController.getDashboardStats);
router.get('/low-stock', AdminController.getLowStockAlerts);

// Product Management CRUD
router.get('/products', AdminController.getProducts);
router.post('/products', AdminController.addProduct);
router.put('/products/:id', AdminController.updateProduct);
router.delete('/products/:id', AdminController.deleteProduct);

// Order Management
router.get('/orders', AdminController.getOrders);
router.put('/orders/:id/status', AdminController.updateOrderStatus);

// Customers
router.get('/users', AdminController.getUsers);

// Coupons
router.get('/coupons', AdminController.getCoupons);
router.post('/coupons', AdminController.addCoupon);
router.delete('/coupons/:id', AdminController.deleteCoupon);

module.exports = router;
