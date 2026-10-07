// ===================================================
// Kishore Kumar Mart - Main App Coordinator
// ===================================================

const App = {
  init() {
    Auth.init();
    Cart.init();
    Wishlist.init();

    // Check if on product catalog page
    if (document.getElementById('product-grid')) {
      Products.init();
    }

    // Check if on checkout page
    if (document.getElementById('checkout-form')) {
      Checkout.init();
    }

    // Check if on orders page
    if (document.getElementById('orders-list')) {
      Orders.init();
    }

    // Check if on wishlist page
    if (document.getElementById('wishlist-grid')) {
      Wishlist.init();
    }

    // Check if on admin page
    if (document.getElementById('admin-overview-tab') || document.querySelector('.admin-layout')) {
      Admin.init();
    }
  },

  showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
