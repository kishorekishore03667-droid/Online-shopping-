// ===================================================
// Kishore Kumar Mart - Interactive Shopping Cart
// ===================================================

const Cart = {
  data: {
    items: [],
    itemCount: 0,
    subtotal: 0,
    deliveryFee: 0,
    discountAmount: 0,
    appliedCoupon: null
  },

  init() {
    this.bindEvents();
    if (Auth.isLoggedIn()) {
      this.loadCart();
    }
  },

  bindEvents() {
    // Open drawer
    const cartBtn = document.getElementById('cart-nav-btn');
    if (cartBtn) {
      cartBtn.onclick = () => this.openDrawer();
    }

    // Close drawer
    const closeBtn = document.getElementById('cart-drawer-close');
    const backdrop = document.getElementById('cart-drawer-backdrop');
    if (closeBtn) closeBtn.onclick = () => this.closeDrawer();
    if (backdrop) backdrop.onclick = () => this.closeDrawer();

    // Apply Coupon
    const applyCouponBtn = document.getElementById('apply-coupon-btn');
    if (applyCouponBtn) {
      applyCouponBtn.onclick = () => this.applyCoupon();
    }
  },

  openDrawer() {
    if (!Auth.isLoggedIn()) {
      Auth.showLoginModal();
      return;
    }
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-drawer-backdrop');
    if (drawer && backdrop) {
      drawer.classList.add('open');
      backdrop.classList.add('show');
      this.loadCart();
    }
  },

  closeDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-drawer-backdrop');
    if (drawer && backdrop) {
      drawer.classList.remove('open');
      backdrop.classList.remove('show');
    }
  },

  async loadCart() {
    if (!Auth.isLoggedIn()) return;
    try {
      const res = await API.get('/cart');
      this.data.items = res.data.items || [];
      this.data.itemCount = res.data.itemCount || 0;
      this.data.subtotal = res.data.subtotal || 0;
      this.data.deliveryFee = res.data.deliveryFee || 0;
      this.updateUI();
    } catch (err) {
      console.error('Error loading cart:', err);
    }
  },

  async addItem(productId, quantity = 1) {
    if (!Auth.isLoggedIn()) {
      Auth.showLoginModal();
      return;
    }
    try {
      const res = await API.post('/cart/add', { productId, quantity });
      this.data.items = res.data.items;
      this.data.itemCount = res.data.itemCount;
      this.data.subtotal = res.data.subtotal;
      this.data.deliveryFee = res.data.deliveryFee;
      this.updateUI();
      App.showToast(res.message);
    } catch (err) {
      App.showToast(err.message, 'error');
    }
  },

  async updateQty(productId, quantity) {
    try {
      const res = await API.put('/cart/update', { productId, quantity });
      this.data.items = res.data.items;
      this.data.itemCount = res.data.itemCount;
      this.data.subtotal = res.data.subtotal;
      this.data.deliveryFee = res.data.deliveryFee;
      this.updateUI();
    } catch (err) {
      App.showToast(err.message, 'error');
    }
  },

  async removeItem(productId) {
    try {
      const res = await API.delete(`/cart/remove/${productId}`);
      this.data.items = res.data.items;
      this.data.itemCount = res.data.itemCount;
      this.data.subtotal = res.data.subtotal;
      this.data.deliveryFee = res.data.deliveryFee;
      this.updateUI();
      App.showToast(res.message);
    } catch (err) {
      App.showToast(err.message, 'error');
    }
  },

  async applyCoupon() {
    const input = document.getElementById('coupon-input');
    if (!input || !input.value.trim()) {
      App.showToast('Please enter a coupon code.', 'warning');
      return;
    }

    try {
      const res = await API.post('/coupons/apply', { code: input.value.trim() });
      this.data.discountAmount = res.data.discountAmount;
      this.data.appliedCoupon = res.data.code;
      App.showToast(res.message);
      this.updateUI();
    } catch (err) {
      App.showToast(err.message, 'error');
    }
  },

  updateUI() {
    // 1. Update header badge
    const badge = document.getElementById('cart-badge');
    if (badge) {
      badge.textContent = this.data.itemCount;
      badge.style.display = this.data.itemCount > 0 ? 'inline-flex' : 'none';
    }

    // 2. Update Free Shipping Meter
    const freeMeter = document.getElementById('free-shipping-text');
    const freeBar = document.getElementById('free-shipping-bar');
    if (freeMeter && freeBar) {
      const threshold = 499;
      if (this.data.subtotal >= threshold) {
        freeMeter.textContent = '🎉 You qualify for FREE Delivery!';
        freeBar.style.width = '100%';
      } else {
        const remaining = (threshold - this.data.subtotal).toFixed(0);
        freeMeter.textContent = `Add ₹${remaining} more to get FREE Delivery!`;
        const pct = Math.min(100, Math.round((this.data.subtotal / threshold) * 100));
        freeBar.style.width = `${pct}%`;
      }
    }

    // 3. Render Cart Items
    const container = document.getElementById('cart-items-container');
    if (container) {
      if (this.data.items.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 3rem 1rem; color: #64748b;">
            <div style="font-size: 3rem; margin-bottom: 0.5rem;">🛒</div>
            <p style="font-weight: 700; font-size: 1.1rem; color: #0f172a;">Your cart is empty</p>
            <p style="font-size: 0.85rem; margin-top: 0.25rem;">Explore our grocery aisles and stock up!</p>
          </div>
        `;
      } else {
        container.innerHTML = this.data.items.map(item => `
          <div class="cart-item">
            <img class="cart-item-img" src="${item.image_url}" alt="${item.name}">
            <div class="cart-item-details">
              <div class="cart-item-title">${item.name}</div>
              <div style="font-size: 0.75rem; color: #94a3b8;">${item.unit}</div>
              <div class="cart-item-price">₹${item.effective_price}</div>
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div class="cart-qty-control">
                  <button class="qty-btn" onclick="Cart.updateQty(${item.product_id}, ${item.quantity - 1})">-</button>
                  <span class="qty-val">${item.quantity}</span>
                  <button class="qty-btn" onclick="Cart.updateQty(${item.product_id}, ${item.quantity + 1})">+</button>
                </div>
                <button class="cart-item-remove" onclick="Cart.removeItem(${item.product_id})">Remove</button>
              </div>
            </div>
          </div>
        `).join('');
      }
    }

    // 4. Update Bill Summary
    const subtotalEl = document.getElementById('cart-subtotal');
    const discountRow = document.getElementById('cart-discount-row');
    const discountEl = document.getElementById('cart-discount');
    const deliveryEl = document.getElementById('cart-delivery');
    const totalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('cart-checkout-btn');

    if (subtotalEl) subtotalEl.textContent = `₹${this.data.subtotal.toFixed(2)}`;
    
    if (discountRow && discountEl) {
      if (this.data.discountAmount > 0) {
        discountRow.style.display = 'flex';
        discountEl.textContent = `-₹${this.data.discountAmount.toFixed(2)}`;
      } else {
        discountRow.style.display = 'none';
      }
    }

    if (deliveryEl) {
      deliveryEl.textContent = this.data.deliveryFee === 0 ? 'FREE' : `₹${this.data.deliveryFee.toFixed(2)}`;
    }

    const finalTotal = Math.max(0, this.data.subtotal - this.data.discountAmount + this.data.deliveryFee);
    if (totalEl) totalEl.textContent = `₹${finalTotal.toFixed(2)}`;

    if (checkoutBtn) {
      checkoutBtn.disabled = this.data.items.length === 0;
      checkoutBtn.onclick = () => {
        window.location.href = '/checkout.html';
      };
    }
  }
};
