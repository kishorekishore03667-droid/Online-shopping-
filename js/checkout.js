// ===================================================
// Kishore Kumar Mart - Multi-Step Checkout Processor
// ===================================================

const Checkout = {
  cart: null,
  appliedCoupon: null,
  discountAmount: 0,

  async init() {
    if (!Auth.isLoggedIn()) {
      window.location.href = '/index.html';
      return;
    }

    await this.loadCartData();
    this.prefillCustomerDetails();
    this.bindEvents();
  },

  async loadCartData() {
    try {
      const res = await API.get('/cart');
      this.cart = res.data;

      if (!this.cart.items || this.cart.items.length === 0) {
        App.showToast('Your cart is empty. Redirecting to store...', 'warning');
        setTimeout(() => {
          window.location.href = '/index.html';
        }, 1500);
        return;
      }

      this.renderOrderSummary();
    } catch (err) {
      App.showToast('Error loading cart: ' + err.message, 'error');
    }
  },

  prefillCustomerDetails() {
    const user = API.getUser();
    if (!user) return;

    const nameInput = document.getElementById('checkout-name');
    const phoneInput = document.getElementById('checkout-phone');
    const addressInput = document.getElementById('checkout-address');

    if (nameInput) nameInput.value = user.full_name || '';
    if (phoneInput) phoneInput.value = user.phone || '';
    if (addressInput) addressInput.value = user.address || '';
  },

  bindEvents() {
    // Coupon apply in checkout
    const applyBtn = document.getElementById('checkout-apply-coupon');
    if (applyBtn) {
      applyBtn.onclick = () => this.applyCoupon();
    }

    // Checkout form submit
    const form = document.getElementById('checkout-form');
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        await this.submitOrder();
      };
    }
  },

  async applyCoupon() {
    const input = document.getElementById('checkout-coupon-code');
    if (!input || !input.value.trim()) {
      App.showToast('Please type a coupon code', 'warning');
      return;
    }

    try {
      const res = await API.post('/coupons/apply', { code: input.value.trim() });
      this.discountAmount = res.data.discountAmount;
      this.appliedCoupon = res.data.code;
      App.showToast(res.message);
      this.renderOrderSummary();
    } catch (err) {
      App.showToast(err.message, 'error');
    }
  },

  renderOrderSummary() {
    if (!this.cart) return;

    // Render items list
    const itemsList = document.getElementById('checkout-items-list');
    if (itemsList) {
      itemsList.innerHTML = this.cart.items.map(item => `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <div>
            <div style="font-weight: 700; font-size: 0.875rem;">${item.name}</div>
            <div style="font-size: 0.75rem; color: #64748b;">Qty: ${item.quantity} × ₹${item.effective_price}</div>
          </div>
          <div style="font-weight: 700; font-size: 0.875rem;">₹${item.subtotal.toFixed(2)}</div>
        </div>
      `).join('');
    }

    const subtotalEl = document.getElementById('summary-subtotal');
    const discountRow = document.getElementById('summary-discount-row');
    const discountEl = document.getElementById('summary-discount');
    const deliveryEl = document.getElementById('summary-delivery');
    const totalEl = document.getElementById('summary-total');

    if (subtotalEl) subtotalEl.textContent = `₹${this.cart.subtotal.toFixed(2)}`;

    if (discountRow && discountEl) {
      if (this.discountAmount > 0) {
        discountRow.style.display = 'flex';
        discountEl.textContent = `-₹${this.discountAmount.toFixed(2)}`;
      } else {
        discountRow.style.display = 'none';
      }
    }

    if (deliveryEl) {
      deliveryEl.textContent = this.cart.deliveryFee === 0 ? 'FREE' : `₹${this.cart.deliveryFee.toFixed(2)}`;
    }

    const finalAmount = Math.max(0, this.cart.subtotal - this.discountAmount + this.cart.deliveryFee);
    if (totalEl) totalEl.textContent = `₹${finalAmount.toFixed(2)}`;
  },

  async submitOrder() {
    const customerName = document.getElementById('checkout-name')?.value.trim();
    const customerPhone = document.getElementById('checkout-phone')?.value.trim();
    const deliveryAddress = document.getElementById('checkout-address')?.value.trim();
    const deliverySlot = document.querySelector('input[name="delivery-slot"]:checked')?.value;
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value;
    const notes = document.getElementById('checkout-notes')?.value.trim() || '';

    if (!customerName || !customerPhone || !deliveryAddress) {
      App.showToast('Please fill in your name, contact phone, and delivery address.', 'error');
      return;
    }

    if (!deliverySlot) {
      App.showToast('Please select a preferred delivery slot.', 'warning');
      return;
    }

    if (!paymentMethod) {
      App.showToast('Please choose a payment method.', 'warning');
      return;
    }

    const submitBtn = document.getElementById('place-order-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing Order...';
    }

    try {
      const res = await API.post('/orders/checkout', {
        customerName,
        customerPhone,
        deliveryAddress,
        deliverySlot,
        paymentMethod,
        couponCode: this.appliedCoupon,
        notes
      });

      App.showToast('Order placed successfully!', 'success');

      // Show success modal or redirect to orders page
      setTimeout(() => {
        window.location.href = `/orders.html?newOrder=${res.data.order.order_number}`;
      }, 1000);
    } catch (err) {
      App.showToast(err.message, 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Place Order Now';
      }
    }
  }
};
