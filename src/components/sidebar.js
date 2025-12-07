import { stateManager } from '../state.js';
import { navigateTo } from '../routing.js';

export function renderSidebar() {
  const user = stateManager.getState().user;
  const currentRoute = stateManager.getState().currentRoute;

  const container = document.createElement('div');
  container.className = 'sidebar';

  const getMenuItems = () => {
    if (!user) return [];

    const commonItems = [
      { path: '/dashboard', label: 'Dashboard', icon: '🏠' }
    ];

    const adminMenuItems = [
      { path: '/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/admin/users', label: 'Quản lý người dùng', icon: '👥' },
      { path: '/admin/courses', label: 'Quản lý khóa học', icon: '📚' },
      { path: '/admin/exams', label: 'Quản lý kỳ thi', icon: '📋' },
      { path: '/admin/assignments', label: 'Quản lý bài tập', icon: '📝' },
      { path: '/admin/forum', label: 'Quản lý Chat', icon: '💬' },
      { path: '/admin/reports', label: 'Báo cáo thống kê', icon: '📈' }
    ];
    
    switch (user.role) {
      case 'admin':
        return adminMenuItems;
      case 'teacher':
        return [
          ...commonItems,
          { path: '/teacher/courses', label: 'Khóa học của tôi', icon: '📚' },
          { path: '/teacher/exercises', label: 'Bài tập', icon: '📝' },
          { path: '/teacher/exams', label: 'Thi trực tuyến', icon: '📋' },
          { path: '/teacher/grading', label: 'Chấm điểm', icon: '✅' },
          { path: '/teacher/chat', label: 'Chat nhóm', icon: '💬' }
        ];
      case 'student':
        return [
          ...commonItems,
          { path: '/student/courses', label: 'Khóa học', icon: '📚' },
          { path: '/student/assignments', label: 'Bài tập', icon: '📝' },
          { path: '/student/exams', label: 'Thi trực tuyến', icon: '✍️' },
          { path: '/student/chat', label: 'Chat nhóm', icon: '💬' },
          { path: '/student/progress', label: 'Tiến độ học tập', icon: '📈' }
        ];
      default:
        return commonItems;
    }
  };

  const menuItems = getMenuItems();
  const roleText = user?.role === 'admin' ? 'Quản trị viên' : user?.role === 'teacher' ? 'Giảng viên' : 'Sinh viên';

  container.innerHTML = `
    <div class="sidebar-header">
      <div class="logo">
        <span class="logo-icon">🎓</span>
        <span class="logo-text">EduSystem</span>
      </div>
    </div>

    <div class="sidebar-user">
      <div class="user-avatar">
        ${user?.fullName.charAt(0).toUpperCase()}
      </div>
      <div class="user-info">
        <div class="user-name">${user?.fullName}</div>
        <div class="user-role">${roleText}</div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <ul class="nav-list">
        ${menuItems.map(item => `
          <li class="nav-item">
            <a href="#" class="nav-link ${currentRoute === item.path ? 'active' : ''}" data-path="${item.path}">
              <span class="nav-icon">${item.icon}</span>
              <span class="nav-label">${item.label}</span>
            </a>
          </li>
        `).join('')}
      </ul>
    </nav>
  `;

  container.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const path = e.currentTarget.dataset.path;
      navigateTo(path);
    });
  });

  return container;
}
