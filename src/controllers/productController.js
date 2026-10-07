const ProductModel = require('../models/productModel');

const ProductController = {
  async getProducts(req, res, next) {
    try {
      const { category, search, minPrice, maxPrice, inStock, sort, limit, offset } = req.query;
      const products = await ProductModel.getAll({
        category,
        search,
        minPrice,
        maxPrice,
        inStock,
        sort,
        limit,
        offset
      });

      return res.json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (err) {
      next(err);
    }
  },

  async getFeatured(req, res, next) {
    try {
      const products = await ProductModel.getFeatured();
      return res.json({
        success: true,
        data: products
      });
    } catch (err) {
      next(err);
    }
  },

  async getProductById(req, res, next) {
    try {
      const product = await ProductModel.getById(req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.'
        });
      }

      return res.json({
        success: true,
        data: product
      });
    } catch (err) {
      next(err);
    }
  },

  async getProductBySlug(req, res, next) {
    try {
      const product = await ProductModel.getBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.'
        });
      }

      return res.json({
        success: true,
        data: product
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = ProductController;
