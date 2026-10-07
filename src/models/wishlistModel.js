const { query } = require('../config/database');

const WishlistModel = {
  async getByUserId(userId) {
    return query.all(`
      SELECT w.id as wishlist_id, w.created_at, p.*, c.name as category_name
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE w.user_id = ? AND p.is_active = 1
      ORDER BY w.created_at DESC
    `, [userId]);
  },

  async toggle(userId, productId) {
    const existing = await query.get(
      'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (existing) {
      await query.run('DELETE FROM wishlist WHERE id = ?', [existing.id]);
      return { added: false, message: 'Removed from wishlist' };
    } else {
      await query.run(
        'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
        [userId, productId]
      );
      return { added: true, message: 'Added to wishlist' };
    }
  },

  async isInWishlist(userId, productId) {
    const row = await query.get(
      'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    return !!row;
  }
};

module.exports = WishlistModel;
