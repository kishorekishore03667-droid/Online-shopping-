// ===================================================
// Kishore Kumar Mart - Order History & Live Tracking
// ===================================================

const Orders = {
  orders: [],

  async init() {
    if (!Auth.isLoggedIn()) {
      window.location.href = '/index.html';
      return;
    }

    await this.loadOrders();
    this.checkUrlForNewOrder();
  },

  async loadOrders() {
    const listEl = document.getElementById('orders-list');
    if (!listEl) return;

    try {
      const res = await API.get('/orders/my-orders');
      this.orders = res.data;

      if (this.orders.length === 0) {
        listEl.innerHTML = `
          <div style="text-align: center; padding: 4rem 1rem; color: #64748b; background: white; border-radius: 16px; border: 1px solid #e2e8f0;">
            <div style="font-size: 3rem; margin-bottom: 0.5rem;">📦</div>
            <p style="font-weight: 700; font-size: 1.15rem; color: #0f172a;">You haven't placed any orders yet</p>
            <p style="font-size: 0.85rem; margin-top: 0.25rem;">Start shopping fresh groceries and essentials today!</p>
            <a href="/index.html" class="nav-btn primary" style="margin-top: 1.5rem; display: inline-flex;">Shop Now</a>
          </div>
        `;
        return;
      }

      listEl.innerHTML = this.orders.map(order => this.renderOrderCard(order)).join('');
    } catch (err) {
      listEl.innerHTML = `<p style="color: #ef4444;">Failed to load orders: ${err.message}</p>`;
    }
  },

  renderOrderCard(order) {
    const statusMap = {
      'Placed': { class: 'placed', step: 1 },
      'Confirmed': { class: 'confirmed', step: 2 },
      'Packed': { class: 'packed', step: 3 },
      'Out for Delivery': { class: 'out-for-delivery', step: 4 },
      'Delivered': { class: 'delivered', step: 5 },
      'Cancelled': { class: 'cancelled', step: 0 }
    };

    const currentStatus = statusMap[order.order_status] || { class: 'placed', step: 1 };
    const dateFormatted = new Date(order.created_at).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div class="order-card" style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 1rem; margin-bottom: 1rem;">
          <div>
            <div style="font-size: 0.8rem; color: #64748b; font-weight: 600;">ORDER NUMBER</div>
            <div style="font-size: 1.1rem; font-weight: 800; color: #0f172a;">#${order.order_number}</div>
            <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.2rem;">Placed on ${dateFormatted}</div>
          </div>
          <div style="text-align: right;">
            <span class="status-pill ${currentStatus.class}">${order.order_status}</span>
            <div style="font-size: 1.2rem; font-weight: 800; color: #059669; margin-top: 0.35rem;">₹${order.final_amount.toFixed(2)}</div>
          </div>
        </div>

        <!-- LIVE ORDER TRACKER VISUAL STEPPER -->
        <div style="margin: 1.5rem 0;">
          <div style="font-size: 0.85rem; font-weight: 700; color: #0f172a; margin-bottom: 0.75rem;">Order Lifecycle:</div>
          <div style="display: flex; justify-content: space-between; position: relative;">
            <div style="position: absolute; top: 14px; left: 5%; right: 5%; height: 3px; background: #e2e8f0; z-index: 1;"></div>
            
            ${['Placed', 'Confirmed', 'Packed', 'Out for Delivery', 'Delivered'].map((stepName, idx) => {
              const isCompleted = currentStatus.step >= idx + 1;
              const isCurrent = currentStatus.step === idx + 1;
              return `
                <div style="display: flex; flex-direction: column; align-items: center; z-index: 2; width: 18%;">
                  <div style="width: 28px; height: 28px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; background: ${isCompleted ? '#059669' : '#e2e8f0'}; color: ${isCompleted ? 'white' : '#64748b'}; border: 2px solid ${isCurrent ? '#f59e0b' : 'transparent'};">
                    ${isCompleted ? '✓' : idx + 1}
                  </div>
                  <div style="font-size: 0.72rem; font-weight: ${isCompleted ? '700' : '500'}; color: ${isCompleted ? '#0f172a' : '#94a3b8'}; margin-top: 0.35rem; text-align: center;">
                    ${stepName}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- ITEMS IN ORDER -->
        <div style="background: #f8fafc; border-radius: 10px; padding: 1rem; margin-bottom: 1rem;">
          <div style="font-size: 0.8rem; font-weight: 700; color: #64748b; margin-bottom: 0.5rem; text-transform: uppercase;">Items Ordered (${order.items.length})</div>
          ${order.items.map(item => `
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; margin-bottom: 0.35rem;">
              <span><strong>${item.quantity}x</strong> ${item.product_name}</span>
              <span style="font-weight: 600;">₹${item.subtotal.toFixed(2)}</span>
            </div>
          `).join('')}
        </div>

        <!-- DELIVERY & PAYMENT DETAILS -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; font-size: 0.85rem; color: #4b5563; border-top: 1px solid #f1f5f9; padding-top: 0.75rem;">
          <div>
            <strong>Delivery Address:</strong><br>${order.delivery_address}
          </div>
          <div>
            <strong>Time Slot:</strong><br>${order.delivery_slot}
          </div>
          <div>
            <strong>Payment Mode:</strong><br>${order.payment_method.toUpperCase()} (${order.payment_status})
          </div>
        </div>
      </div>
    `;
  },

  checkUrlForNewOrder() {
    const params = new URLSearchParams(window.location.search);
    const newOrderNumber = params.get('newOrder');
    if (newOrderNumber) {
      App.showToast(`🎉 Order #${newOrderNumber} placed successfully!`, 'success');
    }
  }
};
