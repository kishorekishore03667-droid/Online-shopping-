// ===================================================
// Kishore Kumar Mart - Wishlist Handler
// ===================================================

const Wishlist = {
  items: [],

  init() {
    if (Auth.isLoggedIn()) {
      this.loadWishlist();
    }
  },

  async loadWishlist() {
    if (!Auth.isLoggedIn()) return;
    try {
      const res = await API.get('/wishlist');
      this.items = res.data;
      this.updateBadge();

      // If on wishlist page, render items
      const container = document.getElementById('wishlist-grid');
      if (container) {
        this.renderWishlistPage(container);
      }
    } catch (err) {
      console.error('Error loading wishlist:', err);
    }
  },

  updateBadge() {
    const badge = document.getElementById('wishlist-badge');
    if (badge) {
      badge.textContent = this.items.length;
      badge.style.display = this.items.length > 0 ? 'inline-flex' : 'none';
    }
  },

  async toggle(productId, buttonEl = null) {
    if (!Auth.isLoggedIn()) {
      Auth.showLoginModal();
      return;
    }

    try {
      const res = await API.post('/wishlist/toggle', { productId });
      this.items = res.data.items;
      this.updateBadge();

      if (buttonEl) {
        buttonEl.classList.toggle('active', res.data.added);
      }

      App.showToast(res.message);

      const container = document.getElementById('wishlist-grid');
      if (container) {
        this.renderWishlistPage(container);
      }
    } catch (err) {
      App.showToast(err.message, 'error');
    }
  },

  renderWishlistPage(container) {
    if (this.items.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: #64748b;">
          <div style="font-size: 3rem; margin-bottom: 0.5rem;">💔</div>
          <p style="font-weight: 700; font-size: 1.15rem; color: #0f172a;">Your Wishlist is Empty</p>
          <p style="font-size: 0.85rem; margin-top: 0.25rem;">Tap the heart on items you love to save them here for later!</p>
          <a href="/index.html" class="nav-btn primary" style="margin-top: 1.5rem; display: inline-flex;">Continue Shopping</a>
        </div>
      `;
      return;
    }

    container.innerHTML = this.items.map(item => `
      <div class="product-card">
        <button class="product-wishlist-btn active" onclick="Wishlist.toggle(${item.id}, this)">
          ♥
        </button>
        <a href="/product-detail.html?id=${item.id}" class="product-image-container">
          <img class="product-image" src="${item.image_url}" alt="${item.name}">
        </a>
        <div class="product-category-tag">${item.category_name || 'Grocery'}</div>
        <a href="/product-detail.html?id=${item.id}">
          <h3 class="product-title">${item.name}</h3>
        </a>
        <div class="product-unit">${item.unit}</div>
        <div class="product-footer">
          <div class="price-box">
            <span class="current-price">₹${item.discount_price || item.price}</span>
            ${item.discount_price ? `<span class="mrp-price">₹${item.price}</span>` : ''}
          </div>
          <button class="add-cart-btn" onclick="Cart.addItem(${item.id})">Move to Cart</button>
        </div>
      </div>
    `).join('');
  }
};
