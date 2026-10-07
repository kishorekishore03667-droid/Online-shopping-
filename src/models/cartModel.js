const { query } = require('../config/database');

const CartModel = {
  async getByUserId(userId) {
    return query.all(`
      SELECT ci.id, ci.user_id, ci.product_id, ci.quantity, ci.created_at,
             p.name, p.slug, p.unit, p.price, p.discount_price,
             COALESCE(p.discount_price, p.price) as effective_price,
             p.stock_quantity, p.image_url,
             (ci.quantity * COALESCE(p.discount_price, p.price)) as subtotal
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ? AND p.is_active = 1
      ORDER BY ci.created_at DESC
    `, [userId]);
  },

  async addItem(userId, productId, quantity = 1) {
    const existing = await query.get(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (existing) {
      const newQty = existing.quantity + Number(quantity);
      await query.run(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [newQty, existing.id]
      );
      return { id: existing.id, quantity: newQty };
    } else {
      const res = await query.run(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [userId, productId, Number(quantity)]
      );
      return { id: res.lastID, quantity: Number(quantity) };
    }
  },

  async updateQuantity(userId, productId, quantity) {
    const qty = Number(quantity);
    if (qty <= 0) {
      return this.removeItem(userId, productId);
    }
    return query.run(
      'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?',
      [qty, userId, productId]
    );
  },

  async removeItem(userId, productId) {
    return query.run(
      'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
  },

  async clearCart(userId) {
    return query.run('DELETE FROM cart_items WHERE user_id = ?', [userId]);
  },

  async getCartSummary(userId) {
    const items = await this.getByUserId(userId);
    let subtotal = 0;
    let itemCount = 0;

    for (const item of items) {
      subtotal += item.subtotal;
      itemCount += item.quantity;
    }

    // Free delivery on orders over ₹499, otherwise ₹40 delivery fee
    const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 40;

    return {
      items,
      itemCount,
      subtotal: Math.round(subtotal * 100) / 100,
      deliveryFee,
      freeDeliveryThreshold: 499,
      amountNeededForFreeDelivery: subtotal >= 499 ? 0 : Math.max(0, 499 - subtotal)
    };
  }
};

module.exports = CartModel;
