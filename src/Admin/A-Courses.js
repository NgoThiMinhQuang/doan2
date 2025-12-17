import { stateManager } from '../state.js';
import { getFromStorage, STORAGE_KEYS, updateInStorage, deleteFromStorage } from '../utils.js';
import { navigateTo } from '../routing.js';

export function renderAdminCourses() {
    // Kiểm tra quyền truy cập
    const currentUser = stateManager.getState().user;
    if (!currentUser || currentUser.role !== 'admin') {
      navigateTo('/dashboard');
      return document.createElement('div');
    }
    
    const courses = getFromStorage(STORAGE_KEYS.COURSES) || [];
    const users = getFromStorage(STORAGE_KEYS.USERS) || [];
    const teachers = users.filter(u => u.role === 'teacher');
    const container = document.createElement('div');
    container.className = 'admin-courses';
  
    container.innerHTML = `
      <div class="page-header">
        <h1>Quản lý khóa học</h1>
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
  
      <div class="courses-grid">
        ${courses.map(course => {
          const teacher = users.find(u => u.id === course.teacherId);
          return `
            <div class="course-card" data-course-id="${course.id}" data-teacher-id="${course.teacherId || ''}">
              <div class="course-header">
                <h3>${course.title}</h3>
                <div class="course-header-actions">
                  <span class="course-status ${course.isActive ? 'active' : 'inactive'}">
                    ${course.isActive ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </div>
              </div>
              <div class="course-info">
                <p><strong>Giảng viên:</strong> ${teacher ? teacher.fullName : 'N/A'}</p>
                <p><strong>Mô tả:</strong> ${course.description ? course.description.substring(0, 100) + (course.description.length > 100 ? '...' : '') : 'Không có mô tả'}</p>
                <p><strong>Số học sinh:</strong> ${course.students ? course.students.length : 0}</p>
                <p><strong>Số bài học:</strong> ${course.lessons ? course.lessons.length : 0}</p>
                <p><strong>Ngày tạo:</strong> ${course.createdAt ? new Date(course.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
              </div>
              <div class="course-actions">
                <button class="btn btn-sm btn-edit" data-course-id="${course.id}">Chi tiết</button>
                <button class="btn btn-sm btn-${course.isActive ? 'deactivate' : 'activate'}" data-course-id="${course.id}">
                  ${course.isActive ? 'Vô hiệu' : 'Kích hoạt'}
                </button>
                <button class="btn btn-sm btn-delete" data-course-id="${course.id}">Xóa</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      ${courses.length === 0 ? `
        <div class="empty-state">
          <p>Chưa có khóa học nào trong hệ thống.</p>
        </div>
      ` : ''}
  
      <div id="course-detail-modal" class="modal" style="display: none;">
        <div class="modal-content large-modal">
          <div class="modal-header">
            <h3 id="course-detail-title">Chi tiết khóa học</h3>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body" id="course-detail-body">
            <!-- Course details will be loaded here -->
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="course-detail-close">Đóng</button>
          </div>
        </div>
      </div>
    `;
  
    setupAdminCoursesEventListeners(container);
    return container;
  }
  
  function setupAdminCoursesEventListeners(container) {
    // Filter functionality
    const teacherFilter = container.querySelector('#teacher-filter');
    
    function filterCourses() {
      const selectedTeacherId = teacherFilter.value;
      const courseCards = container.querySelectorAll('.course-card');
      
      courseCards.forEach(card => {
        const teacherId = card.dataset.teacherId || '';
        
        // Nếu chưa chọn giáo viên, hiển thị tất cả
        if (!selectedTeacherId) {
          card.style.display = '';
          return;
        }
        
        // Nếu đã chọn giáo viên, chỉ hiển thị khóa học của giáo viên đó
        const matchesTeacher = teacherId === selectedTeacherId;
        card.style.display = matchesTeacher ? '' : 'none';
      });
    }
    
    // Khi chọn giáo viên
    if (teacherFilter) {
      teacherFilter.addEventListener('change', filterCourses);
    }
    
    // Action buttons
    container.addEventListener('click', (e) => {
      const target = e.target;
      const courseId = target.dataset.courseId;
  
      if (target.classList.contains('btn-edit')) {
        showCourseDetails(container, courseId);
      } else if (target.classList.contains('btn-deactivate') || target.classList.contains('btn-activate')) {
        toggleCourseStatus(courseId);
        const currentRoute = stateManager.getState().currentRoute;
        navigateTo(currentRoute);
      } else if (target.classList.contains('btn-delete')) {
        if (confirm('Bạn có chắc chắn muốn xóa khóa học này? Hành động này không thể hoàn tác!')) {
          deleteCourse(courseId);
          const currentRoute = stateManager.getState().currentRoute;
          navigateTo(currentRoute);
        }
      }
    });
  }
  
  function showCourseDetails(container, courseId) {
    const courses = getFromStorage(STORAGE_KEYS.COURSES);
    const users = getFromStorage(STORAGE_KEYS.USERS);
    const course = courses.find(c => c.id === courseId);
    
    if (!course) {
      alert('Không tìm thấy khóa học!');
      return;
    }
  
    const teacher = users.find(u => u.id === course.teacherId);
    const students = users.filter(u => course.students && course.students.includes(u.id));
  
    const modal = container.querySelector('#course-detail-modal');
    const title = container.querySelector('#course-detail-title');
    const body = container.querySelector('#course-detail-body');
  
    title.textContent = course.title;
  
    body.innerHTML = `
      <div class="course-detail-section">
        <h4>Thông tin chung</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <label>Tên khóa học:</label>
            <span>${course.title}</span>
          </div>
          <div class="detail-item">
            <label>Giảng viên:</label>
            <span>${teacher ? teacher.fullName : 'N/A'}</span>
          </div>
          <div class="detail-item">
            <label>Email giảng viên:</label>
            <span>${teacher ? teacher.email : 'N/A'}</span>
          </div>
          <div class="detail-item">
            <label>Trạng thái:</label>
            <span class="course-status ${course.isActive ? 'active' : 'inactive'}">
              ${course.isActive ? 'Hoạt động' : 'Không hoạt động'}
            </span>
          </div>
          <div class="detail-item">
            <label>Ngày tạo:</label>
            <span>${course.createdAt ? new Date(course.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
          </div>
        </div>
      </div>
  
      <div class="course-detail-section">
        <h4>Mô tả</h4>
        <p>${course.description || 'Không có mô tả'}</p>
      </div>
  
      ${course.videoUrl ? `
        <div class="course-detail-section">
          <h4>Video giới thiệu</h4>
          <a href="${course.videoUrl}" target="_blank" class="video-link">${course.videoUrl}</a>
        </div>
      ` : ''}
  
      <div class="course-detail-section">
        <h4>Danh sách bài học (${course.lessons ? course.lessons.length : 0})</h4>
        ${course.lessons && course.lessons.length > 0 ? `
          <div class="lessons-list-detail">
            ${course.lessons.map((lesson, index) => `
              <div class="lesson-item-detail">
                <div class="lesson-number">${index + 1}</div>
                <div class="lesson-content">
                  <strong>${lesson.title}</strong>
                  ${lesson.description ? `<p>${lesson.description}</p>` : ''}
                  <div class="lesson-meta">
                    <span>⏱ ${lesson.duration || 0} phút</span>
                    ${lesson.videoUrl ? `<span>🎥 Có video</span>` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : '<p>Chưa có bài học nào.</p>'}
      </div>
  
      <div class="course-detail-section">
        <h4>Danh sách học sinh (${students.length})</h4>
        ${students.length > 0 ? `
          <div class="students-list-detail">
            ${students.map(student => `
              <div class="student-item-detail">
                <div class="student-avatar">${student.fullName.charAt(0).toUpperCase()}</div>
                <div class="student-info">
                  <strong>${student.fullName}</strong>
                  <span>${student.email}</span>
                </div>
              </div>
            `).join('')}
          </div>
        ` : '<p>Chưa có học sinh nào đăng ký.</p>'}
      </div>
    `;
  
    // Show modal
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
  
    // Modal event listeners
    const closeBtn = modal.querySelector('.modal-close');
    const closeDetailBtn = modal.querySelector('#course-detail-close');
  
    const closeModal = () => {
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
    };
  
    closeBtn.addEventListener('click', closeModal);
    closeDetailBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }
  
  function toggleCourseStatus(courseId) {
    const courses = getFromStorage(STORAGE_KEYS.COURSES);
    const course = courses.find(c => c.id === courseId);
    if (course) {
      updateInStorage(STORAGE_KEYS.COURSES, courseId, { isActive: !course.isActive });
      // Broadcast course update event
      window.dispatchEvent(new CustomEvent('coursesUpdated', {
        detail: { action: course.isActive ? 'deactivate' : 'activate', courseId, courseTitle: course.title }
      }));
    }
  }
  
  function deleteCourse(courseId) {
    const courses = getFromStorage(STORAGE_KEYS.COURSES);
    const course = courses.find(c => c.id === courseId);
    deleteFromStorage(STORAGE_KEYS.COURSES, courseId);
    // Broadcast course deletion event
    if (course) {
      window.dispatchEvent(new CustomEvent('coursesUpdated', {
        detail: { action: 'delete', courseId, courseTitle: course.title }
      }));
    }
  }
