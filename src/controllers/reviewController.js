const ReviewModel = require('../models/reviewModel');
const ProductModel = require('../models/productModel');

const ReviewController = {
  async getProductReviews(req, res, next) {
    try {
      const { productId } = req.params;
      const reviews = await ReviewModel.getByProductId(productId);
      return res.json({
        success: true,
        data: reviews
      });
    } catch (err) {
      next(err);
    }
  },

  async addReview(req, res, next) {
    try {
      const { productId, rating, comment } = req.body;

      if (!productId || !rating || !comment) {
        return res.status(400).json({
          success: false,
          message: 'Product ID, rating (1-5), and review comment are required.'
        });
      }

      const numRating = Number(rating);
      if (numRating < 1 || numRating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be an integer between 1 and 5.'
        });
      }

      const product = await ProductModel.getById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.'
        });
      }

      await ReviewModel.addReview({
        productId,
        userId: req.user.id,
        userName: req.user.name || 'Verified Customer',
        rating: numRating,
        comment: comment.trim()
      });

      const updatedReviews = await ReviewModel.getByProductId(productId);
      const updatedProduct = await ProductModel.getById(productId);

      return res.status(201).json({
        success: true,
        message: 'Thank you for your review!',
        data: {
          product: updatedProduct,
          reviews: updatedReviews
        }
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = ReviewController;
