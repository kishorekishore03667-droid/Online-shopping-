const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/product/:productId', ReviewController.getProductReviews);
router.post('/add', authenticateToken, ReviewController.addReview);

module.exports = router;
