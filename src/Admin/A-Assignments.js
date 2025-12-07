import { stateManager } from '../state.js';
import { navigateTo } from '../routing.js';
import {
  getFromStorage,
  addToStorage,
  updateInStorage,
  deleteFromStorage,
  generateId,
  STORAGE_KEYS
} from '../utils.js';

function showModal(modal) {
  modal.style.display = 'block';
  document.body.classList.add('modal-open');
}

export function renderAdminAssignments() {
    const assignments = getFromStorage(STORAGE_KEYS.ASSIGNMENTS);
    const courses = getFromStorage(STORAGE_KEYS.COURSES);
    const users = getFromStorage(STORAGE_KEYS.USERS);
    const teachers = users.filter(u => u.role === 'teacher');
    const container = document.createElement('div');
    container.className = 'admin-assignments';
  
    container.innerHTML = `
      <div class="page-header">
        <h1>Quản lý bài tập</h1>
        
      </div>
  
      <div class="filters-section">
        <div class="filter-group teacher-filter-group">
          <label for="teacher-filter">Lọc theo giáo viên:</label>
          <select id="teacher-filter" class="form-control">
            <option value="">Tất cả giáo viên</option>
            ${teachers.map(teacher => `<option value="${teacher.id}">${teacher.fullName}</option>`).join('')}
          </select>
        </div>
      </div>
  
      <div class="assignments-grid">
        ${assignments.map(assignment => {
      const course = courses.find(c => c.id === assignment.courseId);
      const teacherId = assignment.teacherId || (course ? course.teacherId : '');
      return `
            <div class="assignment-card" data-assignment-id="${assignment.id}" data-teacher-id="${teacherId || ''}">
              <div class="assignment-header">
                <h3>${assignment.title}</h3>
                <span class="assignment-status ${assignment.isActive ? 'active' : 'inactive'}">
                  ${assignment.isActive ? 'Hoạt động' : 'Không hoạt động'}
                </span>
              </div>
              <div class="assignment-info" style="display: grid; grid-template-columns: 1fr; gap: 8px;">
                <p><strong>Khóa học:</strong> ${course ? course.title : 'N/A'}</p>
                <p><strong>Mô tả:</strong> ${assignment.description.substring(0, 100)}${assignment.description?.length > 100 ? '...' : 'Không có mô tả'}</p>
                <p><strong>Hạn nộp:</strong> ${new Date(assignment.dueDate).toLocaleDateString('vi-VN')}</p>
                <p><strong>Điểm tối đa:</strong> ${assignment.maxScore}</p>
              </div>
              <div class="assignment-actions">
                <button class="btn btn-sm btn-edit" data-assignment-id="${assignment.id}">Chỉnh sửa</button>
                <button class="btn btn-sm btn-${assignment.isActive ? 'deactivate' : 'activate'}" data-assignment-id="${assignment.id}">
                  ${assignment.isActive ? 'Vô hiệu' : 'Kích hoạt'}
                </button>
                <button class="btn btn-sm btn-delete" data-assignment-id="${assignment.id}">Xóa</button>
              </div>
            </div>
          `;
    }).join('')}
      </div>
  
      <div id="assignment-modal" class="modal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="assignment-modal-title">Chỉnh sửa bài tập</h3>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div id="assignment-warning" style="display: none; background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; padding: 12px; margin-bottom: 16px; color: #856404;">
              <strong>⚠️ Lưu ý:</strong> Bạn đang chỉnh sửa bài tập của giảng viên khác. Vui lòng cẩn thận khi thay đổi.
            </div>
            <div id="assignment-teacher-info" style="display: none; background: #e7f3ff; border: 1px solid #2196F3; border-radius: 4px; padding: 12px; margin-bottom: 16px; color: #0d47a1;">
              <strong>👤 Giảng viên tạo bài tập:</strong> <span id="teacher-name-display"></span>
            </div>
            <form id="assignment-form">
              <div class="form-group">
                <label for="assignment-title">Tên bài tập:</label>
                <input type="text" id="assignment-title" name="title" required>
              </div>
              <div class="form-group">
                <label for="assignment-course">Khóa học:</label>
                <select id="assignment-course" name="courseId" required>
                  <option value="">Chọn khóa học</option>
                  ${courses.map(course => `<option value="${course.id}">${course.title}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label for="assignment-description">Mô tả:</label>
                <textarea id="assignment-description" name="description" rows="4" required></textarea>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="assignment-due-date">Hạn nộp:</label>
                  <input type="date" id="assignment-due-date" name="dueDate" required>
                </div>
                <div class="form-group">
                  <label for="assignment-max-score">Điểm tối đa:</label>
                  <input type="number" id="assignment-max-score" name="maxScore" min="0" max="10" step="0.5" required>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="assignment-modal-cancel">Hủy</button>
            <button type="button" class="btn btn-primary" id="assignment-modal-save">Lưu</button>
          </div>
        </div>
      </div>
    `;
  
    setupAdminAssignmentsEventListeners(container);
    return container;
  }
  
  function setupAdminAssignmentsEventListeners(container) {
    // Filter functionality
    const teacherFilter = container.querySelector('#teacher-filter');
    
    function filterAssignments() {
      const selectedTeacherId = teacherFilter.value;
      const assignmentCards = container.querySelectorAll('.assignment-card');
      
      assignmentCards.forEach(card => {
        const teacherId = card.dataset.teacherId || '';
        
        // Nếu chưa chọn giáo viên, hiển thị tất cả
        if (!selectedTeacherId) {
          card.style.display = '';
          return;
        }
        
        // Nếu đã chọn giáo viên, chỉ hiển thị bài tập của giáo viên đó
        const matchesTeacher = teacherId === selectedTeacherId;
        card.style.display = matchesTeacher ? '' : 'none';
      });
    }
    
    // Khi chọn giáo viên
    if (teacherFilter) {
      teacherFilter.addEventListener('change', filterAssignments);
    }
    
    // Action buttons
    container.addEventListener('click', (e) => {
      const target = e.target;
      const assignmentId = target.dataset.assignmentId;
  
      if (target.classList.contains('btn-edit')) {
        editAssignment(container, assignmentId);
      } else if (target.classList.contains('btn-deactivate') || target.classList.contains('btn-activate')) {
        toggleAssignmentStatus(assignmentId);
        const currentRoute = stateManager.getState().currentRoute;
        navigateTo(currentRoute);
      } else if (target.classList.contains('btn-delete')) {
        if (confirm('Bạn có chắc chắn muốn xóa bài tập này?')) {
          deleteAssignment(assignmentId);
          const currentRoute = stateManager.getState().currentRoute;
          navigateTo(currentRoute);
        }
      }
    });
  }
  
  function showAssignmentModal(container, assignment) {
    if (!assignment) {
      alert('Không tìm thấy bài tập!');
      return;
    }

    const modal = container.querySelector('#assignment-modal');
    const form = container.querySelector('#assignment-form');
    const title = container.querySelector('#assignment-modal-title');
    const warningDiv = container.querySelector('#assignment-warning');
    const teacherInfoDiv = container.querySelector('#assignment-teacher-info');
    const teacherNameDisplay = container.querySelector('#teacher-name-display');
    const currentUser = stateManager.getState().user;
    const users = getFromStorage(STORAGE_KEYS.USERS) || [];
  
    title.textContent = 'Chỉnh sửa bài tập';
    form['title'].value = assignment.title;
    form['courseId'].value = assignment.courseId;
    form['description'].value = assignment.description || '';
    form['dueDate'].value = assignment.dueDate ? assignment.dueDate.split('T')[0] : '';
    form['maxScore'].value = assignment.maxScore || 10;
    
    // Hiển thị thông tin giảng viên và cảnh báo nếu có
    if (assignment.teacherId && assignment.teacherId !== currentUser.id) {
      const teacher = users.find(u => u.id === assignment.teacherId);
      const teacherName = teacher ? teacher.fullName : (assignment.teacherName || 'Không xác định');
      teacherNameDisplay.textContent = teacherName;
      teacherInfoDiv.style.display = 'block';
      warningDiv.style.display = 'block';
    } else {
      teacherInfoDiv.style.display = 'none';
      warningDiv.style.display = 'none';
    }
  
    showModal(modal);
  
    // Modal event listeners
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('#assignment-modal-cancel');
    const saveBtn = modal.querySelector('#assignment-modal-save');
  
    const closeModal = () => {
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
    };
  
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
  
    saveBtn.addEventListener('click', () => {
      if (form.checkValidity()) {
        saveAssignment(form, assignment.id);
        closeModal();
        const currentRoute = stateManager.getState().currentRoute;
        navigateTo(currentRoute);
      } else {
        form.reportValidity();
      }
    });
  }
  
  function saveAssignment(form, assignmentId) {
    if (!assignmentId) {
      alert('Lỗi: Không tìm thấy ID bài tập!');
      return;
    }

    const currentUser = stateManager.getState().user;
    const assignments = getFromStorage(STORAGE_KEYS.ASSIGNMENTS) || [];
    const existingAssignment = assignments.find(a => a.id === assignmentId);
    
    if (!existingAssignment) {
      alert('Không tìm thấy bài tập để chỉnh sửa!');
      return;
    }

    // Xác nhận nếu admin chỉnh sửa bài tập của giảng viên khác
    if (existingAssignment.teacherId && existingAssignment.teacherId !== currentUser.id) {
      if (!confirm('⚠️ Bạn đang chỉnh sửa bài tập của giảng viên khác.\n\nBạn có chắc chắn muốn tiếp tục?')) {
        return;
      }
    }

    const assignmentData = {
      title: form['title'].value,
      description: form['description'].value,
      courseId: form['courseId'].value,
      dueDate: form['dueDate'].value,
      maxScore: parseFloat(form['maxScore'].value),
      // Giữ nguyên thông tin giảng viên
      teacherId: existingAssignment.teacherId,
      teacherName: existingAssignment.teacherName,
      // Ghi lại ai đã chỉnh sửa (nếu là admin chỉnh sửa)
      editedBy: existingAssignment.teacherId !== currentUser.id ? currentUser.id : undefined,
      editedAt: existingAssignment.teacherId !== currentUser.id ? new Date().toISOString() : undefined,
      // Giữ nguyên các trường không thay đổi
      isActive: existingAssignment.isActive,
      createdAt: existingAssignment.createdAt
    };
  
    updateInStorage(STORAGE_KEYS.ASSIGNMENTS, assignmentId, assignmentData);
  }
  
  function editAssignment(container, assignmentId) {
    const assignments = getFromStorage(STORAGE_KEYS.ASSIGNMENTS);
    const assignment = assignments.find(a => a.id === assignmentId);
    if (assignment) {
      showAssignmentModal(container, assignment);
    }
  }
  
  function toggleAssignmentStatus(assignmentId) {
    const assignments = getFromStorage(STORAGE_KEYS.ASSIGNMENTS);
    const assignment = assignments.find(a => a.id === assignmentId);
    if (assignment) {
      updateInStorage(STORAGE_KEYS.ASSIGNMENTS, assignmentId, { isActive: !assignment.isActive });
    }
  }
  
  function deleteAssignment(assignmentId) {
    deleteFromStorage(STORAGE_KEYS.ASSIGNMENTS, assignmentId);
  }
  