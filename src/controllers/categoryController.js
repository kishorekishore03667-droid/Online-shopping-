const CategoryModel = require('../models/categoryModel');

const CategoryController = {
  async getCategories(req, res, next) {
    try {
      const categories = await CategoryModel.getAll();
      return res.json({
        success: true,
        data: categories
      });
    } catch (err) {
      next(err);
    }
  },

  async getCategoryBySlug(req, res, next) {
    try {
      const category = await CategoryModel.getBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found.'
        });
      }

      return res.json({
        success: true,
        data: category
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = CategoryController;
