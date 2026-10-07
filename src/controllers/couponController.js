const CouponModel = require('../models/couponModel');
const CartModel = require('../models/cartModel');

const CouponController = {
  async applyCoupon(req, res, next) {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Coupon code is required.'
        });
      }

      const cartSummary = await CartModel.getCartSummary(req.user.id);
      const validation = await CouponModel.validateCoupon(code, cartSummary.subtotal);

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.message
        });
      }

      return res.json({
        success: true,
        message: `Coupon "${code.toUpperCase()}" applied! You saved ₹${validation.discountAmount}.`,
        data: {
          code: code.toUpperCase(),
          discountAmount: validation.discountAmount,
          newTotal: Math.max(0, cartSummary.subtotal - validation.discountAmount + cartSummary.deliveryFee)
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async getActiveCoupons(req, res, next) {
    try {
      const coupons = await CouponModel.getAll();
      return res.json({
        success: true,
        data: coupons.filter(c => c.is_active === 1)
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = CouponController;
