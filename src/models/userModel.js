const { query } = require('../config/database');

const UserModel = {
  async findByEmail(email) {
    return query.get('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email]);
  },

  async findById(id) {
    return query.get(
      'SELECT id, full_name, email, phone, address, role, created_at FROM users WHERE id = ?',
      [id]
    );
  },

  async create({ fullName, email, passwordHash, phone = '', address = '', role = 'customer' }) {
    const res = await query.run(
      `INSERT INTO users (full_name, email, password_hash, phone, address, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [fullName, email.toLowerCase().trim(), passwordHash, phone, address, role]
    );
    return res.lastID;
  },

  async updateProfile(id, { fullName, phone, address }) {
    await query.run(
      `UPDATE users SET full_name = ?, phone = ?, address = ? WHERE id = ?`,
      [fullName, phone, address, id]
    );
    return this.findById(id);
  },

  async getAllUsers() {
    return query.all(
      `SELECT u.id, u.full_name, u.email, u.phone, u.address, u.role, u.created_at,
              COUNT(o.id) as total_orders,
              COALESCE(SUM(o.final_amount), 0) as total_spent
       FROM users u
       LEFT JOIN orders o ON u.id = o.user_id
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );
  }
};

module.exports = UserModel;
