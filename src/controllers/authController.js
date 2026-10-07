const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const AuthController = {
  async register(req, res, next) {
    try {
      const { fullName, email, password, phone, address } = req.body;

      if (!fullName || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Full name, email address, and password are required.'
        });
      }

      // Email format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address.'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long.'
        });
      }

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists. Please log in.'
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userId = await UserModel.create({
        fullName,
        email,
        passwordHash,
        phone,
        address,
        role: 'customer'
      });

      const user = await UserModel.findById(userId);

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.full_name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        success: true,
        message: 'Account created successfully! Welcome to Kishore Kumar Mart.',
        data: {
          user,
          token
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Both email and password are required.'
        });
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password. Please try again.'
        });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password. Please try again.'
        });
      }

      const safeUser = {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role
      };

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.full_name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        message: 'Logged in successfully.',
        data: {
          user: safeUser,
          token
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async getProfile(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User profile not found.'
        });
      }

      return res.json({
        success: true,
        data: { user }
      });
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const { fullName, phone, address } = req.body;
      const updatedUser = await UserModel.updateProfile(req.user.id, {
        fullName: fullName || req.user.name,
        phone: phone || '',
        address: address || ''
      });

      return res.json({
        success: true,
        message: 'Profile updated successfully.',
        data: { user: updatedUser }
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = AuthController;
