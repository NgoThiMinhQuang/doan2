import { stateManager } from '../state.js';
import { getFromStorage, STORAGE_KEYS, addToStorage, updateInStorage, deleteFromStorage, generateId } from '../utils.js';
import { navigateTo } from '../routing.js';

export function renderAdminUsers() {
    // Kiểm tra quyền truy cập
    const currentUser = stateManager.getState().user;
    if (!currentUser || currentUser.role !== 'admin') {
      navigateTo('/dashboard');
      return document.createElement('div');
    }
    
    const users = getFromStorage(STORAGE_KEYS.USERS);
    const container = document.createElement('div');
    container.className = 'admin-users';
  
    container.innerHTML = `
      <div class="page-header">
        <h1>Quản lý người dùng</h1>
        <button class="btn btn-primary add-user-btn">Thêm người dùng mới</button>
      </div>
  
      <div class="filters-section">
        <div class="filter-group">
          <label for="role-filter">Lọc theo vai trò:</label>
          <select id="role-filter" class="form-control">
            <option value="">Tất cả</option>
            <option value="admin">Admin</option>
            <option value="teacher">Giảng viên</option>
            <option value="student">Sinh viên</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="status-filter">Lọc theo trạng thái:</label>
          <select id="status-filter" class="form-control">
            <option value="">Tất cả</option>
            <option value="true">Hoạt động</option>
            <option value="false">Không hoạt động</option>
          </select>
        </div>
        <div class="search-group">
          <input type="text" id="search-input" class="form-control" placeholder="Tìm kiếm theo tên hoặc email...">
        </div>
      </div>
  
      <div class="users-table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${users.filter(user => user.role !== 'admin').map(user => `
              <tr class="user-row" data-user-id="${user.id}">
                <td>
                  <div class="user-avatar">
                    ${user.fullName.charAt(0).toUpperCase()}
                  </div>
                </td>
                <td>${user.fullName}</td>
                <td>${user.email}</td>
                <td>
                  <span class="role-badge role-${user.role}">
                    ${user.role === 'admin' ? 'Quản trị viên' :
        user.role === 'teacher' ? 'Giảng viên' : 'Sinh viên'}
                  </span>
                </td>
                <td>
                  <span class="status-badge ${user.isActive ? 'active' : 'inactive'}">
                    ${user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </td>
                <td>${new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                  <div class="action-buttons">
                    <button class="btn btn-sm btn-edit" data-user-id="${user.id}">Sửa</button>
                    <button class="btn btn-sm btn-${user.isActive ? 'deactivate' : 'activate'}" data-user-id="${user.id}">
                      ${user.isActive ? 'Vô hiệu' : 'Kích hoạt'}
                    </button>
                    <button class="btn btn-sm btn-delete" data-user-id="${user.id}">Xóa</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
  
      <div id="user-modal" class="modal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="modal-title">Thêm người dùng mới</h3>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <form id="user-form">
              <div class="form-group">
                <label for="user-fullname">Họ tên:</label>
                <input type="text" id="user-fullname" name="fullName" required>
              </div>
              <div class="form-group">
                <label for="user-username">Tên đăng nhập:</label>
                <input type="text" id="user-username" name="username" required>
              </div>
              <div class="form-group">
                <label for="user-email">Email:</label>
                <input type="email" id="user-email" name="email" required>
              </div>
              <div class="form-group">
                <label for="user-role">Vai trò:</label>
                <select id="user-role" name="role" required>
                  <option value="student">Sinh viên</option>
                  <option value="teacher">Giảng viên</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>
              <div class="form-group">
                <label for="user-password">Mật khẩu:</label>
                <input type="password" id="user-password" name="password" required>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="modal-cancel">Hủy</button>
            <button type="button" class="btn btn-primary" id="modal-save">Lưu</button>
          </div>
        </div>
      </div>
    `;
  
    setupAdminUsersEventListeners(container);
    return container;
  }
  
  function setupAdminUsersEventListeners(container) {
    // Filter functionality
    const roleFilter = container.querySelector('#role-filter');
    const statusFilter = container.querySelector('#status-filter');
    const searchInput = container.querySelector('#search-input');
  
    function filterUsers() {
      const roleValue = roleFilter.value;
      const statusValue = statusFilter.value;
      const searchValue = searchInput.value.toLowerCase();
  
      const rows = container.querySelectorAll('.user-row');
      rows.forEach(row => {
        const userId = row.dataset.userId;
        const users = getFromStorage(STORAGE_KEYS.USERS);
        const user = users.find(u => u.id === userId);
  
        if (!user) return;
  
        const matchesRole = !roleValue || user.role === roleValue;
        const matchesStatus = !statusValue || user.isActive.toString() === statusValue;
        const matchesSearch = !searchValue ||
          user.fullName.toLowerCase()?.includes(searchValue) ||
          user.email.toLowerCase()?.includes(searchValue);
  
        row.style.display = matchesRole && matchesStatus && matchesSearch ? '' : 'none';
      });
    }
  
    roleFilter.addEventListener('change', filterUsers);
    statusFilter.addEventListener('change', filterUsers);
    searchInput.addEventListener('input', filterUsers);
  
    // Add user button
    container.querySelector('.add-user-btn').addEventListener('click', () => {
      showUserModal(container);
    });
  
    // Action buttons
    container.addEventListener('click', (e) => {
      const target = e.target;
      const userId = target.dataset.userId;
  
      if (target.classList.contains('btn-edit')) {
        editUser(container, userId);
      } else if (target.classList.contains('btn-deactivate') || target.classList.contains('btn-activate')) {
        toggleUserStatus(userId);
        // Reload để hiển thị thay đổi
        window.renderApp();
      } else if (target.classList.contains('btn-delete')) {
        if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
          deleteUser(userId);
          // Reload để hiển thị thay đổi
          window.renderApp();
        }
      }
    });
  }
  
  function showUserModal(container, user = null) {
    const modal = container.querySelector('#user-modal');
    const form = container.querySelector('#user-form');
    const title = container.querySelector('#modal-title');

    if (user) {
      title.textContent = 'Chỉnh sửa người dùng';
      form['fullName'].value = user.fullName;
      form['username'].value = user.username;
      form['email'].value = user.email;
      form['role'].value = user.role;
      form['password'].value = '';
      form['password'].required = false;
    } else {
      title.textContent = 'Thêm người dùng mới';
      form.reset();
      form['password'].required = true;
    }

    // Show modal
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
    modal.dataset.editingUserId = user ? user.id : '';
  
    // Modal event listeners
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('#modal-cancel');
    const saveBtn = modal.querySelector('#modal-save');

    const closeModal = () => {
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
    };

    // Remove old listeners to prevent multiple bindings
    const newCloseBtn = closeBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    const newSaveBtn = saveBtn.cloneNode(true);
    
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

    newCloseBtn.addEventListener('click', closeModal);
    newCancelBtn.addEventListener('click', closeModal);

    newSaveBtn.addEventListener('click', () => {
      if (form.checkValidity()) {
        saveUser(form, modal.dataset.editingUserId);
        closeModal();
        // Reload trang để hiển thị dữ liệu mới
        window.renderApp();
      } else {
        form.reportValidity();
      }
    });
  }
  
  function editUser(container, userId) {
    const users = getFromStorage(STORAGE_KEYS.USERS);
    const user = users.find(u => u.id === userId);
    if (user) {
      showUserModal(container, user);
    }
  }
  
  function saveUser(form, editingUserId) {
    const userData = {
      fullName: form['fullName'].value,
      username: form['username'].value,
      email: form['email'].value,
      role: form['role'].value,
      isActive: true
    };

    // Chỉ cập nhật password nếu có giá trị
    if (form['password'].value) {
      userData.password = form['password'].value;
    }

    if (editingUserId) {
      // Khi edit, chỉ cập nhật các field được thay đổi
      updateInStorage(STORAGE_KEYS.USERS, editingUserId, userData);
    } else {
      // Khi tạo mới, phải có password
      const newUser = {
        id: generateId(),
        ...userData,
        createdAt: new Date().toISOString()
      };
      addToStorage(STORAGE_KEYS.USERS, newUser);
    }
  }
  
  function toggleUserStatus(userId) {
    const users = getFromStorage(STORAGE_KEYS.USERS);
    const user = users.find(u => u.id === userId);
    if (user) {
      updateInStorage(STORAGE_KEYS.USERS, userId, { isActive: !user.isActive });
    }
  }
  
  function deleteUser(userId) {
    deleteFromStorage(STORAGE_KEYS.USERS, userId);
  }
  