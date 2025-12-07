import { login } from '../auth.js';
import { navigateTo } from '../routing.js';
import { getFromStorage, STORAGE_KEYS } from '../utils.js';

export function renderLogin() {
  const container = document.createElement('div');
  container.className = 'login-container';

  container.innerHTML = `
    <div class="login-card">
      <div class="login-header">
        <h1>Hệ thống Quản lý Học tập</h1>
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
        <p>Đăng nhập demo:</p>
        <div class="demo-buttons">
          <button class="demo-button admin">Admin</button>
          <button class="demo-button teacher">Giảng viên</button>
          <button class="demo-button student">Sinh viên</button>
        </div>
      </div>

      <div class="login-info">
        <p><strong>Thông tin đăng nhập:</strong></p>
        <p>Admin: admin / 123456</p>
        <p>Giảng viên: teacher1 / 123456</p>
        <p>Sinh viên: student1 / 123456</p>
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
