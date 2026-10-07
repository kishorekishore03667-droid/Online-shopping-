const { query } = require('../config/database');

const ProductModel = {
  async getAll(filters = {}) {
    let sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
    `;
    const params = [];

    if (filters.category) {
      sql += ' AND (c.slug = ? OR c.id = ?)';
      params.push(filters.category, filters.category);
    }

    if (filters.search) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)';
      const term = `%${filters.search}%`;
      params.push(term, term, term);
    }

    if (filters.minPrice) {
      sql += ' AND COALESCE(p.discount_price, p.price) >= ?';
      params.push(Number(filters.minPrice));
    }

    if (filters.maxPrice) {
      sql += ' AND COALESCE(p.discount_price, p.price) <= ?';
      params.push(Number(filters.maxPrice));
    }

    if (filters.inStock === 'true' || filters.inStock === true) {
      sql += ' AND p.stock_quantity > 0';
    }

    // Sorting
    switch (filters.sort) {
      case 'price_asc':
        sql += ' ORDER BY COALESCE(p.discount_price, p.price) ASC';
        break;
      case 'price_desc':
        sql += ' ORDER BY COALESCE(p.discount_price, p.price) DESC';
        break;
      case 'rating':
        sql += ' ORDER BY p.rating DESC';
        break;
      case 'newest':
        sql += ' ORDER BY p.created_at DESC';
        break;
      default:
        sql += ' ORDER BY p.is_featured DESC, p.id DESC';
    }

    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(Number(filters.limit));
      if (filters.offset) {
        sql += ' OFFSET ?';
        params.push(Number(filters.offset));
      }
    }

    return query.all(sql, params);
  },

  async getFeatured() {
    return query.all(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1 AND p.is_featured = 1
      ORDER BY p.rating DESC
      LIMIT 8
    `);
  },

  async getById(id) {
    return query.get(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [id]);
  },

  async getBySlug(slug) {
    return query.get(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ?
    `, [slug]);
  },

  async create(data) {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const res = await query.run(`
      INSERT INTO products (
        category_id, name, slug, description, unit, price, discount_price,
        stock_quantity, image_url, rating, reviews_count, is_featured, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 1)
    `, [
      data.categoryId,
      data.name,
      slug,
      data.description || '',
      data.unit,
      data.price,
      data.discountPrice || null,
      data.stockQuantity || 0,
      data.imageUrl || '',
      data.rating || 4.5,
      data.isFeatured ? 1 : 0
    ]);
    return res.lastID;
  },

  async update(id, data) {
    const existing = await this.getById(id);
    if (!existing) return null;

    const slug = data.slug || (data.name ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : existing.slug);

    await query.run(`
      UPDATE products SET
        category_id = COALESCE(?, category_id),
        name = COALESCE(?, name),
        slug = ?,
        description = COALESCE(?, description),
        unit = COALESCE(?, unit),
        price = COALESCE(?, price),
        discount_price = ?,
        stock_quantity = COALESCE(?, stock_quantity),
        image_url = COALESCE(?, image_url),
        is_featured = COALESCE(?, is_featured),
        is_active = COALESCE(?, is_active)
      WHERE id = ?
    `, [
      data.categoryId !== undefined ? data.categoryId : existing.category_id,
      data.name !== undefined ? data.name : existing.name,
      slug,
      data.description !== undefined ? data.description : existing.description,
      data.unit !== undefined ? data.unit : existing.unit,
      data.price !== undefined ? data.price : existing.price,
      data.discountPrice !== undefined ? data.discountPrice : existing.discount_price,
      data.stockQuantity !== undefined ? data.stockQuantity : existing.stock_quantity,
      data.imageUrl !== undefined ? data.imageUrl : existing.image_url,
      data.isFeatured !== undefined ? (data.isFeatured ? 1 : 0) : existing.is_featured,
      data.isActive !== undefined ? (data.isActive ? 1 : 0) : existing.is_active,
      id
    ]);

    return this.getById(id);
  },

  async delete(id) {
    return query.run('DELETE FROM products WHERE id = ?', [id]);
  },

  async updateStock(id, quantityChange) {
    return query.run(
      'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
      [quantityChange, id]
    );
  },

  async getLowStock(threshold = 10) {
    return query.all(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.stock_quantity <= ? AND p.is_active = 1
      ORDER BY p.stock_quantity ASC
    `, [threshold]);
  }
};

module.exports = ProductModel;
