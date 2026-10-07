const { query } = require('../config/database');

const CouponModel = {
  async getByCode(code) {
    return query.get(
      'SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) AND is_active = 1',
      [code.trim()]
    );
  },

  async getAll() {
    return query.all('SELECT * FROM coupons ORDER BY created_at DESC');
  },

  async validateCoupon(code, subtotal) {
    const coupon = await this.getByCode(code);
    if (!coupon) {
      return { valid: false, message: 'Invalid or expired coupon code' };
    }

    if (subtotal < coupon.min_order_amount) {
      return {
        valid: false,
        message: `This coupon requires a minimum cart value of ₹${coupon.min_order_amount}`
      };
    }

    let calculatedDiscount = (subtotal * coupon.discount_percent) / 100;
    if (calculatedDiscount > coupon.max_discount) {
      calculatedDiscount = coupon.max_discount;
    }

    return {
      valid: true,
      coupon,
      discountAmount: Math.round(calculatedDiscount * 100) / 100
    };
  },

  async create({ code, discountPercent, maxDiscount, minOrderAmount = 0 }) {
    const res = await query.run(`
      INSERT INTO coupons (code, discount_percent, max_discount, min_order_amount, is_active)
      VALUES (?, ?, ?, ?, 1)
    `, [code.toUpperCase().trim(), discountPercent, maxDiscount, minOrderAmount]);
    return res.lastID;
  },

  async delete(id) {
    return query.run('DELETE FROM coupons WHERE id = ?', [id]);
  }
};

module.exports = CouponModel;
