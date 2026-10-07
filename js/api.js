// ===================================================
// Kishore Kumar Mart - API Client Wrapper (With Netlify Static Fallback)
// ===================================================

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Fruits & Vegetables', slug: 'fruits-vegetables', icon: '🍎', description: 'Fresh farm fruits & vegetables' },
  { id: 2, name: 'Dairy & Bakery', slug: 'dairy-bakery', icon: '🥛', description: 'Fresh milk, butter & bread' },
  { id: 3, name: 'Foodgrains, Oil & Masala', slug: 'foodgrains-oil-masala', icon: '🌾', description: 'Staples, rice & oils' },
  { id: 4, name: 'Snacks & Beverages', slug: 'snacks-beverages', icon: '🍪', description: 'Biscuits, chips & drinks' },
  { id: 5, name: 'Cleaning & Household', slug: 'cleaning-household', icon: '🧼', description: 'Detergents & home hygiene' },
  { id: 6, name: 'Personal Care', slug: 'personal-care', icon: '🧴', description: 'Soaps, shampoo & dental care' }
];

const DEFAULT_PRODUCTS = [
  { id: 1, category_id: 1, category_name: 'Fruits & Vegetables', name: 'Fresh Alphonso Mangoes', slug: 'fresh-alphonso-mangoes', unit: '1 kg (approx. 4-5 pcs)', price: 240, discount_price: 199, stock_quantity: 45, image_url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=500&q=80', rating: 4.8, reviews_count: 24, is_featured: 1, is_active: 1, description: 'Handpicked sweet naturally ripened Alphonso mangoes from Ratnagiri.' },
  { id: 2, category_id: 1, category_name: 'Fruits & Vegetables', name: 'Farm Fresh Red Tomatoes', slug: 'farm-fresh-red-tomatoes', unit: '1 kg', price: 45, discount_price: 36, stock_quantity: 120, image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=80', rating: 4.6, reviews_count: 18, is_featured: 1, is_active: 1, description: 'Locally grown firm and juicy red salad tomatoes.' },
  { id: 3, category_id: 1, category_name: 'Fruits & Vegetables', name: 'Organic Red Onions', slug: 'organic-red-onions', unit: '2 kg pack', price: 90, discount_price: 75, stock_quantity: 80, image_url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=500&q=80', rating: 4.5, reviews_count: 12, is_featured: 0, is_active: 1, description: 'Premium quality pungent red onions for everyday cooking.' },
  { id: 4, category_id: 1, category_name: 'Fruits & Vegetables', name: 'Shimla Fresh Apples', slug: 'shimla-fresh-apples', unit: '1 kg (approx. 4 pcs)', price: 180, discount_price: 155, stock_quantity: 60, image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=500&q=80', rating: 4.7, reviews_count: 31, is_featured: 1, is_active: 1, description: 'Crisp, juicy and sweet Shimla apples rich in antioxidants.' },
  { id: 5, category_id: 2, category_name: 'Dairy & Bakery', name: 'Farm Pure Cow Milk', slug: 'farm-pure-cow-milk', unit: '1 Litre Pouch', price: 68, discount_price: 64, stock_quantity: 150, image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=500&q=80', rating: 4.9, reviews_count: 42, is_featured: 1, is_active: 1, description: 'Pasteurized homogenized full-cream fresh cow milk.' },
  { id: 6, category_id: 2, category_name: 'Dairy & Bakery', name: 'Amul Salted Butter', slug: 'amul-salted-butter', unit: '500 g Pack', price: 275, discount_price: 260, stock_quantity: 90, image_url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=500&q=80', rating: 4.9, reviews_count: 55, is_featured: 1, is_active: 1, description: 'Utterly butterly delicious creamy salted butter.' },
  { id: 7, category_id: 2, category_name: 'Dairy & Bakery', name: 'Whole Wheat Brown Bread', slug: 'whole-wheat-brown-bread', unit: '400 g Pack', price: 55, discount_price: 48, stock_quantity: 40, image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80', rating: 4.6, reviews_count: 16, is_featured: 0, is_active: 1, description: 'Freshly baked 100% whole wheat fiber-rich bread loaf.' },
  { id: 8, category_id: 3, category_name: 'Foodgrains, Oil & Masala', name: 'Royal Basmati Rice', slug: 'royal-basmati-rice', unit: '5 kg Bag', price: 650, discount_price: 549, stock_quantity: 65, image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80', rating: 4.8, reviews_count: 38, is_featured: 1, is_active: 1, description: 'Aged long-grain fragrant premium Basmati rice.' },
  { id: 9, category_id: 3, category_name: 'Foodgrains, Oil & Masala', name: 'Fortune Sunlite Sunflower Oil', slug: 'fortune-sunlite-sunflower-oil', unit: '1 Litre Pouch', price: 165, discount_price: 142, stock_quantity: 110, image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=500&q=80', rating: 4.7, reviews_count: 45, is_featured: 1, is_active: 1, description: 'Refined sunflower cooking oil enriched with Vitamins A & D.' },
  { id: 10, category_id: 4, category_name: 'Snacks & Beverages', name: 'Tata Tea Gold Leaf Tea', slug: 'tata-tea-gold-leaf-tea', unit: '500 g Pack', price: 330, discount_price: 289, stock_quantity: 80, image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=500&q=80', rating: 4.8, reviews_count: 48, is_featured: 1, is_active: 1, description: 'Fine blend of CTC teas with gently rolled long leaves for rich aroma.' },
  { id: 11, category_id: 4, category_name: 'Snacks & Beverages', name: 'Nescafe Classic Instant Coffee', slug: 'nescafe-classic-instant-coffee', unit: '100 g Jar', price: 290, discount_price: 255, stock_quantity: 65, image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80', rating: 4.7, reviews_count: 34, is_featured: 1, is_active: 1, description: '100% pure coffee granules for rich tasting frothy coffee.' },
  { id: 12, category_id: 5, category_name: 'Cleaning & Household', name: 'Surf Excel Matic Detergent', slug: 'surf-excel-matic-top-load-detergent', unit: '2 kg Pack', price: 460, discount_price: 399, stock_quantity: 55, image_url: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=500&q=80', rating: 4.9, reviews_count: 51, is_featured: 1, is_active: 1, description: 'Superior stain removal formulation designed for washing machines.' },
  { id: 13, category_id: 6, category_name: 'Personal Care', name: 'Dettol Germ Protection Soap', slug: 'dettol-original-germ-protection-soap', unit: 'Pack of 4', price: 199, discount_price: 175, stock_quantity: 100, image_url: 'https://images.unsplash.com/photo-1607006314592-12797e8876e5?auto=format&fit=crop&w=500&q=80', rating: 4.8, reviews_count: 44, is_featured: 1, is_active: 1, description: 'Trusted antibacterial soap bars for daily hygienic protection.' }
];

const API = {
  baseUrl: '/api',

  getToken() {
    return localStorage.getItem('kkm_token');
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('kkm_token', token);
    } else {
      localStorage.removeItem('kkm_token');
    }
  },

  getUser() {
    const userStr = localStorage.getItem('kkm_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  setUser(user) {
    if (user) {
      localStorage.setItem('kkm_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('kkm_user');
    }
  },

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });
      
      // If server returned 404 on Netlify static deploy, fallback to Client Data Engine
      if (response.status === 404 || response.status === 502) {
        return this.clientFallback(endpoint, options);
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }
      return data;
    } catch (err) {
      // If network fails (e.g. pure static Netlify Drop without Node backend running)
      return this.clientFallback(endpoint, options);
    }
  },

  // CLIENT DATA ENGINE (For 100% static hosts like Netlify Drop / GitHub Pages)
  clientFallback(endpoint, options) {
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body) : {};

    // 1. Categories
    if (endpoint.startsWith('/categories')) {
      return { success: true, data: DEFAULT_CATEGORIES };
    }

    // 2. Products
    if (endpoint.startsWith('/products')) {
      let products = JSON.parse(localStorage.getItem('kkm_products')) || DEFAULT_PRODUCTS;
      
      if (endpoint.includes('/detail/')) {
        const id = Number(endpoint.split('/detail/')[1]);
        const p = products.find(x => x.id === id) || products[0];
        return { success: true, data: p };
      }

      // Filter query params
      const [path, queryStr] = endpoint.split('?');
      if (queryStr) {
        const params = new URLSearchParams(queryStr);
        const cat = params.get('category');
        const search = params.get('search');
        if (cat) products = products.filter(p => p.slug === cat || (p.category_name && p.category_name.toLowerCase().includes(cat.toLowerCase())));
        if (search) products = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
      }

      return { success: true, data: products };
    }

    // 3. Cart
    if (endpoint.startsWith('/cart')) {
      let cart = JSON.parse(localStorage.getItem('kkm_cart')) || [];
      const products = JSON.parse(localStorage.getItem('kkm_products')) || DEFAULT_PRODUCTS;

      if (method === 'POST' && endpoint.includes('/add')) {
        const prod = products.find(p => p.id === Number(body.productId));
        const existing = cart.find(c => c.product_id === Number(body.productId));
        if (existing) {
          existing.quantity += Number(body.quantity || 1);
        } else if (prod) {
          cart.push({
            id: Date.now(),
            product_id: prod.id,
            name: prod.name,
            effective_price: prod.discount_price || prod.price,
            unit: prod.unit,
            image_url: prod.image_url,
            quantity: Number(body.quantity || 1),
            subtotal: (prod.discount_price || prod.price) * (body.quantity || 1)
          });
        }
        localStorage.setItem('kkm_cart', JSON.stringify(cart));
      } else if (method === 'PUT' && endpoint.includes('/update')) {
        const idx = cart.findIndex(c => c.product_id === Number(body.productId));
        if (idx !== -1) {
          if (body.quantity <= 0) cart.splice(idx, 1);
          else {
            cart[idx].quantity = Number(body.quantity);
            cart[idx].subtotal = cart[idx].quantity * cart[idx].effective_price;
          }
        }
        localStorage.setItem('kkm_cart', JSON.stringify(cart));
      } else if (method === 'DELETE' && endpoint.includes('/remove/')) {
        const pid = Number(endpoint.split('/remove/')[1]);
        cart = cart.filter(c => c.product_id !== pid);
        localStorage.setItem('kkm_cart', JSON.stringify(cart));
      }

      let subtotal = 0;
      let count = 0;
      cart.forEach(i => {
        subtotal += (i.effective_price * i.quantity);
        count += i.quantity;
      });

      return {
        success: true,
        message: 'Cart updated',
        data: {
          items: cart,
          itemCount: count,
          subtotal: Math.round(subtotal * 100) / 100,
          deliveryFee: subtotal >= 499 || subtotal === 0 ? 0 : 40
        }
      };
    }

    // 4. Coupons
    if (endpoint.startsWith('/coupons/apply')) {
      const code = (body.code || '').toUpperCase();
      if (code === 'WELCOME10') return { success: true, message: 'WELCOME10 applied (10% off)!', data: { code, discountAmount: 50 } };
      if (code === 'MART20') return { success: true, message: 'MART20 applied (20% off)!', data: { code, discountAmount: 80 } };
      return { success: true, message: 'Coupon applied!', data: { code, discountAmount: 40 } };
    }

    // 5. Checkout & Orders
    if (endpoint.startsWith('/orders')) {
      let orders = JSON.parse(localStorage.getItem('kkm_orders')) || [
        {
          id: 1,
          order_number: 'KKM-748921',
          final_amount: 804.60,
          order_status: 'Out for Delivery',
          created_at: new Date().toISOString(),
          delivery_address: '45 Gandhi Nagar, KK Nagar, Trichy',
          delivery_slot: 'Morning (7:00 AM - 10:00 AM)',
          payment_method: 'UPI',
          payment_status: 'Paid',
          items: [
            { product_name: 'Fresh Alphonso Mangoes', quantity: 2, subtotal: 398 },
            { product_name: 'Farm Pure Cow Milk', quantity: 3, subtotal: 192 }
          ]
        }
      ];

      if (method === 'POST' && endpoint.includes('/checkout')) {
        const cart = JSON.parse(localStorage.getItem('kkm_cart')) || [];
        const newOrder = {
          id: Date.now(),
          order_number: 'KKM-' + Date.now().toString().slice(-6),
          final_amount: 540,
          order_status: 'Placed',
          created_at: new Date().toISOString(),
          customer_name: body.customerName,
          customer_phone: body.customerPhone,
          delivery_address: body.deliveryAddress,
          delivery_slot: body.deliverySlot,
          payment_method: (body.paymentMethod || 'cod').toUpperCase(),
          payment_status: body.paymentMethod === 'cod' ? 'Pending' : 'Paid',
          items: cart.length > 0 ? cart.map(i => ({ product_name: i.name, quantity: i.quantity, subtotal: i.subtotal })) : [{ product_name: 'Fresh Farm Produce', quantity: 1, subtotal: 540 }]
        };
        orders.unshift(newOrder);
        localStorage.setItem('kkm_orders', JSON.stringify(orders));
        localStorage.removeItem('kkm_cart');
        return { success: true, message: 'Order placed successfully!', data: { order: newOrder } };
      }

      if (endpoint.includes('/track/')) {
        const num = endpoint.split('/track/')[1];
        const match = orders.find(o => o.order_number === num) || orders[0];
        return { success: true, data: { order: match } };
      }

      return { success: true, data: orders };
    }

    // 6. Wishlist
    if (endpoint.startsWith('/wishlist')) {
      let wish = JSON.parse(localStorage.getItem('kkm_wishlist')) || [];
      if (method === 'POST') {
        const pid = Number(body.productId);
        const idx = wish.findIndex(x => x.id === pid);
        if (idx !== -1) {
          wish.splice(idx, 1);
          localStorage.setItem('kkm_wishlist', JSON.stringify(wish));
          return { success: true, message: 'Removed from wishlist', data: { added: false, items: wish } };
        } else {
          const p = DEFAULT_PRODUCTS.find(x => x.id === pid) || { id: pid, name: 'Product', price: 99 };
          wish.push(p);
          localStorage.setItem('kkm_wishlist', JSON.stringify(wish));
          return { success: true, message: 'Added to wishlist', data: { added: true, items: wish } };
        }
      }
      return { success: true, data: wish };
    }

    // 7. Auth
    if (endpoint.startsWith('/auth')) {
      const user = { id: 1, full_name: 'Kishore Kumar', email: body.email || 'customer@example.com', role: (body.email && body.email.includes('admin')) ? 'admin' : 'customer' };
      return { success: true, message: 'Logged in successfully', data: { user, token: 'mock-jwt-token-kkm-2026' } };
    }

    // 8. Admin Stats
    if (endpoint.startsWith('/admin')) {
      return {
        success: true,
        data: {
          metrics: { totalRevenue: 14250, totalOrders: 28, pendingOrders: 4, totalProducts: 13, lowStockProducts: 2, totalCustomers: 18 },
          recentOrders: [],
          products: DEFAULT_PRODUCTS,
          users: []
        }
      };
    }

    return { success: true, data: [] };
  },

  get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    return this.request(url, { method: 'GET' });
  },

  post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  put(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};
