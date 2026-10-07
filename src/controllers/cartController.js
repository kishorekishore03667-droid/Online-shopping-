const CartModel = require('../models/cartModel');
const ProductModel = require('../models/productModel');

const CartController = {
  async getCart(req, res, next) {
    try {
      const summary = await CartModel.getCartSummary(req.user.id);
      return res.json({
        success: true,
        data: summary
      });
    } catch (err) {
      next(err);
    }
  },

  async addToCart(req, res, next) {
    try {
      const { productId, quantity = 1 } = req.body;

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

      if (product.stock_quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock_quantity} units available in stock.`
        });
      }

      await CartModel.addItem(req.user.id, productId, quantity);
      const summary = await CartModel.getCartSummary(req.user.id);

      return res.json({
        success: true,
        message: `Added ${product.name} to cart.`,
        data: summary
      });
    } catch (err) {
      next(err);
    }
  },

  async updateQuantity(req, res, next) {
    try {
      const { productId, quantity } = req.body;

      if (!productId || quantity === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Product ID and quantity are required.'
        });
      }

      const product = await ProductModel.getById(productId);
      if (!product && quantity > 0) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.'
        });
      }

      if (quantity > 0 && product.stock_quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Only ${product.stock_quantity} available in stock.`
        });
      }

      await CartModel.updateQuantity(req.user.id, productId, quantity);
      const summary = await CartModel.getCartSummary(req.user.id);

      return res.json({
        success: true,
        data: summary
      });
    } catch (err) {
      next(err);
    }
  },

  async removeItem(req, res, next) {
    try {
      const { productId } = req.params;
      await CartModel.removeItem(req.user.id, productId);
      const summary = await CartModel.getCartSummary(req.user.id);

      return res.json({
        success: true,
        message: 'Item removed from cart.',
        data: summary
      });
    } catch (err) {
      next(err);
    }
  },

  async clearCart(req, res, next) {
    try {
      await CartModel.clearCart(req.user.id);
      return res.json({
        success: true,
        message: 'Cart cleared successfully.',
        data: { items: [], itemCount: 0, subtotal: 0, deliveryFee: 0 }
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = CartController;
