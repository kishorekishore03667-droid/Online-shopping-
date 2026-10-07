// ===================================================
// Kishore Kumar Mart - Authentication & User State
// ===================================================

const Auth = {
  init() {
    this.updateUserUI();
    this.bindEvents();
  },

  isLoggedIn() {
    return !!API.getToken() && !!API.getUser();
  },

  isAdmin() {
    const user = API.getUser();
    return user && user.role === 'admin';
  },

  updateUserUI() {
    const userBtn = document.getElementById('user-nav-btn');
    const userDropdown = document.getElementById('user-dropdown');
    const adminLink = document.getElementById('admin-nav-link');

    if (!userBtn) return;

    if (this.isLoggedIn()) {
      const user = API.getUser();
      userBtn.innerHTML = `👤 <span>${user.full_name.split(' ')[0]}</span>`;
      userBtn.onclick = (e) => {
        e.stopPropagation();
        userDropdown && userDropdown.classList.toggle('show');
      };

      if (adminLink) {
        adminLink.style.display = this.isAdmin() ? 'flex' : 'none';
      }
    } else {
      userBtn.innerHTML = `👤 <span>Sign In</span>`;
      userBtn.onclick = () => this.showLoginModal();

      if (adminLink) {
        adminLink.style.display = 'none';
      }
    }
  },

  bindEvents() {
    // Close dropdown on outside click
    document.addEventListener('click', () => {
      const dropdown = document.getElementById('user-dropdown');
      dropdown && dropdown.classList.remove('show');
    });

    // Login Form Submit
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        await this.login(email, password);
      };
    }

    // Register Form Submit
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.onsubmit = async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('reg-fullname').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const phone = document.getElementById('reg-phone')?.value || '';
        const address = document.getElementById('reg-address')?.value || '';
        await this.register({ fullName, email, password, phone, address });
      };
    }
  },

  async login(email, password) {
    try {
      const res = await API.post('/auth/login', { email, password });
      API.setToken(res.data.token);
      API.setUser(res.data.user);
      App.showToast(res.message || 'Logged in successfully!');
      this.closeModal();
      this.updateUserUI();

      if (typeof Cart !== 'undefined') {
        Cart.loadCart();
      }

      if (typeof Wishlist !== 'undefined') {
        Wishlist.loadWishlist();
      }

      // If on admin page and is admin, reload
      if (window.location.pathname.includes('admin.html') && res.data.user.role === 'admin') {
        window.location.reload();
      }
    } catch (err) {
      App.showToast(err.message, 'error');
    }
  },

  async register(data) {
    try {
      const res = await API.post('/auth/register', data);
      API.setToken(res.data.token);
      API.setUser(res.data.user);
      App.showToast(res.message || 'Welcome to Kishore Kumar Mart!');
      this.closeModal();
      this.updateUserUI();

      if (typeof Cart !== 'undefined') {
        Cart.loadCart();
      }
    } catch (err) {
      App.showToast(err.message, 'error');
    }
  },

  logout() {
    API.setToken(null);
    API.setUser(null);
    App.showToast('Logged out successfully.');
    this.updateUserUI();
    if (window.location.pathname.includes('admin.html')) {
      window.location.href = '/index.html';
    } else {
      window.location.reload();
    }
  },

  showLoginModal() {
    const modal = document.getElementById('auth-modal');
    const loginCard = document.getElementById('login-card');
    const regCard = document.getElementById('register-card');
    if (modal && loginCard && regCard) {
      modal.classList.add('show');
      loginCard.style.display = 'block';
      regCard.style.display = 'none';
    }
  },

  showRegisterModal() {
    const modal = document.getElementById('auth-modal');
    const loginCard = document.getElementById('login-card');
    const regCard = document.getElementById('register-card');
    if (modal && loginCard && regCard) {
      modal.classList.add('show');
      loginCard.style.display = 'none';
      regCard.style.display = 'block';
    }
  },

  closeModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.remove('show');
    }
  }
};
