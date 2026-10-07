const express = require('express');
const router = express.Router();
const CouponController = require('../controllers/couponController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', CouponController.getActiveCoupons);
router.post('/apply', authenticateToken, CouponController.applyCoupon);

module.exports = router;
