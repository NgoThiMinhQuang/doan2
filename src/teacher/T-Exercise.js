import { stateManager } from '../state.js';
import { navigateTo } from '../routing.js';
import {
  getFromStorage,
  addToStorage,
  updateInStorage,
  saveToStorage,
  generateId,
  STORAGE_KEYS,
  showModal,
  closeAllModals
} from '../utils.js';

export function renderTeacherExercises() {
  // Kiểm tra quyền truy cập
  const currentUser = stateManager.getState().user;
  if (!currentUser || currentUser.role !== 'teacher') {
    navigateTo('/dashboard');
    return document.createElement('div');
  }
  
  const assignments = getFromStorage(STORAGE_KEYS.ASSIGNMENTS);
  
  // Filter assignments for this teacher
  const myAssignments = assignments.filter(assignment => {
    return assignment && assignment.id && assignment.title && assignment.teacherId === currentUser.id;
  });

  const container = document.createElement('div');
  container.className = 'teacher-exercises';

  container.innerHTML = `
    <div class="page-header">
      <h1>Quản lý bài tập</h1>
      <button class="btn btn-primary add-exercise-btn">Tạo bài tập mới</button>
    </div>

    <div class="exercises-grid">
      ${myAssignments.map(assignment => `
        <div class="exercise-card" data-exercise-id="${assignment.id}">
          <div class="exercise-header">
            <h3>${assignment.title}</h3>
            <span class="exercise-status ${assignment.isActive ? 'active' : 'inactive'}">
              ${assignment.isActive ? 'Hoạt động' : 'Không hoạt động'}
            </span>
          </div>
          <div class="exercise-info">
            <p><strong>Khóa học:</strong> ${assignment.courseName || 'N/A'}</p>
            <p><strong>Mô tả:</strong> ${assignment.description.substring(0, 100)}${assignment.description?.length > 100 ? '...' : ''}</p>
            <p><strong>Hạn nộp:</strong> ${new Date(assignment.dueDate).toLocaleDateString('vi-VN')}</p>
            <p><strong>Điểm tối đa:</strong> ${assignment.maxScore} điểm</p>
            <p><strong>Số bài nộp:</strong> ${assignment.submissions?.length || 0}</p>
          </div>
          <div class="exercise-actions">
            <button class="btn btn-sm btn-edit" data-exercise-id="${assignment.id}">Chỉnh sửa</button>
            <button class="btn btn-sm btn-${assignment.isActive ? 'deactivate' : 'activate'}" data-exercise-id="${assignment.id}">
              ${assignment.isActive ? 'Vô hiệu' : 'Kích hoạt'}
            </button>
            <button class="btn btn-sm btn-danger btn-delete" data-exercise-id="${assignment.id}">Xóa</button>
          </div>
        </div>
      `).join('')}
    </div>

    <div id="exercise-modal" class="modal" style="display: none;">
      <div class="modal-content">
        <div class="modal-header">
          <h3 id="exercise-modal-title">Tạo bài tập mới</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <form id="exercise-form">
            <div class="form-group">
              <label for="exercise-title">Tiêu đề bài tập:</label>
              <input type="text" id="exercise-title" name="title" required>
            </div>
            <div class="form-group">
              <label for="exercise-course">Chọn khóa học:</label>
              <select id="exercise-course" name="courseId" required>
                <option value="">-- Chọn khóa học --</option>
              </select>
            </div>
            <div class="form-group">
              <label for="exercise-description">Mô tả:</label>
              <textarea id="exercise-description" name="description" rows="4" required></textarea>
            </div>
            <div class="form-group">
              <label for="exercise-due-date">Hạn nộp:</label>
              <input type="datetime-local" id="exercise-due-date" name="dueDate" required>
            </div>
            <div class="form-group">
              <label for="exercise-max-score">Điểm tối đa:</label>
              <input type="number" id="exercise-max-score" name="maxScore" min="0" max="10" step="0.5" required>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="exercise-modal-cancel">Hủy</button>
          <button type="button" class="btn btn-primary" id="exercise-modal-save">Lưu</button>
        </div>
      </div>
    </div>
  `;

  setupTeacherExercisesEventListeners(container);
  return container;
}

function setupTeacherExercisesEventListeners(container) {
  // Add exercise button
  container.querySelector('.add-exercise-btn').addEventListener('click', () => {
    showExerciseModal(container);
  });

  // Action buttons
  container.addEventListener('click', (e) => {
    const target = e.target;
    const exerciseId = target.dataset.exerciseId;

    if (target.classList.contains('btn-edit')) {
      editExercise(container, exerciseId);
    } else if (target.classList.contains('btn-deactivate') || target.classList.contains('btn-activate')) {
      toggleExerciseStatus(exerciseId);
      const currentRoute = stateManager.getState().currentRoute;
      navigateTo(currentRoute);
    } else if (target.classList.contains('btn-delete')) {
      deleteExercise(container, exerciseId);
    }
  });
}

function showExerciseModal(container, assignment = null) {
  // Close any existing modals first
  closeAllModals();

  const modal = container.querySelector('#exercise-modal');
  const form = container.querySelector('#exercise-form');
  const title = container.querySelector('#exercise-modal-title');
  const courseSelect = form.querySelector('select[name="courseId"]');

  // Populate courses dropdown
  const currentUser = stateManager.getState().user;
  const courses = getFromStorage(STORAGE_KEYS.COURSES);
  const myCourses = courses.filter(course => course.teacherId === currentUser.id);

  // Populate courses dropdown trước
  courseSelect.innerHTML = `<option value="">-- Chọn khóa học --</option>` + 
    myCourses.map(course => `
      <option value="${course.id}" data-course-name="${course.title}">${course.title}</option>
    `).join('');

  if (assignment) {
    title.textContent = 'Chỉnh sửa bài tập';
    
    // Điền tất cả dữ liệu hiện tại vào form
    form['title'].value = assignment.title || '';
    form['description'].value = assignment.description || '';
    
    // Set courseId ngay sau khi dropdown đã được populate
    if (assignment.courseId) {
      // Đảm bảo option với courseId này tồn tại trong dropdown
      const courseExists = myCourses.some(c => c.id === assignment.courseId);
      if (courseExists) {
        courseSelect.value = assignment.courseId;
        // Cũng set vào form để đảm bảo
        if (form['courseId']) {
          form['courseId'].value = assignment.courseId;
        }
      }
    }
    
    // Xử lý ngày tháng - chuyển đổi sang format datetime-local
    if (assignment.dueDate) {
      let dueDateValue = assignment.dueDate;
      // Nếu là ISO string, cắt bỏ phần giây và timezone
      if (typeof dueDateValue === 'string') {
        if (dueDateValue.includes('T')) {
          // Nếu có 'T', lấy phần trước dấu 'T' và phần giờ:phút
          const parts = dueDateValue.split('T');
          if (parts.length >= 2) {
            const datePart = parts[0];
            const timePart = parts[1].split(':').slice(0, 2).join(':');
            dueDateValue = `${datePart}T${timePart}`;
          }
        } else {
          // Thử parse thành Date và chuyển đổi
          const date = new Date(dueDateValue);
          if (!isNaN(date.getTime())) {
            // Lấy local time string
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            dueDateValue = `${year}-${month}-${day}T${hours}:${minutes}`;
          } else {
            dueDateValue = '';
          }
        }
      } else {
        dueDateValue = '';
      }
      form['dueDate'].value = dueDateValue;
    } else {
      form['dueDate'].value = '';
    }
    
    form['maxScore'].value = assignment.maxScore || 10;
  } else {
    title.textContent = 'Tạo bài tập mới';
    form.reset();
  }

  showModal(modal);

  // Modal event listeners
  const closeBtn = modal.querySelector('.modal-close');
  const cancelBtn = modal.querySelector('#exercise-modal-cancel');
  const saveBtn = modal.querySelector('#exercise-modal-save');

  const closeModal = () => {
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
  };

  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  saveBtn.addEventListener('click', () => {
    if (form.checkValidity()) {
      saveExercise(form, assignment ? assignment.id : null);
      closeModal();
      const currentRoute = stateManager.getState().currentRoute;
      navigateTo(currentRoute);
    } else {
      form.reportValidity();
    }
  });
}

function saveExercise(form, assignmentId) {
  const currentUser = stateManager.getState().user;
  const courseId = form['courseId'].value;
  const courses = getFromStorage(STORAGE_KEYS.COURSES);
  const course = courses.find(c => c.id === courseId);

  const assignmentData = {
    title: form['title'].value,
    courseId: courseId,
    courseName: course?.title || 'N/A',
    description: form['description'].value,
    dueDate: form['dueDate'].value + ':00',
    maxScore: parseFloat(form['maxScore'].value),
    teacherId: currentUser.id,
    teacherName: currentUser.fullName,
    submissions: assignmentId ? undefined : [],
    isActive: true,
    createdAt: assignmentId ? undefined : new Date().toISOString()
  };

  if (assignmentId) {
    updateInStorage(STORAGE_KEYS.ASSIGNMENTS, assignmentId, assignmentData);
    window.dispatchEvent(new CustomEvent('assignmentsUpdated', {
      detail: { action: 'update', assignmentId }
    }));
  } else {
    const newAssignment = {
      id: generateId(),
      ...assignmentData
    };
    addToStorage(STORAGE_KEYS.ASSIGNMENTS, newAssignment);
    window.dispatchEvent(new CustomEvent('assignmentsUpdated', {
      detail: { action: 'create', assignmentId: newAssignment.id }
    }));
  }
}

function editExercise(container, exerciseId) {
  const assignments = getFromStorage(STORAGE_KEYS.ASSIGNMENTS);
  const assignment = assignments.find(a => a.id === exerciseId);
  if (assignment) {
    showExerciseModal(container, assignment);
  }
}

function toggleExerciseStatus(exerciseId) {
  const assignments = getFromStorage(STORAGE_KEYS.ASSIGNMENTS);
  const assignment = assignments.find(a => a.id === exerciseId);
  
  if (assignment) {
    updateInStorage(STORAGE_KEYS.ASSIGNMENTS, exerciseId, { isActive: !assignment.isActive });
    window.dispatchEvent(new CustomEvent('assignmentsUpdated', {
      detail: { action: 'toggle', assignmentId: exerciseId }
    }));
  }
}

function deleteExercise(container, exerciseId) {
  const assignments = getFromStorage(STORAGE_KEYS.ASSIGNMENTS);
  const assignment = assignments.find(a => a.id === exerciseId);

  if (!assignment) {
    alert('Không tìm thấy bài tập!');
    return;
  }

  if (confirm(`Bạn có chắc chắn muốn xóa bài tập "${assignment.title}"?\n\n⚠️ Lưu ý: Việc này sẽ xóa tất cả ${assignment.submissions?.length || 0} bài nộp của học sinh.\n\n🚫 Hành động này KHÔNG THỂ HOÀN TÁC!`)) {
    // Remove assignment from storage
    const updatedAssignments = assignments.filter(a => a.id !== exerciseId);
    saveToStorage(STORAGE_KEYS.ASSIGNMENTS, updatedAssignments);

    // Remove related submissions
    const submissions = getFromStorage(STORAGE_KEYS.SUBMISSIONS);
    const updatedSubmissions = submissions.filter(s => s.assignmentId !== exerciseId);
    saveToStorage(STORAGE_KEYS.SUBMISSIONS, updatedSubmissions);

    alert(`✅ Thành công!\n\nBài tập "${assignment.title}" đã được xóa hoàn toàn khỏi hệ thống.`);

    window.dispatchEvent(new CustomEvent('assignmentsUpdated', {
      detail: { action: 'delete', assignmentId: exerciseId }
    }));

    const currentRoute = stateManager.getState().currentRoute;
    navigateTo(currentRoute);
  }
}
