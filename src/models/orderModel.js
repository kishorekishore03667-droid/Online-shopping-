const { query } = require('../config/database');
const CartModel = require('./cartModel');
const CouponModel = require('./couponModel');

const OrderModel = {
  async createOrder({
    userId,
    customerName,
    customerPhone,
    deliveryAddress,
    deliverySlot,
    paymentMethod,
    couponCode = null,
    notes = ''
  }) {
    // 1. Get user cart items
    const cartSummary = await CartModel.getCartSummary(userId);
    if (!cartSummary.items || cartSummary.items.length === 0) {
      throw new Error('Your cart is empty. Add products before placing an order.');
    }

    // 2. Validate stock availability for all items
    for (const item of cartSummary.items) {
      const prod = await query.get('SELECT stock_quantity, name FROM products WHERE id = ?', [item.product_id]);
      if (!prod || prod.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for "${item.name}". Only ${prod ? prod.stock_quantity : 0} left.`);
      }
    }

    // 3. Calculate discounts & delivery fee
    let discountAmount = 0;
    if (couponCode) {
      const couponCheck = await CouponModel.validateCoupon(couponCode, cartSummary.subtotal);
      if (couponCheck.valid) {
        discountAmount = couponCheck.discountAmount;
      }
    }

    const deliveryFee = cartSummary.deliveryFee;
    const finalAmount = Math.max(0, cartSummary.subtotal - discountAmount + deliveryFee);
    const orderNumber = 'KKM-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 90 + 10);
    const paymentStatus = paymentMethod === 'cod' ? 'Pending' : 'Paid';

    // 4. Create Order record
    const orderRes = await query.run(`
      INSERT INTO orders (
        order_number, user_id, total_amount, discount_amount, delivery_fee, final_amount,
        coupon_code, customer_name, customer_phone, delivery_address, delivery_slot,
        payment_method, payment_status, order_status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Placed', ?)
    `, [
      orderNumber,
      userId,
      cartSummary.subtotal,
      discountAmount,
      deliveryFee,
      finalAmount,
      couponCode,
      customerName,
      customerPhone,
      deliveryAddress,
      deliverySlot,
      paymentMethod,
      paymentStatus,
      notes
    ]);

    const orderId = orderRes.lastID;

    // 5. Insert order items & deduct stock
    for (const item of cartSummary.items) {
      await query.run(`
        INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        orderId,
        item.product_id,
        item.name,
        item.effective_price,
        item.quantity,
        item.subtotal
      ]);

      // Deduct stock
      await query.run(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    // 6. Clear user cart
    await CartModel.clearCart(userId);

    return this.getById(orderId);
  },

  async getById(id) {
    const order = await query.get('SELECT * FROM orders WHERE id = ?', [id]);
    if (!order) return null;
    order.items = await this.getOrderItems(order.id);
    return order;
  },

  async getByOrderNumber(orderNumber) {
    const order = await query.get('SELECT * FROM orders WHERE order_number = ?', [orderNumber]);
    if (!order) return null;
    order.items = await this.getOrderItems(order.id);
    return order;
  },

  async getByUserId(userId) {
    const orders = await query.all(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    for (const order of orders) {
      order.items = await this.getOrderItems(order.id);
    }
    return orders;
  },

  async getAllOrders(statusFilter = null) {
    let sql = 'SELECT * FROM orders';
    const params = [];
    if (statusFilter) {
      sql += ' WHERE order_status = ?';
      params.push(statusFilter);
    }
    sql += ' ORDER BY created_at DESC';

    const orders = await query.all(sql, params);
    for (const order of orders) {
      order.items = await this.getOrderItems(order.id);
    }
    return orders;
  },

  async getOrderItems(orderId) {
    return query.all(`
      SELECT oi.*, p.image_url, p.unit
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [orderId]);
  },

  async updateStatus(orderId, orderStatus, paymentStatus = null) {
    if (paymentStatus) {
      await query.run(
        'UPDATE orders SET order_status = ?, payment_status = ? WHERE id = ?',
        [orderStatus, paymentStatus, orderId]
      );
    } else {
      await query.run(
        'UPDATE orders SET order_status = ? WHERE id = ?',
        [orderStatus, orderId]
      );
    }
    return this.getById(orderId);
  },

  async getDashboardStats() {
    const revenue = await query.get(
      "SELECT COALESCE(SUM(final_amount), 0) as total_revenue FROM orders WHERE order_status != 'Cancelled'"
    );
    const totalOrders = await query.get('SELECT COUNT(*) as count FROM orders');
    const pendingOrders = await query.get(
      "SELECT COUNT(*) as count FROM orders WHERE order_status IN ('Placed', 'Confirmed', 'Packed')"
    );
    const deliveredOrders = await query.get(
      "SELECT COUNT(*) as count FROM orders WHERE order_status = 'Delivered'"
    );
    const totalProducts = await query.get('SELECT COUNT(*) as count FROM products WHERE is_active = 1');
    const lowStock = await query.get('SELECT COUNT(*) as count FROM products WHERE stock_quantity <= 10 AND is_active = 1');
    const totalCustomers = await query.get("SELECT COUNT(*) as count FROM users WHERE role = 'customer'");

    return {
      totalRevenue: Math.round(revenue.total_revenue * 100) / 100,
      totalOrders: totalOrders.count,
      pendingOrders: pendingOrders.count,
      deliveredOrders: deliveredOrders.count,
      totalProducts: totalProducts.count,
      lowStockProducts: lowStock.count,
      totalCustomers: totalCustomers.count
    };
  }
};

module.exports = OrderModel;
