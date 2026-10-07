require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { seedDatabase } = require('./src/models/seed');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const couponRoutes = require('./src/routes/couponRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const wishlistRoutes = require('./src/routes/wishlistRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Kishore Kumar Mart API'
  });
});

// 404 & Centralized Error Handlers for API
app.use('/api/*', notFoundHandler);
app.use(errorHandler);

// Fallback route to serve index.html for frontend navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Auto-seed database and start server
async function startServer() {
  try {
    await seedDatabase();
    app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`🛒 Kishore Kumar Mart Server is live at http://localhost:${PORT}`);
      console.log(`📦 Admin Dashboard: http://localhost:${PORT}/admin.html`);
      console.log(`🛡️  Admin Credentials: admin@kishorekumarmart.com / admin123`);
      console.log(`👤 Customer Demo: customer@example.com / customer123`);
      console.log('====================================================');
    });
  } catch (err) {
    console.error('Fatal: Failed to start server:', err);
    process.exit(1);
  }
}

// Start only if run directly
if (require.main === module) {
  startServer();
}

module.exports = app;
