const { query } = require('../config/database');

const CategoryModel = {
  async getAll() {
    return query.all(
      `SELECT c.*, COUNT(p.id) as product_count
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
       WHERE c.is_active = 1
       GROUP BY c.id
       ORDER BY c.name ASC`
    );
  },

  async getBySlug(slug) {
    return query.get('SELECT * FROM categories WHERE slug = ?', [slug]);
  },

  async getById(id) {
    return query.get('SELECT * FROM categories WHERE id = ?', [id]);
  },

  async create({ name, slug, icon, description }) {
    const res = await query.run(
      `INSERT INTO categories (name, slug, icon, description, is_active)
       VALUES (?, ?, ?, ?, 1)`,
      [name, slug, icon, description]
    );
    return res.lastID;
  },

  async update(id, { name, slug, icon, description, isActive = 1 }) {
    await query.run(
      `UPDATE categories
       SET name = ?, slug = ?, icon = ?, description = ?, is_active = ?
       WHERE id = ?`,
      [name, slug, icon, description, isActive, id]
    );
    return this.getById(id);
  },

  async delete(id) {
    return query.run('DELETE FROM categories WHERE id = ?', [id]);
  }
};

module.exports = CategoryModel;
