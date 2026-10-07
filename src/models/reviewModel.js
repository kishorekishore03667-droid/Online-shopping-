const { query } = require('../config/database');

const ReviewModel = {
  async getByProductId(productId) {
    return query.all(
      'SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC',
      [productId]
    );
  },

  async addReview({ productId, userId, userName, rating, comment }) {
    const res = await query.run(`
      INSERT INTO reviews (product_id, user_id, user_name, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `, [productId, userId, userName, rating, comment]);

    // Recalculate average rating & reviews count for product
    const stats = await query.get(`
      SELECT COUNT(*) as count, AVG(rating) as avg_rating
      FROM reviews WHERE product_id = ?
    `, [productId]);

    if (stats) {
      const avg = Math.round((stats.avg_rating || 5) * 10) / 10;
      await query.run(`
        UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?
      `, [avg, stats.count, productId]);
    }

    return res.lastID;
  }
};

module.exports = ReviewModel;
