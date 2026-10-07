// ===================================================
// Kishore Kumar Mart - Product Catalog & Filtering
// ===================================================

const Products = {
  currentCategory: '',
  searchQuery: '',
  minPrice: '',
  maxPrice: '',
  inStockOnly: false,
  sortBy: 'default',

  init() {
    this.loadCategories();
    this.loadProducts();
    this.bindEvents();
  },

  bindEvents() {
    // Search input with debounce
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      let timeout;
      searchInput.oninput = (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.searchQuery = e.target.value.trim();
          this.loadProducts();
        }, 300);
      };
    }

    // In-stock checkbox
    const inStockCheckbox = document.getElementById('filter-instock');
    if (inStockCheckbox) {
      inStockCheckbox.onchange = (e) => {
        this.inStockOnly = e.target.checked;
        this.loadProducts();
      };
    }

    // Price range inputs
    const minPriceInput = document.getElementById('filter-min-price');
    const maxPriceInput = document.getElementById('filter-max-price');
    const applyPriceBtn = document.getElementById('apply-price-filter');
    if (applyPriceBtn) {
      applyPriceBtn.onclick = () => {
        this.minPrice = minPriceInput ? minPriceInput.value : '';
        this.maxPrice = maxPriceInput ? maxPriceInput.value : '';
        this.loadProducts();
      };
    }

    // Sort select
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.onchange = (e) => {
        this.sortBy = e.target.value;
        this.loadProducts();
      };
    }
  },

  async loadCategories() {
    const container = document.getElementById('category-pills');
    if (!container) return;

    try {
      const res = await API.get('/categories');
      const categories = res.data;

      container.innerHTML = `
        <button class="category-pill active" data-slug="" onclick="Products.filterByCategory('')">
          <span>🏪</span> All Items
        </button>
      ` + categories.map(cat => `
        <button class="category-pill" data-slug="${cat.slug}" onclick="Products.filterByCategory('${cat.slug}')">
          <span>${cat.icon || '📦'}</span> ${cat.name}
        </button>
      `).join('');
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  },

  filterByCategory(slug) {
    this.currentCategory = slug;

    // Update active pill UI
    document.querySelectorAll('.category-pill').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-slug') === slug);
    });

    this.loadProducts();
  },

  async loadProducts() {
    const grid = document.getElementById('product-grid');
    const countEl = document.getElementById('results-count');
    if (!grid) return;

    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #64748b;">
        <p>Loading fresh groceries...</p>
      </div>
    `;

    try {
      const params = {};
      if (this.currentCategory) params.category = this.currentCategory;
      if (this.searchQuery) params.search = this.searchQuery;
      if (this.minPrice) params.minPrice = this.minPrice;
      if (this.maxPrice) params.maxPrice = this.maxPrice;
      if (this.inStockOnly) params.inStock = 'true';
      if (this.sortBy && this.sortBy !== 'default') params.sort = this.sortBy;

      const res = await API.get('/products', params);
      const products = res.data;

      if (countEl) {
        countEl.textContent = `Showing ${products.length} products`;
      }

      if (products.length === 0) {
        grid.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: #64748b;">
            <div style="font-size: 3rem; margin-bottom: 0.5rem;">🔍</div>
            <p style="font-weight: 700; font-size: 1.15rem; color: #0f172a;">No products matched your criteria</p>
            <p style="font-size: 0.85rem; margin-top: 0.25rem;">Try adjusting your keywords, price filters, or category.</p>
          </div>
        `;
        return;
      }

      grid.innerHTML = products.map(prod => this.renderProductCard(prod)).join('');
    } catch (err) {
      grid.innerHTML = `<p style="grid-column: 1/-1; color: #ef4444; text-align: center;">Failed to load products: ${err.message}</p>`;
    }
  },

  renderProductCard(prod) {
    const discount = prod.discount_price && prod.price > prod.discount_price
      ? Math.round(((prod.price - prod.discount_price) / prod.price) * 100)
      : 0;

    const effectivePrice = prod.discount_price || prod.price;
    const isOutOfStock = prod.stock_quantity <= 0;

    return `
      <div class="product-card">
        ${discount > 0 ? `<span class="product-badge-discount">${discount}% OFF</span>` : ''}
        <button class="product-wishlist-btn" onclick="Wishlist.toggle(${prod.id}, this)" title="Add to Wishlist">
          ♥
        </button>
        <a href="/product-detail.html?id=${prod.id}" class="product-image-container">
          <img class="product-image" src="${prod.image_url}" alt="${prod.name}" loading="lazy">
        </a>
        <div class="product-category-tag">${prod.category_name || 'Grocery'}</div>
        <a href="/product-detail.html?id=${prod.id}">
          <h3 class="product-title" title="${prod.name}">${prod.name}</h3>
        </a>
        <div class="product-unit">${prod.unit}</div>
        <div class="product-rating">
          <span class="product-rating-star">★</span> ${prod.rating || 4.5} 
          <span style="color: #94a3b8; font-weight: normal; font-size: 0.75rem;">(${prod.reviews_count || 0})</span>
        </div>
        <div class="product-footer">
          <div class="price-box">
            <span class="current-price">₹${effectivePrice}</span>
            ${prod.discount_price ? `<span class="mrp-price">₹${prod.price}</span>` : ''}
          </div>
          <button 
            class="add-cart-btn" 
            onclick="Cart.addItem(${prod.id})"
            ${isOutOfStock ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
          >
            ${isOutOfStock ? 'Out of Stock' : '+ Add'}
          </button>
        </div>
      </div>
    `;
  }
};
