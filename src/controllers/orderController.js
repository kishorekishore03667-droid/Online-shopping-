const OrderModel = require('../models/orderModel');

const OrderController = {
  async placeOrder(req, res, next) {
    try {
      const {
        customerName,
        customerPhone,
        deliveryAddress,
        deliverySlot,
        paymentMethod,
        couponCode,
        notes
      } = req.body;

      if (!customerName || !customerPhone || !deliveryAddress || !deliverySlot || !paymentMethod) {
        return res.status(400).json({
          success: false,
          message: 'Customer name, phone, delivery address, time slot, and payment method are all required.'
        });
      }

      if (!['cod', 'upi', 'card'].includes(paymentMethod)) {
        return res.status(400).json({
          success: false,
          message: 'Payment method must be one of: cod, upi, card.'
        });
      }

      const order = await OrderModel.createOrder({
        userId: req.user.id,
        customerName,
        customerPhone,
        deliveryAddress,
        deliverySlot,
        paymentMethod,
        couponCode,
        notes
      });

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully! Thank you for shopping with Kishore Kumar Mart.',
        data: { order }
      });
    } catch (err) {
      next(err);
    }
  },

  async getUserOrders(req, res, next) {
    try {
      const orders = await OrderModel.getByUserId(req.user.id);
      return res.json({
        success: true,
        data: orders
      });
    } catch (err) {
      next(err);
    }
  },

  async getOrderById(req, res, next) {
    try {
      const order = await OrderModel.getById(req.params.id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found.'
        });
      }

      // Check ownership unless admin
      if (order.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this order.'
        });
      }

      return res.json({
        success: true,
        data: { order }
      });
    } catch (err) {
      next(err);
    }
  },

  async trackOrder(req, res, next) {
    try {
      const { orderNumber } = req.params;
      const order = await OrderModel.getByOrderNumber(orderNumber);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found with the provided order number.'
        });
      }

      return res.json({
        success: true,
        data: { order }
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = OrderController;
