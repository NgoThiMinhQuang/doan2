import { login } from '../auth.js';
import { navigateTo } from '../routing.js';
import { getFromStorage, STORAGE_KEYS } from '../utils.js';

export function renderLogin() {
  const container = document.createElement('div');
  container.className = 'login-container';

  container.innerHTML = `
    <div class="login-card">
      <div class="login-header">
        <div class="login-logo">
          <svg class="logo-icon" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="60" height="60" rx="12" fill="url(#logo-gradient)"/>
            <path d="M30 15L15 24L30 33L45 24L30 15Z" fill="white"/>
            <path d="M30 33L22.5 28.5V37.5C22.5 40.5 26.25 43.5 30 43.5C33.75 43.5 37.5 40.5 37.5 37.5V28.5L30 33Z" fill="white" opacity="0.9"/>
            <circle cx="45" cy="27" r="3" fill="#FF9500"/>
            <defs>
              <linearGradient id="logo-gradient" x1="0" y1="0" x2="60" y2="60">
                <stop offset="0%" stop-color="#667eea"/>
                <stop offset="100%" stop-color="#764ba2"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1>EduSystem</h1>
        <p>Đăng nhập để tiếp tục</p>
      </div>

      <form class="login-form">
        <div class="form-group">
          <label for="username">Tên đăng nhập</label>
          <input type="text" id="username" required />
        </div>

        <div class="form-group">
          <label for="password">Mật khẩu</label>
          <input type="password" id="password" required />
        </div>

        <div id="error-message" class="error-message" style="display: none;"></div>

        <button type="submit" class="login-button">Đăng nhập</button>
      </form>

      <div class="demo-section">
        <div class="demo-divider">
          <span>Hoặc đăng nhập nhanh</span>
        </div>
        <div class="demo-buttons">
          <button class="demo-button admin" title="Admin: admin / 123456">
            <svg class="demo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
              <path d="M2 17L12 22L22 17"/>
              <path d="M2 12L12 17L22 12"/>
            </svg>
            <span>Admin</span>
          </button>
          <button class="demo-button teacher" title="Giảng viên: teacher1 / 123456">
            <svg class="demo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>Giảng viên</span>
          </button>
          <button class="demo-button student" title="Sinh viên: student1 / 123456">
            <svg class="demo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 10v6M2 10l10-5 10 5M2 10l10 5M2 10v6l10 5M12 15l10-5M12 15v6"/>
            </svg>
            <span>Sinh viên</span>
          </button>
        </div>
      </div>
    </div>
  `;

  // Add event listeners
  const form = container.querySelector('.login-form');
  const usernameInput = container.querySelector('#username');
  const passwordInput = container.querySelector('#password');
  const errorDiv = container.querySelector('#error-message');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (login(username, password)) {
      navigateTo('/dashboard');
    } else {
      // Check if user exists to provide better error message
      const users = getFromStorage(STORAGE_KEYS.USERS);
      const user = users.find(u => u.username === username);
      
      if (user && !user.isActive) {
        errorDiv.textContent = 'Tài khoản này đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.';
      } else {
        errorDiv.textContent = 'Tên đăng nhập hoặc mật khẩu không đúng';
      }
      errorDiv.style.display = 'block';
    }
  });

  // Demo login buttons
  container.querySelector('.demo-button.admin').addEventListener('click', () => {
    usernameInput.value = 'admin';
    passwordInput.value = '123456';
    if (login('admin', '123456')) {
      navigateTo('/dashboard');
    }
  });

  container.querySelector('.demo-button.teacher').addEventListener('click', () => {
    usernameInput.value = 'teacher1';
    passwordInput.value = '123456';
    if (login('teacher1', '123456')) {
      navigateTo('/dashboard');
    }
  });

  container.querySelector('.demo-button.student').addEventListener('click', () => {
    usernameInput.value = 'student1';
    passwordInput.value = '123456';
    if (login('student1', '123456')) {
      navigateTo('/dashboard');
    }
  });

  return container;
}
