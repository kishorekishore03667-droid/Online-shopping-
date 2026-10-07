const WishlistModel = require('../models/wishlistModel');
const ProductModel = require('../models/productModel');

const WishlistController = {
  async getWishlist(req, res, next) {
    try {
      const items = await WishlistModel.getByUserId(req.user.id);
      return res.json({
        success: true,
        data: items
      });
    } catch (err) {
      next(err);
    }
  },

  async toggleWishlist(req, res, next) {
    try {
      const { productId } = req.body;
      if (!productId) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required.'
        });
      }

      const product = await ProductModel.getById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.'
        });
      }

      const result = await WishlistModel.toggle(req.user.id, productId);
      const items = await WishlistModel.getByUserId(req.user.id);

      return res.json({
        success: true,
        message: result.message,
        data: {
          added: result.added,
          items
        }
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = WishlistController;
