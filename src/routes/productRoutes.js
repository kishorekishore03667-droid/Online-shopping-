const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');

router.get('/', ProductController.getProducts);
router.get('/featured', ProductController.getFeatured);
router.get('/detail/:id', ProductController.getProductById);
router.get('/slug/:slug', ProductController.getProductBySlug);

module.exports = router;
