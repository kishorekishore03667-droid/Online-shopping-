const http = require('http');
const app = require('../server');

let server;
const PORT = 3055; // dedicated test port
let customerToken = '';
let adminToken = '';
let sampleOrderId = null;
let sampleOrderNumber = '';
let testProductId = null;

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request({ ...options, port: PORT, host: '127.0.0.1' }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING KISHORE KUMAR MART AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(title, condition, extra = '') {
    if (condition) {
      console.log(`✅ PASS: ${title} ${extra}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${title} ${extra}`);
      failed++;
    }
  }

  // 1. Health check
  try {
    const res = await request({ path: '/api/health', method: 'GET' });
    assert('API Health Check', res.status === 200 && res.data.status === 'online');
  } catch (e) {
    assert('API Health Check', false, e.message);
  }

  // 2. Admin Login
  try {
    const res = await request({
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@kishorekumarmart.com', password: 'admin123' });
    adminToken = res.data.data?.token;
    assert('Admin Authentication', res.status === 200 && !!adminToken, `(Role: ${res.data.data?.user?.role})`);
  } catch (e) {
    assert('Admin Authentication', false, e.message);
  }

  // 3. Customer Login
  try {
    const res = await request({
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'customer@example.com', password: 'customer123' });
    customerToken = res.data.data?.token;
    assert('Customer Authentication', res.status === 200 && !!customerToken, `(User: ${res.data.data?.user?.full_name})`);
  } catch (e) {
    assert('Customer Authentication', false, e.message);
  }

  // 4. Categories Listing
  try {
    const res = await request({ path: '/api/categories', method: 'GET' });
    assert('Category Catalog Fetch', res.status === 200 && res.data.data.length >= 6, `(${res.data.data.length} categories found)`);
  } catch (e) {
    assert('Category Catalog Fetch', false, e.message);
  }

  // 5. Products Listing and Search
  try {
    const res = await request({ path: '/api/products?search=mango', method: 'GET' });
    testProductId = res.data.data[0]?.id;
    assert('Product Search & Filter', res.status === 200 && res.data.data.length > 0, `(Found: ${res.data.data[0]?.name})`);
  } catch (e) {
    assert('Product Search & Filter', false, e.message);
  }

  // 6. Add Item to Cart
  try {
    const res = await request({
      path: '/api/cart/add',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      }
    }, { productId: testProductId, quantity: 2 });
    assert('Add Item to Shopping Cart', res.status === 200 && res.data.data.itemCount >= 2);
  } catch (e) {
    assert('Add Item to Shopping Cart', false, e.message);
  }

  // 7. Apply Promo Coupon
  try {
    const res = await request({
      path: '/api/coupons/apply',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      }
    }, { code: 'WELCOME10' });
    assert('Coupon Code Validation & Discount', res.status === 200 && res.data.data.discountAmount > 0, `(Saved: ₹${res.data.data.discountAmount})`);
  } catch (e) {
    assert('Coupon Code Validation & Discount', false, e.message);
  }

  // 8. Wishlist Toggle
  try {
    const res = await request({
      path: '/api/wishlist/toggle',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      }
    }, { productId: testProductId });
    assert('Wishlist Toggle', res.status === 200 && res.data.success);
  } catch (e) {
    assert('Wishlist Toggle', false, e.message);
  }

  // 9. Checkout & Order Placement
  try {
    const res = await request({
      path: '/api/orders/checkout',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      }
    }, {
      customerName: 'Rahul Sharma',
      customerPhone: '+91 91234 56789',
      deliveryAddress: '45 Gandhi Nagar, Trichy',
      deliverySlot: 'Morning (7:00 AM - 10:00 AM)',
      paymentMethod: 'cod',
      couponCode: 'WELCOME10'
    });
    sampleOrderId = res.data.data?.order?.id;
    sampleOrderNumber = res.data.data?.order?.order_number;
    assert('Checkout & Order Placement', res.status === 201 && !!sampleOrderNumber, `(Order #${sampleOrderNumber})`);
  } catch (e) {
    assert('Checkout & Order Placement', false, e.message);
  }

  // 10. Order Tracking
  try {
    const res = await request({ path: `/api/orders/track/${sampleOrderNumber}`, method: 'GET' });
    assert('Public Order Tracking', res.status === 200 && res.data.data.order.order_status === 'Placed');
  } catch (e) {
    assert('Public Order Tracking', false, e.message);
  }

  // 11. Add Review & Aggregate Rating
  try {
    const res = await request({
      path: '/api/reviews/add',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      }
    }, {
      productId: testProductId,
      rating: 5,
      comment: 'Exceptional freshness and fast delivery!'
    });
    assert('Customer Review & Rating Aggregation', res.status === 201 && res.data.data.product.reviews_count >= 1);
  } catch (e) {
    assert('Customer Review & Rating Aggregation', false, e.message);
  }

  // 12. Admin Dashboard Stats & Metrics
  try {
    const res = await request({
      path: '/api/admin/stats',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert('Admin Dashboard Metrics Authorization', res.status === 200 && res.data.data.metrics.totalOrders >= 1, `(Revenue: ₹${res.data.data.metrics.totalRevenue})`);
  } catch (e) {
    assert('Admin Dashboard Metrics Authorization', false, e.message);
  }

  // 13. Admin Update Order Status
  try {
    const res = await request({
      path: `/api/admin/orders/${sampleOrderId}/status`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, { orderStatus: 'Delivered' });
    assert('Admin Order Lifecycle Status Update', res.status === 200 && res.data.data.order_status === 'Delivered');
  } catch (e) {
    assert('Admin Order Lifecycle Status Update', false, e.message);
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================\n');

  if (server) server.close();
  process.exit(failed > 0 ? 1 : 0);
}

// Start test server
server = app.listen(PORT, '127.0.0.1', () => {
  runTests();
});
