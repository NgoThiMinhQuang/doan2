import { stateManager } from '../state.js';
import { getFromStorage, STORAGE_KEYS } from '../utils.js';

export function renderAdminDashboard() {
  const user = stateManager.getState().user;
  const users = getFromStorage(STORAGE_KEYS.USERS);
  const courses = getFromStorage(STORAGE_KEYS.COURSES);
  const assignments = getFromStorage(STORAGE_KEYS.ASSIGNMENTS);
  const exams = getFromStorage(STORAGE_KEYS.EXAMS);

  const stats = [
    { label: 'Tổng người dùng', value: users?.length, icon: '👥', color: '#3498db' },
    { label: 'Khóa học', value: courses?.length, icon: '📚', color: '#2ecc71' },
    { label: 'Bài tập', value: assignments?.length, icon: '📝', color: '#f39c12' },
    { label: 'Kỳ thi', value: exams?.length, icon: '📋', color: '#e74c3c' }
  ];

  const container = document.createElement('div');
  container.className = 'dashboard-admin';

  container.innerHTML = `
    <div class="welcome-section">
      <h2>Chào mừng, ${user.fullName}!</h2>
      <p>Tổng quan hệ thống quản lý học tập</p>
    </div>

    <div class="stats-grid">
      ${stats.map((stat, index) => `
        <div class="stat-card" style="border-left-color: ${stat.color}">
          <div class="stat-icon" style="color: ${stat.color}">
            ${stat.icon}
          </div>
          <div class="stat-content">
            <div class="stat-value">${stat.value}</div>
            <div class="stat-label">${stat.label}</div>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="dashboard-grid">
      <div class="dashboard-card">
        <h3>Người dùng mới nhất</h3>
        <div class="user-list">
          ${users.slice(-3).map(u => `
            <div class="user-item">
              <div class="user-avatar">
                ${u.fullName.charAt(0).toUpperCase()}
              </div>
              <div class="user-info">
                <div class="user-name">${u.fullName}</div>
                <div class="user-role">${u.role}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="dashboard-card">
        <h3>Hoạt động gần đây</h3>
        <div class="activity-list">
          <div class="activity-item">
            <span class="activity-icon">📚</span>
            <div class="activity-content">
              <div>Khóa học mới được tạo</div>
              <div class="activity-time">2 giờ trước</div>
            </div>
          </div>
          <div class="activity-item">
            <span class="activity-icon">👥</span>
            <div class="activity-content">
              <div>Người dùng mới đăng ký</div>
              <div class="activity-time">5 giờ trước</div>
            </div>
          </div>
          <div class="activity-item">
            <span class="activity-icon">📝</span>
            <div class="activity-content">
              <div>Bài tập mới được tạo</div>
              <div class="activity-time">1 ngày trước</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return container;
}

