import { stateManager } from '../state.js';
import { logout } from '../auth.js';
import { navigateTo } from '../routing.js';

export function renderHeader() {
  const user = stateManager.getState().user;
  const container = document.createElement('header');
  container.className = 'header';

  const pageTitle = user?.role === 'admin' ? 'Quản trị hệ thống' : user?.role === 'teacher' ? 'Giảng viên' : 'Sinh viên';

  container.innerHTML = `
    <div class="header-content">
      <div class="header-left">
        <h1 class="page-title">${pageTitle}</h1>
      </div>

      <div class="header-right">
        <div class="header-user">
          <div class="user-avatar-small">
            ${user?.fullName.charAt(0).toUpperCase()}
          </div>
          <div class="user-details">
            <span class="user-name">${user?.fullName}</span>
            <span class="user-email">${user?.email}</span>
          </div>
        </div>

        <button class="logout-button">
          <span class="logout-icon">🚪</span>
          Đăng xuất
        </button>
      </div>
    </div>
  `;

  container.querySelector('.logout-button').addEventListener('click', () => {
    logout();
    navigateTo('/');
  });

  return container;
}
