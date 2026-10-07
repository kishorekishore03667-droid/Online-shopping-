const OrderModel = require('../models/orderModel');
const ProductModel = require('../models/productModel');
const CategoryModel = require('../models/categoryModel');
const UserModel = require('../models/userModel');
const CouponModel = require('../models/couponModel');

const AdminController = {
  async getDashboardStats(req, res, next) {
    try {
      const stats = await OrderModel.getDashboardStats();
      const lowStock = await ProductModel.getLowStock(10);
      const recentOrders = await OrderModel.getAllOrders();

      return res.json({
        success: true,
        data: {
          metrics: stats,
          lowStockProducts: lowStock,
          recentOrders: recentOrders.slice(0, 5)
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async getProducts(req, res, next) {
    try {
      const products = await ProductModel.getAll({ limit: 100 });
      return res.json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (err) {
      next(err);
    }
  },

  async addProduct(req, res, next) {
    try {
      const {
        categoryId,
        name,
        description,
        unit,
        price,
        discountPrice,
        stockQuantity,
        imageUrl,
        isFeatured
      } = req.body;

      if (!name || !unit || !price) {
        return res.status(400).json({
          success: false,
          message: 'Product name, unit of measure, and regular price are required.'
        });
      }

      const id = await ProductModel.create({
        categoryId: categoryId ? Number(categoryId) : null,
        name,
        description,
        unit,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        stockQuantity: Number(stockQuantity) || 0,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80',
        isFeatured: !!isFeatured
      });

      const product = await ProductModel.getById(id);
      return res.status(201).json({
        success: true,
        message: 'Product created successfully.',
        data: product
      });
    } catch (err) {
      next(err);
    }
  },

  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await ProductModel.update(id, req.body);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.'
        });
      }

      return res.json({
        success: true,
        message: 'Product updated successfully.',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      await ProductModel.delete(id);
      return res.json({
        success: true,
        message: 'Product deleted successfully.'
      });
    } catch (err) {
      next(err);
    }
  },

  async getOrders(req, res, next) {
    try {
      const { status } = req.query;
      const orders = await OrderModel.getAllOrders(status);
      return res.json({
        success: true,
        count: orders.length,
        data: orders
      });
    } catch (err) {
      next(err);
    }
  },

  async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { orderStatus, paymentStatus } = req.body;

      if (!orderStatus) {
        return res.status(400).json({
          success: false,
          message: 'orderStatus is required.'
        });
      }

      const updated = await OrderModel.updateStatus(id, orderStatus, paymentStatus);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Order not found.'
        });
      }

      return res.json({
        success: true,
        message: `Order #${updated.order_number} status updated to ${orderStatus}.`,
        data: updated
      });
    } catch (err) {
      next(err);
    }
  },

  async getUsers(req, res, next) {
    try {
      const users = await UserModel.getAllUsers();
      return res.json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (err) {
      next(err);
    }
  },

  async getCoupons(req, res, next) {
    try {
      const coupons = await CouponModel.getAll();
      return res.json({
        success: true,
        data: coupons
      });
    } catch (err) {
      next(err);
    }
  },

  async addCoupon(req, res, next) {
    try {
      const { code, discountPercent, maxDiscount, minOrderAmount } = req.body;
      if (!code || !discountPercent || !maxDiscount) {
        return res.status(400).json({
          success: false,
          message: 'Coupon code, discount percent, and max discount are required.'
        });
      }

      const id = await CouponModel.create({
        code,
        discountPercent: Number(discountPercent),
        maxDiscount: Number(maxDiscount),
        minOrderAmount: Number(minOrderAmount) || 0
      });

      return res.status(201).json({
        success: true,
        message: 'Coupon created successfully.',
        data: { id, code: code.toUpperCase() }
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteCoupon(req, res, next) {
    try {
      const { id } = req.params;
      await CouponModel.delete(id);
      return res.json({
        success: true,
        message: 'Coupon removed successfully.'
      });
    } catch (err) {
      next(err);
    }
  },

  async getLowStockAlerts(req, res, next) {
    try {
      const lowStock = await ProductModel.getLowStock(10);
      return res.json({
        success: true,
        count: lowStock.length,
        data: lowStock
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = AdminController;
