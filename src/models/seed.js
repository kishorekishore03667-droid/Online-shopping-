const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { db, query } = require('../config/database');

async function seedDatabase() {
  console.log('--- Initializing Kishore Kumar Mart Database ---');

  // 1. Execute schema.sql
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await query.exec(schemaSql);
  console.log('Schema tables created / verified successfully.');

  // Check if already seeded
  const existingUsers = await query.get('SELECT COUNT(*) as count FROM users');
  if (existingUsers.count > 0) {
    console.log(`Database already has ${existingUsers.count} users. Skipping default seeding.`);
    return;
  }

  console.log('Seeding initial data...');

  // 2. Seed Users
  const adminHash = await bcrypt.hash('admin123', 10);
  const customerHash = await bcrypt.hash('customer123', 10);

  const adminResult = await query.run(
    `INSERT INTO users (full_name, email, password_hash, phone, address, role)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['Kishore Kumar (Store Admin)', 'admin@kishorekumarmart.com', adminHash, '+91 98765 43210', '124 Supermarket Road, Commerce Complex, Trichy', 'admin']
  );

  const customerResult = await query.run(
    `INSERT INTO users (full_name, email, password_hash, phone, address, role)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['Rahul Sharma', 'customer@example.com', customerHash, '+91 91234 56789', '45 Gandhi Nagar 2nd Street, KK Nagar, Trichy - 620021', 'customer']
  );

  // 3. Seed Categories
  const categories = [
    { name: 'Fruits & Vegetables', slug: 'fruits-vegetables', icon: '🍎', description: 'Fresh farm-picked fruits and organic greens' },
    { name: 'Dairy & Bakery', slug: 'dairy-bakery', icon: '🥛', description: 'Fresh milk, butter, cheese, eggs and artisan bread' },
    { name: 'Foodgrains, Oil & Masala', slug: 'foodgrains-oil-masala', icon: '🌾', description: 'Premium rice, pulses, flour, edible oils and aromatic spices' },
    { name: 'Snacks & Beverages', slug: 'snacks-beverages', icon: '🍪', description: 'Crisps, biscuits, juices, tea, coffee and cold drinks' },
    { name: 'Cleaning & Household', slug: 'cleaning-household', icon: '🧼', description: 'Detergents, floor cleaners, dishwash and home care' },
    { name: 'Personal Care', slug: 'personal-care', icon: '🧴', description: 'Soaps, shampoos, oral care and skincare essentials' }
  ];

  const categoryIdMap = {};
  for (const cat of categories) {
    const res = await query.run(
      `INSERT INTO categories (name, slug, icon, description, is_active) VALUES (?, ?, ?, ?, 1)`,
      [cat.name, cat.slug, cat.icon, cat.description]
    );
    categoryIdMap[cat.slug] = res.lastID;
  }

  // 4. Seed Products
  const products = [
    // Fruits & Vegetables
    {
      category: 'fruits-vegetables',
      name: 'Fresh Alphonso Mangoes',
      slug: 'fresh-alphonso-mangoes',
      description: 'Handpicked sweet naturally ripened Alphonso mangoes from Ratnagiri.',
      unit: '1 kg (approx. 4-5 pcs)',
      price: 240,
      discount_price: 199,
      stock: 45,
      image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=500&q=80',
      rating: 4.8,
      reviews_count: 24,
      featured: 1
    },
    {
      category: 'fruits-vegetables',
      name: 'Farm Fresh Red Tomatoes',
      slug: 'farm-fresh-red-tomatoes',
      description: 'Locally grown firm and juicy red salad tomatoes.',
      unit: '1 kg',
      price: 45,
      discount_price: 36,
      stock: 120,
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=80',
      rating: 4.6,
      reviews_count: 18,
      featured: 1
    },
    {
      category: 'fruits-vegetables',
      name: 'Organic Red Onions',
      slug: 'organic-red-onions',
      description: 'Premium quality pungent red onions for everyday cooking.',
      unit: '2 kg pack',
      price: 90,
      discount_price: 75,
      stock: 80,
      image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=500&q=80',
      rating: 4.5,
      reviews_count: 12,
      featured: 0
    },
    {
      category: 'fruits-vegetables',
      name: 'Shimla Fresh Apples',
      slug: 'shimla-fresh-apples',
      description: 'Crisp, juicy and sweet Shimla apples rich in antioxidants.',
      unit: '1 kg (approx. 4 pcs)',
      price: 180,
      discount_price: 155,
      stock: 60,
      image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=500&q=80',
      rating: 4.7,
      reviews_count: 31,
      featured: 1
    },
    {
      category: 'fruits-vegetables',
      name: 'Fresh Green Spinach (Palak)',
      slug: 'fresh-green-spinach-palak',
      description: 'Tender and pesticide-free hydroponic green spinach leaves.',
      unit: '250 g bunch',
      price: 30,
      discount_price: 22,
      stock: 35,
      image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=500&q=80',
      rating: 4.4,
      reviews_count: 9,
      featured: 0
    },

    // Dairy & Bakery
    {
      category: 'dairy-bakery',
      name: 'Farm Pure Cow Milk',
      slug: 'farm-pure-cow-milk',
      description: 'Pasteurized homogenized full-cream fresh cow milk.',
      unit: '1 Litre Pouch',
      price: 68,
      discount_price: 64,
      stock: 150,
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=500&q=80',
      rating: 4.9,
      reviews_count: 42,
      featured: 1
    },
    {
      category: 'dairy-bakery',
      name: 'Amul Salted Butter',
      slug: 'amul-salted-butter',
      description: 'Utterly butterly delicious creamy salted butter.',
      unit: '500 g Pack',
      price: 275,
      discount_price: 260,
      stock: 90,
      image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=500&q=80',
      rating: 4.9,
      reviews_count: 55,
      featured: 1
    },
    {
      category: 'dairy-bakery',
      name: 'Whole Wheat Brown Bread',
      slug: 'whole-wheat-brown-bread',
      description: 'Freshly baked 100% whole wheat fiber-rich bread loaf.',
      unit: '400 g Pack',
      price: 55,
      discount_price: 48,
      stock: 40,
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80',
      rating: 4.6,
      reviews_count: 16,
      featured: 0
    },
    {
      category: 'dairy-bakery',
      name: 'Fresh Paneer (Cottage Cheese)',
      slug: 'fresh-paneer-cottage-cheese',
      description: 'Soft, melt-in-the-mouth traditional malai paneer.',
      unit: '200 g Pack',
      price: 110,
      discount_price: 98,
      stock: 50,
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=500&q=80',
      rating: 4.8,
      reviews_count: 27,
      featured: 1
    },
    {
      category: 'dairy-bakery',
      name: 'Organic Farm Brown Eggs',
      slug: 'organic-farm-brown-eggs',
      description: 'Protein-packed free-range brown eggs.',
      unit: 'Pack of 12 pcs',
      price: 120,
      discount_price: 105,
      stock: 75,
      image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=500&q=80',
      rating: 4.7,
      reviews_count: 19,
      featured: 0
    },

    // Foodgrains, Oil & Masala
    {
      category: 'foodgrains-oil-masala',
      name: 'Royal Basmati Rice',
      slug: 'royal-basmati-rice',
      description: 'Aged long-grain fragrant premium Basmati rice.',
      unit: '5 kg Bag',
      price: 650,
      discount_price: 549,
      stock: 65,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80',
      rating: 4.8,
      reviews_count: 38,
      featured: 1
    },
    {
      category: 'foodgrains-oil-masala',
      name: 'Fortune Sunlite Sunflower Oil',
      slug: 'fortune-sunlite-sunflower-oil',
      description: 'Refined sunflower cooking oil enriched with Vitamins A & D.',
      unit: '1 Litre Pouch',
      price: 165,
      discount_price: 142,
      stock: 110,
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=500&q=80',
      rating: 4.7,
      reviews_count: 45,
      featured: 1
    },
    {
      category: 'foodgrains-oil-masala',
      name: 'Aashirvaad Shuddh Chakki Atta',
      slug: 'aashirvaad-shuddh-chakki-atta',
      description: '100% whole wheat flour for soft and fluffy rotis.',
      unit: '5 kg Bag',
      price: 275,
      discount_price: 245,
      stock: 85,
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80',
      rating: 4.9,
      reviews_count: 62,
      featured: 1
    },
    {
      category: 'foodgrains-oil-masala',
      name: 'Tata Sampann Toor Dal',
      slug: 'tata-sampann-toor-dal',
      description: 'Unpolished protein-rich toor dal with natural nutrients intact.',
      unit: '1 kg Pack',
      price: 185,
      discount_price: 160,
      stock: 70,
      image: 'https://images.unsplash.com/photo-1585994192701-f1a505c817ea?auto=format&fit=crop&w=500&q=80',
      rating: 4.6,
      reviews_count: 22,
      featured: 0
    },
    {
      category: 'foodgrains-oil-masala',
      name: 'Everest Garam Masala Powder',
      slug: 'everest-garam-masala-powder',
      description: 'Authentic spice blend offering authentic aroma and richness.',
      unit: '100 g Box',
      price: 95,
      discount_price: 85,
      stock: 95,
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=500&q=80',
      rating: 4.8,
      reviews_count: 29,
      featured: 0
    },

    // Snacks & Beverages
    {
      category: 'snacks-beverages',
      name: 'Tata Tea Gold Leaf Tea',
      slug: 'tata-tea-gold-leaf-tea',
      description: 'Fine blend of CTC teas with gently rolled long leaves for rich aroma.',
      unit: '500 g Pack',
      price: 330,
      discount_price: 289,
      stock: 80,
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=500&q=80',
      rating: 4.8,
      reviews_count: 48,
      featured: 1
    },
    {
      category: 'snacks-beverages',
      name: 'Nescafe Classic Instant Coffee',
      slug: 'nescafe-classic-instant-coffee',
      description: '100% pure coffee granules for rich tasting frothy coffee.',
      unit: '100 g Jar',
      price: 290,
      discount_price: 255,
      stock: 65,
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80',
      rating: 4.7,
      reviews_count: 34,
      featured: 1
    },
    {
      category: 'snacks-beverages',
      name: 'Lay\'s Classic Salted Potato Chips',
      slug: 'lays-classic-salted-potato-chips',
      description: 'Crispy wafer-thin potato chips sprinkled with light sea salt.',
      unit: '115 g Party Pack',
      price: 50,
      discount_price: 45,
      stock: 140,
      image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=500&q=80',
      rating: 4.5,
      reviews_count: 21,
      featured: 0
    },
    {
      category: 'snacks-beverages',
      name: 'Real Fruit Power Mixed Fruit Juice',
      slug: 'real-fruit-power-mixed-fruit-juice',
      description: 'Goodness of 9 handpicked fruits with no added preservatives.',
      unit: '1 Litre Tetrapack',
      price: 130,
      discount_price: 110,
      stock: 90,
      image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=500&q=80',
      rating: 4.6,
      reviews_count: 27,
      featured: 1
    },

    // Cleaning & Household
    {
      category: 'cleaning-household',
      name: 'Surf Excel Matic Top Load Detergent',
      slug: 'surf-excel-matic-top-load-detergent',
      description: 'Superior stain removal formulation designed for washing machines.',
      unit: '2 kg Pack',
      price: 460,
      discount_price: 399,
      stock: 55,
      image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=500&q=80',
      rating: 4.9,
      reviews_count: 51,
      featured: 1
    },
    {
      category: 'cleaning-household',
      name: 'Vim Lemon Dishwash Gel',
      slug: 'vim-lemon-dishwash-gel',
      description: 'Concentrated gel with the power of 100 lemons for sparkling utensils.',
      unit: '750 ml Bottle',
      price: 195,
      discount_price: 165,
      stock: 75,
      image: 'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?auto=format&fit=crop&w=500&q=80',
      rating: 4.7,
      reviews_count: 32,
      featured: 0
    },
    {
      category: 'cleaning-household',
      name: 'Lizol Citrus Floor Cleaner',
      slug: 'lizol-citrus-floor-cleaner',
      description: 'Kills 99.9% germs and leaves 10x better fragrance.',
      unit: '1 Litre Bottle',
      price: 215,
      discount_price: 185,
      stock: 80,
      image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=500&q=80',
      rating: 4.8,
      reviews_count: 39,
      featured: 1
    },

    // Personal Care
    {
      category: 'personal-care',
      name: 'Dettol Original Germ Protection Soap',
      slug: 'dettol-original-germ-protection-soap',
      description: 'Trusted antibacterial soap bars for daily hygienic protection.',
      unit: 'Pack of 4 (125 g each)',
      price: 199,
      discount_price: 175,
      stock: 100,
      image: 'https://images.unsplash.com/photo-1607006314592-12797e8876e5?auto=format&fit=crop&w=500&q=80',
      rating: 4.8,
      reviews_count: 44,
      featured: 1
    },
    {
      category: 'personal-care',
      name: 'Colgate Strong Teeth Toothpaste',
      slug: 'colgate-strong-teeth-toothpaste',
      description: 'Cavity protection with amino power for 2x stronger teeth.',
      unit: '500 g Value Saver Pack',
      price: 270,
      discount_price: 229,
      stock: 90,
      image: 'https://images.unsplash.com/photo-1559591937-e62fb3d8d06c?auto=format&fit=crop&w=500&q=80',
      rating: 4.7,
      reviews_count: 36,
      featured: 0
    },
    {
      category: 'personal-care',
      name: 'Dove Intense Repair Shampoo',
      slug: 'dove-intense-repair-shampoo',
      description: 'Nourishing keratin actives restore hair strength from root to tip.',
      unit: '650 ml Pump Bottle',
      price: 525,
      discount_price: 439,
      stock: 45,
      image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=500&q=80',
      rating: 4.8,
      reviews_count: 28,
      featured: 1
    }
  ];

  const productIdMap = {};
  for (const prod of products) {
    const categoryId = categoryIdMap[prod.category];
    const res = await query.run(
      `INSERT INTO products (
        category_id, name, slug, description, unit, price, discount_price, stock_quantity,
        image_url, rating, reviews_count, is_featured, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        categoryId,
        prod.name,
        prod.slug,
        prod.description,
        prod.unit,
        prod.price,
        prod.discount_price,
        prod.stock,
        prod.image,
        prod.rating,
        prod.reviews_count,
        prod.featured
      ]
    );
    productIdMap[prod.slug] = res.lastID;
  }

  // 5. Seed Coupons
  const coupons = [
    { code: 'WELCOME10', discount_percent: 10, max_discount: 100, min_order: 300 },
    { code: 'MART20', discount_percent: 20, max_discount: 150, min_order: 500 },
    { code: 'SUPER50', discount_percent: 15, max_discount: 50, min_order: 250 },
    { code: 'FREESHIP', discount_percent: 10, max_discount: 40, min_order: 200 }
  ];

  for (const c of coupons) {
    await query.run(
      `INSERT INTO coupons (code, discount_percent, max_discount, min_order_amount, is_active)
       VALUES (?, ?, ?, ?, 1)`,
      [c.code, c.discount_percent, c.max_discount, c.min_order]
    );
  }

  // 6. Seed Sample Cart Items for Rahul Sharma
  const mangoId = productIdMap['fresh-alphonso-mangoes'];
  const milkId = productIdMap['farm-pure-cow-milk'];
  const riceId = productIdMap['royal-basmati-rice'];

  if (mangoId && customerResult.lastID) {
    await query.run(
      `INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)`,
      [customerResult.lastID, mangoId, 2]
    );
    await query.run(
      `INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)`,
      [customerResult.lastID, milkId, 3]
    );
  }

  // 7. Seed Sample Wishlist
  if (riceId && customerResult.lastID) {
    await query.run(
      `INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)`,
      [customerResult.lastID, riceId]
    );
  }

  // 8. Seed Sample Order
  const orderNumber = 'KKM-' + Date.now().toString().slice(-6);
  const sampleOrder = await query.run(
    `INSERT INTO orders (
      order_number, user_id, total_amount, discount_amount, delivery_fee, final_amount,
      coupon_code, customer_name, customer_phone, delivery_address, delivery_slot,
      payment_method, payment_status, order_status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      orderNumber,
      customerResult.lastID,
      894,
      89.4,
      0,
      804.6,
      'WELCOME10',
      'Rahul Sharma',
      '+91 91234 56789',
      '45 Gandhi Nagar 2nd Street, KK Nagar, Trichy - 620021',
      'Morning (7:00 AM - 10:00 AM)',
      'upi',
      'Paid',
      'Out for Delivery',
      'Please leave at the doorstep'
    ]
  );

  if (sampleOrder.lastID) {
    await query.run(
      `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [sampleOrder.lastID, mangoId, 'Fresh Alphonso Mangoes', 199, 2, 398]
    );
    await query.run(
      `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [sampleOrder.lastID, milkId, 'Farm Pure Cow Milk', 64, 3, 192]
    );
    await query.run(
      `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [sampleOrder.lastID, productIdMap['surf-excel-matic-top-load-detergent'], 'Surf Excel Matic Top Load Detergent', 399, 1, 399]
    );
  }

  // 9. Seed Sample Reviews
  if (mangoId && customerResult.lastID) {
    await query.run(
      `INSERT INTO reviews (product_id, user_id, user_name, rating, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [mangoId, customerResult.lastID, 'Rahul Sharma', 5, 'Super fresh and sweet mangoes! Delivery was right on time before 9 AM. Highly recommend Kishore Kumar Mart!']
    );
  }

  console.log('Database seeded successfully!');
  console.log('Default Admin: admin@kishorekumarmart.com / admin123');
  console.log('Default Customer: customer@example.com / customer123');
}

// Allow direct CLI execution
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
