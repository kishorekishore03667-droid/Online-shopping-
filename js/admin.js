// ===================================================
// Kishore Kumar Mart - Admin Dashboard Management Portal
// ===================================================

const Admin = {
  currentTab: 'overview',
  categories: [],

  async init() {
    if (!Auth.isLoggedIn() || !Auth.isAdmin()) {
      alert('Access restricted. Please sign in as an Administrator.');
      window.location.href = '/index.html';
      return;
    }

    this.bindEvents();
    await this.loadCategories();
    this.switchTab('overview');
  },

  bindEvents() {
    // Tab switching
    document.querySelectorAll('.admin-nav-item').forEach(item => {
      item.onclick = () => {
        const tab = item.getAttribute('data-tab');
        if (tab) this.switchTab(tab);
      };
    });

    // Product Modal Form
    const productForm = document.getElementById('admin-product-form');
    if (productForm) {
      productForm.onsubmit = async (e) => {
        e.preventDefault();
        await this.saveProduct();
      };
    }

    // Coupon Modal Form
    const couponForm = document.getElementById('admin-coupon-form');
    if (couponForm) {
      couponForm.onsubmit = async (e) => {
        e.preventDefault();
        await this.saveCoupon();
      };
    }
  },

  switchTab(tab) {
    this.currentTab = tab;

    // Update active nav item
    document.querySelectorAll('.admin-nav-item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-tab') === tab);
    });

    // Hide all tab panels
    document.querySelectorAll('.admin-tab-panel').forEach(panel => {
      panel.style.display = 'none';
    });

    // Show target tab panel
    const targetPanel = document.getElementById(`tab-${tab}`);
    if (targetPanel) {
      targetPanel.style.display = 'block';
    }

    // Load tab data
    switch (tab) {
      case 'overview':
        this.loadDashboardStats();
        break;
      case 'products':
        this.loadProducts();
        break;
      case 'orders':
        this.loadOrders();
        break;
      case 'customers':
        this.loadCustomers();
        break;
      case 'coupons':
        this.loadCoupons();
        break;
    }
  },

  async loadCategories() {
    try {
      const res = await API.get('/categories');
      this.categories = res.data;

      // Populate category dropdown in product form
      const select = document.getElementById('product-category-select');
      if (select) {
        select.innerHTML = '<option value="">Select Category</option>' + 
          this.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  },

  // 1. OVERVIEW & STATS
  async loadDashboardStats() {
    try {
      const res = await API.get('/admin/stats');
      const data = res.data;

      document.getElementById('stat-revenue').textContent = `₹${data.metrics.totalRevenue.toFixed(2)}`;
      document.getElementById('stat-orders').textContent = data.metrics.totalOrders;
      document.getElementById('stat-pending').textContent = data.metrics.pendingOrders;
      document.getElementById('stat-products').textContent = data.metrics.totalProducts;
      document.getElementById('stat-customers').textContent = data.metrics.totalCustomers;
      document.getElementById('stat-low-stock').textContent = data.metrics.lowStockProducts;

      // Render recent orders
      const recentOrdersTbody = document.getElementById('recent-orders-tbody');
      if (recentOrdersTbody) {
        recentOrdersTbody.innerHTML = data.recentOrders.map(order => `
          <tr>
            <td><strong>#${order.order_number}</strong></td>
            <td>${order.customer_name}</td>
            <td>₹${order.final_amount.toFixed(2)}</td>
            <td><span class="status-pill ${order.order_status.toLowerCase().replace(/ /g, '-')}">${order.order_status}</span></td>
            <td>${new Date(order.created_at).toLocaleDateString()}</td>
          </tr>
        `).join('');
      }
    } catch (err) {
      App.showToast('Failed to load stats: ' + err.message, 'error');
    }
  },

  // 2. PRODUCT MANAGEMENT
  async loadProducts() {
    const tbody = document.getElementById('admin-products-tbody');
    if (!tbody) return;

    try {
      const res = await API.get('/admin/products');
      const products = res.data;

      tbody.innerHTML = products.map(prod => `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <img src="${prod.image_url}" alt="${prod.name}" style="width: 40px; height: 40px; object-fit: contain; border-radius: 6px; background: #f8fafc;">
              <div>
                <div style="font-weight: 700;">${prod.name}</div>
                <div style="font-size: 0.75rem; color: #64748b;">${prod.unit}</div>
              </div>
            </div>
          </td>
          <td>${prod.category_name || '-'}</td>
          <td><strong>₹${prod.price}</strong> ${prod.discount_price ? `<span style="font-size: 0.75rem; color: #10b981;">(Offer: ₹${prod.discount_price})</span>` : ''}</td>
          <td>
            <span style="font-weight: 700; color: ${prod.stock_quantity <= 10 ? '#ef4444' : '#059669'};">
              ${prod.stock_quantity}
            </span>
            ${prod.stock_quantity <= 10 ? '<span style="font-size: 0.7rem; background: #fee2e2; color: #dc2626; padding: 2px 4px; border-radius: 4px; margin-left: 4px;">Low</span>' : ''}
          </td>
          <td>★ ${prod.rating}</td>
          <td>
            <button class="admin-btn" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="Admin.openEditProductModal(${JSON.stringify(prod).replace(/"/g, '&quot;')})">Edit</button>
            <button class="admin-btn danger" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="Admin.deleteProduct(${prod.id})">Delete</button>
          </td>
        </tr>
      `).join('');
    } catch (err) {
      App.showToast('Failed to load products: ' + err.message, 'error');
    }
  },

  openAddProductModal() {
    const form = document.getElementById('admin-product-form');
    if (form) form.reset();
    document.getElementById('product-edit-id').value = '';
    document.getElementById('product-modal-title').textContent = 'Add New Grocery Product';
    document.getElementById('admin-product-modal').classList.add('show');
  },

  openEditProductModal(prod) {
    document.getElementById('product-edit-id').value = prod.id;
    document.getElementById('product-name-input').value = prod.name;
    document.getElementById('product-category-select').value = prod.category_id || '';
    document.getElementById('product-unit-input').value = prod.unit;
    document.getElementById('product-price-input').value = prod.price;
    document.getElementById('product-discount-input').value = prod.discount_price || '';
    document.getElementById('product-stock-input').value = prod.stock_quantity;
    document.getElementById('product-image-input').value = prod.image_url;
    document.getElementById('product-desc-input').value = prod.description || '';
    document.getElementById('product-featured-input').checked = !!prod.is_featured;

    document.getElementById('product-modal-title').textContent = 'Edit Product';
    document.getElementById('admin-product-modal').classList.add('show');
  },

  closeProductModal() {
    document.getElementById('admin-product-modal').classList.remove('show');
  },

  async saveProduct() {
    const id = document.getElementById('product-edit-id').value;
    const data = {
      name: document.getElementById('product-name-input').value.trim(),
      categoryId: document.getElementById('product-category-select').value,
      unit: document.getElementById('product-unit-input').value.trim(),
      price: Number(document.getElementById('product-price-input').value),
      discountPrice: document.getElementById('product-discount-input').value ? Number(document.getElementById('product-discount-input').value) : null,
      stockQuantity: Number(document.getElementById('product-stock-input').value),
      imageUrl: document.getElementById('product-image-input').value.trim(),
      description: document.getElementById('product-desc-input').value.trim(),
      isFeatured: document.getElementById('product-featured-input').checked
    };

    try {
      if (id) {
        await API.put(`/admin/products/${id}`, data);
        App.showToast('Product updated successfully!');
      } else {
        await API.post('/admin/products', data);
        App.showToast('Product created successfully!');
      }

      this.closeProductModal();
      this.loadProducts();
    } catch (err) {
      App.showToast(err.message, 'error');
    }
  },

  async deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await API.delete(`/admin/products/${id}`);
      App.showToast('Product deleted.');
      this.loadProducts();
    } catch (err) {
      App.showToast(err.message, 'error');
    }
  },

  // 3. ORDER MANAGEMENT
  async loadOrders() {
    const tbody = document.getElementById('admin-orders-tbody');
    if (!tbody) return;

    try {
      const res = await API.get('/admin/orders');
      const orders = res.data;

      tbody.innerHTML = orders.map(order => `
        <tr>
          <td><strong>#${order.order_number}</strong></td>
          <td>
            <div style="font-weight: 700;">${order.customer_name}</div>
            <div style="font-size: 0.75rem; color: #64748b;">${order.customer_phone}</div>
          </td>
          <td>
            <div style="font-size: 0.8rem; max-width: 200px;">${order.delivery_address}</div>
            <div style="font-size: 0.75rem; color: #059669;">${order.delivery_slot}</div>
          </td>
          <td>
            <strong>₹${order.final_amount.toFixed(2)}</strong>
            <div style="font-size: 0.75rem; color: #64748b;">${order.payment_method.toUpperCase()} (${order.payment_status})</div>
          </td>
          <td>
            <select class="status-select" onchange="Admin.updateOrderStatus(${order.id}, this.value)">
              <option value="Placed" ${order.order_status === 'Placed' ? 'selected' : ''}>Placed</option>
              <option value="Confirmed" ${order.order_status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="Packed" ${order.order_status === 'Packed' ? 'selected' : ''}>Packed</option>
              <option value="Out for Delivery" ${order.order_status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
              <option value="Delivered" ${order.order_status === 'Delivered' ? 'selected' : ''}>Delivered</option>
              <option value="Cancelled" ${order.order_status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
          <td>${new Date(order.created_at).toLocaleDateString()}</td>
        </tr>
      `).join('');
    } catch (err) {
      App.showToast('Failed to load orders: ' + err.message, 'error');
    }
  },

  async updateOrderStatus(orderId, newStatus) {
    try {
      const res = await API.put(`/admin/orders/${orderId}/status`, {
        orderStatus: newStatus,
        paymentStatus: newStatus === 'Delivered' ? 'Paid' : undefined
      });
      App.showToast(res.message);
    } catch (err) {
      App.showToast(err.message, 'error');
      this.loadOrders();
    }
  },

  // 4. CUSTOMER MANAGEMENT
  async loadCustomers() {
    const tbody = document.getElementById('admin-customers-tbody');
    if (!tbody) return;

    try {
      const res = await API.get('/admin/users');
      const users = res.data;

      tbody.innerHTML = users.map(user => `
        <tr>
          <td><strong>${user.full_name}</strong></td>
          <td>${user.email}</td>
          <td>${user.phone || '-'}</td>
          <td><span class="status-pill ${user.role === 'admin' ? 'confirmed' : 'placed'}">${user.role}</span></td>
          <td><strong>${user.total_orders}</strong> orders</td>
          <td>₹${Number(user.total_spent).toFixed(2)}</td>
          <td>${new Date(user.created_at).toLocaleDateString()}</td>
        </tr>
      `).join('');
    } catch (err) {
      App.showToast('Failed to load customers: ' + err.message, 'error');
    }
  },

  // 5. COUPONS MANAGEMENT
  async loadCoupons() {
    const tbody = document.getElementById('admin-coupons-tbody');
    if (!tbody) return;

    try {
      const res = await API.get('/admin/coupons');
      const coupons = res.data;

      tbody.innerHTML = coupons.map(c => `
        <tr>
          <td><strong>${c.code}</strong></td>
          <td>${c.discount_percent}%</td>
          <td>₹${c.max_discount}</td>
          <td>₹${c.min_order_amount}</td>
          <td><span class="status-pill delivered">Active</span></td>
          <td>
            <button class="admin-btn danger" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="Admin.deleteCoupon(${c.id})">Delete</button>
          </td>
        </tr>
      `).join('');
    } catch (err) {
      App.showToast('Failed to load coupons: ' + err.message, 'error');
    }
  },

  openAddCouponModal() {
    const form = document.getElementById('admin-coupon-form');
    if (form) form.reset();
    document.getElementById('admin-coupon-modal').classList.add('show');
  },

  closeCouponModal() {
    document.getElementById('admin-coupon-modal').classList.remove('show');
  },

  async saveCoupon() {
    const data = {
      code: document.getElementById('coupon-code-input').value.trim(),
      discountPercent: Number(document.getElementById('coupon-percent-input').value),
      maxDiscount: Number(document.getElementById('coupon-max-input').value),
      minOrderAmount: Number(document.getElementById('coupon-min-input').value || 0)
    };

    try {
      await API.post('/admin/coupons', data);
      App.showToast('Coupon created successfully!');
      this.closeCouponModal();
      this.loadCoupons();
    } catch (err) {
      App.showToast(err.message, 'error');
    }
  },

  async deleteCoupon(id) {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await API.delete(`/admin/coupons/${id}`);
      App.showToast('Coupon deleted.');
      this.loadCoupons();
    } catch (err) {
      App.showToast(err.message, 'error');
    }
  }
};
