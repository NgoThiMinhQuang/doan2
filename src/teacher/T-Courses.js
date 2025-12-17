import { stateManager } from '../state.js';
import { navigateTo } from '../routing.js';
import {
  getFromStorage,
  addToStorage,
  updateInStorage,
  saveToStorage,
  deleteFromStorage,
  generateId,
  STORAGE_KEYS,
  extractYouTubeId,
  playVideoInModal,
  showModal,
  closeAllModals
} from '../utils.js';

export function renderTeacherCourses() {
    // Kiểm tra quyền truy cập
    const currentUser = stateManager.getState().user;
    if (!currentUser || currentUser.role !== 'teacher') {
      navigateTo('/dashboard');
      return document.createElement('div');
    }
    
    const courses = getFromStorage(STORAGE_KEYS.COURSES);
    
    // Filter courses for this teacher
    const myCourses = courses.filter(course => {
      return course && course.id && course.title && course.teacherId === currentUser.id;
    });
  
    const container = document.createElement('div');
    container.className = 'teacher-courses';
  
    container.innerHTML = `
      <div class="page-header">
        <h1>Quản lý khóa học</h1>
        <button class="btn btn-primary add-course-btn">Tạo khóa học mới</button>
      </div>
  
      <div class="courses-grid">
        ${myCourses.map(course => `
          <div class="course-card" data-course-id="${course.id}">
            <div class="course-header">
              <h3>${course.title}</h3>
              <div class="course-header-actions">
                <span class="course-status ${course.isActive ? 'active' : 'inactive'}">
                  ${course.isActive ? 'Hoạt động' : 'Không hoạt động'}
                </span>
              </div>
            </div>
            <div class="course-info">
              <p><strong>Mô tả:</strong> ${course.description.substring(0, 100)}${course.description?.length > 100 ? '...' : ''}</p>
              ${course.videoUrl ? `
                <div class="course-video-preview">
                  <div class="video-thumbnail" data-video-url="${course.videoUrl}" data-course-id="${course.id}">
                    <img src="https://img.youtube.com/vi/${extractYouTubeId(course.videoUrl)}/mqdefault.jpg" 
                         alt="Video giới thiệu khóa học" 
                         onerror="this.src='https://via.placeholder.com/320x180?text=Video+Không+Tồn+Tại'">
                    <div class="play-overlay">
                      <div class="play-button">▶️</div>
                    </div>
                    <div class="video-duration">Video giới thiệu</div>
                  </div>
                </div>
              ` : ''}
              <p><strong>Số học sinh:</strong> ${course.students?.length || 0}</p>
              <p><strong>Số bài học:</strong> ${course.lessons ? course.lessons?.length : 0}</p>
              <p><strong>Ngày tạo:</strong> ${new Date(course.createdAt).toLocaleDateString('vi-VN')}</p>
              ${!course.isPublic && course.enrollmentCode ? `
                <p class="course-enrollment-badge">
                  <strong>🔐 Mã ghi danh:</strong> <code class="course-enrollment-code">${course.enrollmentCode}</code>
                </p>
              ` : course.isPublic ? `
                <p class="course-public-badge">
                  <strong>🔓 Khóa học công khai</strong> - Học sinh có thể tự đăng ký
                </p>
              ` : ''}
            </div>
            <div class="course-actions">
              <button class="btn btn-sm btn-edit" data-course-id="${course.id}">Chỉnh sửa</button>
              <button class="btn btn-sm btn-details" data-course-id="${course.id}">Xem chi tiết</button>
              <button class="btn btn-sm btn-${course.isActive ? 'deactivate' : 'activate'}" data-course-id="${course.id}">
                ${course.isActive ? 'Vô hiệu' : 'Kích hoạt'}
              </button>
              <button class="btn btn-sm btn-danger btn-delete" data-course-id="${course.id}">Xóa</button>
            </div>
          </div>
        `).join('')}
      </div>
  
      <div id="course-modal" class="modal" style="display: none;">
        <div class="modal-content course-modal-content">
          <div class="modal-header course-modal-header">
            <h3 id="course-modal-title" class="course-modal-title">
              <span class="course-modal-title-icon">📚</span>
              <span>Tạo khóa học mới</span>
            </h3>
            <button class="modal-close course-modal-close">&times;</button>
          </div>
          <div class="modal-body course-modal-body">
            <form id="course-form">
              <!-- Thông tin cơ bản -->
              <div class="course-form-section">
                <h4 class="course-form-section-title">
                  <span class="course-form-section-icon">📝</span>
                  <span>Thông tin cơ bản</span>
                </h4>
                <div class="form-group form-group-spacing">
                  <label for="course-title" class="course-form-label">
                    Tên khóa học <span class="required-field">*</span>
                  </label>
                  <input type="text" id="course-title" name="title" class="course-form-input" required placeholder="Nhập tên khóa học...">
                </div>
                <div class="form-group form-group-spacing-none">
                  <label for="course-description" class="course-form-label">
                    Mô tả khóa học <span class="required-field">*</span>
                  </label>
                  <textarea id="course-description" name="description" rows="4" class="course-form-textarea" required placeholder="Mô tả ngắn gọn về nội dung và mục tiêu của khóa học..."></textarea>
                </div>
              </div>

              <!-- Cài đặt đăng ký -->
              <div class="course-form-section course-form-section-registration">
                <h4 class="course-form-section-title">
                  <span class="course-form-section-icon">🔐</span>
                  <span>Cài đặt đăng ký</span>
                </h4>
                <div class="form-group form-group-spacing-small">
                  <label class="course-checkbox-label">
                    <input type="checkbox" id="course-is-public" name="isPublic" class="course-checkbox" checked>
                    <div class="course-checkbox-content">
                      <span class="course-checkbox-title">
                        <span>🔓</span>
                        <span>Khóa học công khai</span>
                      </span>
                      <div class="course-checkbox-description">
                        Cho phép tất cả học sinh tự đăng ký khóa học mà không cần mã ghi danh
                      </div>
                    </div>
                  </label>
                </div>
                <div class="form-group enrollment-code-group" id="enrollment-code-group">
                  <label for="course-enrollment-code" class="enrollment-code-label">
                    <span class="enrollment-code-icon">🔐</span>
                    <span>Mã ghi danh</span>
                    <span class="required-field">*</span>
                  </label>
                  <input type="text" id="course-enrollment-code" name="enrollmentCode" class="enrollment-code-input" placeholder="VD: TRR-D21-A">
                  <small class="enrollment-code-warning">
                    ⚠️ <strong>Lưu ý:</strong> Học sinh cần nhập đúng mã này để đăng ký khóa học. Hãy chia sẻ mã với học sinh của bạn sau khi tạo khóa học.
                  </small>
                </div>
              </div>
              
              <!-- Danh sách bài học -->
              <div class="lessons-section">
                <div class="lessons-header">
                  <h4 class="lessons-header-title">
                    <span class="lessons-header-icon">📚</span>
                    <span>Danh sách bài học</span>
                  </h4>
                </div>
                <div id="lessons-list" class="lessons-list">
                  <!-- Lessons will be added here -->
                </div>
                <div class="add-lesson-container">
                  <button type="button" class="btn btn-sm btn-primary add-lesson-btn">
                    <span class="add-lesson-btn-icon">➕</span>
                    <span>Thêm bài học</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer course-modal-footer">
            <button type="button" class="btn btn-secondary course-modal-cancel-btn" id="course-modal-cancel">Hủy</button>
            <button type="button" class="btn btn-primary course-modal-save-btn" id="course-modal-save">
              <span>💾</span>
              <span>Lưu khóa học</span>
            </button>
          </div>
        </div>
      </div>
    `;
  
    setupTeacherCoursesEventListeners(container);
    return container;
  }
  
  function setupTeacherCoursesEventListeners(container) {
    // Add course button
    container.querySelector('.add-course-btn').addEventListener('click', () => {
      showCourseModal(container);
    });
  
    // Action buttons
    container.addEventListener('click', (e) => {
      const target = e.target;
      const courseId = target.dataset.courseId;
  
      if (target.classList.contains('btn-edit')) {
        editCourse(container, courseId);
      } else if (target.classList.contains('btn-details')) {
        // Navigate to course details page instead of showing modal
        navigateTo(`/teacher/course/${courseId}`);
      } else if (target.classList.contains('btn-deactivate') || target.classList.contains('btn-activate')) {
        toggleCourseStatus(container, courseId);
      } else if (target.classList.contains('btn-delete')) {
        deleteCourse(container, courseId);
      }
    });
    
    // Video thumbnail clicks for teacher
    container.addEventListener('click', (e) => {
      const videoThumbnail = e.target.closest('.video-thumbnail');
      if (videoThumbnail) {
        const videoUrl = videoThumbnail.dataset.videoUrl;
        const courseId = videoThumbnail.dataset.courseId;
        playVideoInModal(videoUrl, courseId);
      }
    });
  }
  
  function showCourseModal(container, course = null) {
    // Close any existing modals first
    closeAllModals();
  
    const modal = container.querySelector('#course-modal');
    const form = container.querySelector('#course-form');
    const title = container.querySelector('#course-modal-title');
  
    if (course) {
      title.innerHTML = '<span>✏️</span> <span>Chỉnh sửa khóa học</span>';
      // Điền tất cả dữ liệu hiện tại vào form
      form['title'].value = course.title || '';
      form['description'].value = course.description || '';
      form['isPublic'].checked = course.isPublic !== false;
      form['enrollmentCode'].value = course.enrollmentCode || '';
      
      // Hiển thị/ẩn enrollment code field
      const enrollmentCodeGroup = form.querySelector('#enrollment-code-group');
      if (enrollmentCodeGroup) {
        enrollmentCodeGroup.style.display = form['isPublic'].checked ? 'none' : 'block';
      }
      
      // Populate lessons if editing
      const lessonsList = form.querySelector('#lessons-list');
      lessonsList.innerHTML = '';
      if (course.lessons && course.lessons.length > 0) {
        course.lessons.forEach(lesson => {
          addLessonInput(form, lesson);
        });
      } else {
        // Nếu không có bài học nào, thêm một bài học trống
        addLessonInput(form);
      }
    } else {
      title.innerHTML = '<span>📚</span> <span>Tạo khóa học mới</span>';
      form.reset();
      // Clear lessons list
      const lessonsList = form.querySelector('#lessons-list');
      lessonsList.innerHTML = '';
      // Add one empty lesson input by default
      addLessonInput(form);
    }
  
    showModal(modal);
  
    // Modal event listeners
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('#course-modal-cancel');
    const saveBtn = modal.querySelector('#course-modal-save');
    const addLessonBtn = modal.querySelector('.add-lesson-btn');
  
    const closeModal = () => {
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
    };
  
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Add lesson button
    addLessonBtn.addEventListener('click', (e) => {
      e.preventDefault();
      addLessonInput(form);
    });
    
    // Toggle enrollment code field based on isPublic checkbox
    const isPublicCheckbox = form.querySelector('#course-is-public');
    const enrollmentCodeGroup = form.querySelector('#enrollment-code-group');
    if (isPublicCheckbox && enrollmentCodeGroup) {
      isPublicCheckbox.addEventListener('change', (e) => {
        enrollmentCodeGroup.style.display = e.target.checked ? 'none' : 'block';
      });
    }
    
    // Event delegation for remove buttons
    modal.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-lesson-btn')) {
        e.preventDefault();
        e.target.closest('.lesson-input-group').remove();
      }
    });
  
    saveBtn.addEventListener('click', () => {
      if (form.checkValidity()) {
        saveCourse(form, course ? course.id : null);
        closeModal();
        const currentRoute = stateManager.getState().currentRoute;
        navigateTo(currentRoute);
      } else {
        form.reportValidity();
      }
    });
  }
  
  function addLessonInput(form, lesson = null) {
    const lessonsList = form.querySelector('#lessons-list');
    const lessonIndex = lessonsList.children.length + 1;
    
    const lessonDiv = document.createElement('div');
    lessonDiv.className = 'lesson-input-group';
    
    // Đảm bảo tất cả giá trị được điền đúng, kể cả khi là undefined hoặc null
    const lessonTitle = lesson?.title || '';
    const lessonDescription = lesson?.description || '';
    const lessonVideoUrl = lesson?.videoUrl || '';
    const lessonDuration = lesson?.duration || '';
    
    lessonDiv.innerHTML = `
      <div class="lesson-header">
        <h5 class="lesson-header-title">
          <span class="lesson-header-icon">📖</span>
          <span>Bài ${lessonIndex}</span>
        </h5>
        <button type="button" class="remove-lesson-btn">🗑️ Xóa</button>
      </div>
      <div class="form-group form-group-spacing-medium">
        <label class="lesson-form-label">
          Tên bài học <span class="required-field">*</span>
        </label>
        <input type="text" class="lesson-title lesson-form-input" value="${lessonTitle}" placeholder="Ví dụ: Logic mệnh đề" required>
      </div>
      <div class="form-group form-group-spacing-medium">
        <label class="lesson-form-label">
          Mô tả bài học <span class="required-field">*</span>
        </label>
        <input type="text" class="lesson-description lesson-form-input" value="${lessonDescription}" placeholder="Mô tả ngắn về bài học" required>
      </div>
      <div class="form-group form-group-spacing-medium">
        <label class="lesson-form-label">
          Video (YouTube URL) <span class="required-field">*</span>
        </label>
        <input type="url" class="lesson-video lesson-form-input" value="${lessonVideoUrl}" placeholder="https://youtu.be/..." required>
      </div>
      <div class="form-group form-group-spacing-none">
        <label class="lesson-form-label">
          Thời lượng (phút) <span class="required-field">*</span>
        </label>
        <input type="number" class="lesson-duration lesson-form-input" value="${lessonDuration}" placeholder="45" min="1" required>
      </div>
    `;
    
    lessonsList.appendChild(lessonDiv);
  }
  
  function saveCourse(form, courseId) {
    const currentUser = stateManager.getState().user;
    
    // Collect lessons from form
    const lessonInputs = form.querySelectorAll('.lesson-input-group');
    const lessons = Array.from(lessonInputs).map((group, index) => ({
      id: String(index + 1),
      title: group.querySelector('.lesson-title').value,
      description: group.querySelector('.lesson-description').value,
      videoUrl: group.querySelector('.lesson-video').value,
      duration: parseInt(group.querySelector('.lesson-duration').value),
      order: index + 1,
      createdAt: new Date().toISOString(),
      isActive: true
    }));
    
    const isPublic = form['isPublic']?.checked || false;
    const enrollmentCode = form['enrollmentCode']?.value?.trim() || null;
    
    const courseData = {
      title: form['title'].value,
      description: form['description'].value,
      teacherId: currentUser.id,
      teacherName: currentUser.fullName,
      students: courseId ? undefined : [],
      lessons: lessons,
      isActive: true,
      isPublic: isPublic,
      enrollmentCode: isPublic ? null : (enrollmentCode || generateId().substring(0, 10)),
      createdAt: courseId ? undefined : new Date().toISOString()
    };
  
    if (courseId) {
      updateInStorage(STORAGE_KEYS.COURSES, courseId, courseData);
      // Broadcast course update event
      window.dispatchEvent(new CustomEvent('coursesUpdated', {
        detail: { action: 'update', courseId, courseTitle: courseData.title }
      }));
    } else {
      const newCourse = {
        id: generateId(),
        ...courseData
      };
      addToStorage(STORAGE_KEYS.COURSES, newCourse);
      // Broadcast course creation event
      window.dispatchEvent(new CustomEvent('coursesUpdated', {
        detail: { action: 'create', courseId: newCourse.id, courseTitle: newCourse.title }
      }));
    }
  }
  
  function editCourse(container, courseId) {
    const courses = getFromStorage(STORAGE_KEYS.COURSES);
    const course = courses.find(c => c.id === courseId);
    if (course) {
      showCourseModal(container, course);
    }
  }
  
  function deleteCourse(container, courseId) {
    const courses = getFromStorage(STORAGE_KEYS.COURSES);
    const course = courses.find(c => c.id === courseId);
  
    if (!course) {
      alert('Không tìm thấy khóa học!');
      return;
    }
  
    // Show confirmation dialog
    const confirmMessage = `Bạn có chắc chắn muốn xóa khóa học "${course.title}"?\n\n⚠️ Lưu ý: Việc này sẽ xóa:\n\n• Tất cả ${course.lessons?.length || 0} bài học trong khóa học\n• Dữ liệu của ${course.students?.length || 0} học sinh đăng ký\n• Các bài tập và điểm số liên quan\n• Lịch sử chat của lớp học\n\n🚫 Hành động này KHÔNG THỂ HOÀN TÁC!`;
  
    if (confirm(confirmMessage)) {
      // Remove course from storage
      const updatedCourses = courses.filter(c => c.id !== courseId);
      saveToStorage(STORAGE_KEYS.COURSES, updatedCourses);
  
      // Also remove related assignments
      const assignments = getFromStorage(STORAGE_KEYS.ASSIGNMENTS);
      const updatedAssignments = assignments.filter(a => a.courseId !== courseId);
      saveToStorage(STORAGE_KEYS.ASSIGNMENTS, updatedAssignments);
  
      // Remove related submissions
      const submissions = getFromStorage(STORAGE_KEYS.SUBMISSIONS);
      const updatedSubmissions = submissions.filter(s => {
        const assignment = assignments.find(a => a.id === s.assignmentId);
        return assignment ? assignment.courseId !== courseId : true;
      });
      saveToStorage(STORAGE_KEYS.SUBMISSIONS, updatedSubmissions);
  
      // Remove related chat messages
      const chatMessages = getFromStorage(STORAGE_KEYS.CHAT_MESSAGES);
      const updatedChatMessages = chatMessages.filter(msg => msg.courseId !== courseId);
      saveToStorage(STORAGE_KEYS.CHAT_MESSAGES, updatedChatMessages);
  
      // Show success message
      alert(`✅ Thành công!\n\nKhóa học "${course.title}" đã được xóa hoàn toàn khỏi hệ thống.`);
  
      // Broadcast course deletion event for real-time sync
      window.dispatchEvent(new CustomEvent('courseDeleted', {
        detail: { courseId, courseTitle: course.title }
      }));
      
      // Also broadcast general course update event
      window.dispatchEvent(new CustomEvent('coursesUpdated', {
        detail: { action: 'delete', courseId, courseTitle: course.title }
      }));
      
      // Refresh the current page
      const currentRoute = stateManager.getState().currentRoute;
      navigateTo(currentRoute);
    }
  }
  
  function toggleCourseStatus(container, courseId) {
    const courses = getFromStorage(STORAGE_KEYS.COURSES);
    const course = courses.find(c => c.id === courseId);
    if (course) {
      const newStatus = !course.isActive;
      updateInStorage(STORAGE_KEYS.COURSES, courseId, { isActive: newStatus });
      
      // Broadcast course update event
      window.dispatchEvent(new CustomEvent('coursesUpdated', {
        detail: { action: newStatus ? 'activate' : 'deactivate', courseId, courseTitle: course.title }
      }));
      
      // Refresh the current page
      const currentRoute = stateManager.getState().currentRoute;
      navigateTo(currentRoute);
    }
  }
  
  function viewCourseStudents(courseId) {
    const courses = getFromStorage(STORAGE_KEYS.COURSES);
    const users = getFromStorage(STORAGE_KEYS.USERS);
    const course = courses.find(c => c.id === courseId);
  
    if (course) {
      const studentDetails = course.students.map(studentId => {
        const student = users.find(u => u.id === studentId);
        return student ? student.fullName : 'N/A';
      });
  
      alert(`Học sinh trong khóa học "${course.title}":\n${studentDetails.join('\n')}`);
    }
  }
  
  function showCourseStudentsModal(courseId) {
    const courses = getFromStorage(STORAGE_KEYS.COURSES);
    const users = getFromStorage(STORAGE_KEYS.USERS);
    const enrollments = getFromStorage(STORAGE_KEYS.ENROLLMENTS) || [];
    const course = courses.find(c => c.id === courseId);
    
    if (!course) {
      alert('Không tìm thấy khóa học!');
      return;
    }
    
    // Lấy danh sách học sinh từ ENROLLMENTS
    const enrolledStudentIds = enrollments
      .filter(e => e.courseId === courseId && e.teacherId === course.teacherId)
      .map(e => e.studentId);
    
    const enrolledStudents = users.filter(user => 
      user.role === 'student' && enrolledStudentIds.includes(user.id)
    );
    
    const allStudents = users.filter(user => user.role === 'student');
    const availableStudents = allStudents.filter(student => 
      !course.students?.includes(student.id)
    );
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
      <div class="modal-content large-modal">
        <div class="modal-header">
          <h3>Quản lý học sinh - ${course.title}</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="students-management">
            <div class="enrolled-students">
              <h4>Học sinh đã đăng ký (${enrolledStudents.length})</h4>
              <div class="students-list">
                ${enrolledStudents.map(student => `
                  <div class="student-item">
                    <div class="student-info">
                      <strong>${student.fullName}</strong>
                      <span class="student-email">${student.email}</span>
                    </div>
                    <button class="btn btn-sm btn-danger remove-student" data-student-id="${student.id}">
                      Xóa khỏi khóa học
                    </button>
                  </div>
                `).join('')}
                ${enrolledStudents.length === 0 ? '<p class="no-data">Chưa có học sinh nào đăng ký</p>' : ''}
              </div>
            </div>
            
            <div class="available-students">
              <h4>Thêm học sinh mới (${availableStudents.length} khả dụng)</h4>
              <div class="students-list">
                ${availableStudents.map(student => `
                  <div class="student-item">
                    <div class="student-info">
                      <strong>${student.fullName}</strong>
                      <span class="student-email">${student.email}</span>
                    </div>
                    <button class="btn btn-sm btn-primary add-student" data-student-id="${student.id}">
                      Thêm vào khóa học
                    </button>
                  </div>
                `).join('')}
                ${availableStudents.length === 0 ? '<p class="no-data">Tất cả học sinh đã được thêm vào khóa học</p>' : ''}
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary close-modal">Đóng</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    document.body.classList.add('modal-open');
    
    // Event listeners
    const closeModal = () => {
      document.body.removeChild(modal);
      document.body.classList.remove('modal-open');
      // Refresh the page to show updated student counts
      const currentRoute = stateManager.getState().currentRoute;
      navigateTo(currentRoute);
    };
    
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.close-modal').addEventListener('click', closeModal);
    
    // Add student
    modal.addEventListener('click', (e) => {
      if (e.target.classList.contains('add-student')) {
        const studentId = e.target.dataset.studentId;
        addStudentToCourse(courseId, studentId);
        closeModal();
      }
    });
    
    // Remove student
    modal.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-student')) {
        const studentId = e.target.dataset.studentId;
        const student = users.find(u => u.id === studentId);
        if (confirm(`Bạn có chắc chắn muốn xóa ${student.fullName} khỏi khóa học này?`)) {
          removeStudentFromCourse(courseId, studentId);
          closeModal();
        }
      }
    });
  }
  
  function addStudentToCourse(courseId, studentId) {
    const courses = getFromStorage(STORAGE_KEYS.COURSES);
    const enrollments = getFromStorage(STORAGE_KEYS.ENROLLMENTS) || [];
    const course = courses.find(c => c.id === courseId);
    
    if (course) {
      // Kiểm tra đã có enrollment chưa
      const existingEnrollment = enrollments.find(
        e => e.studentId === studentId && e.courseId === courseId
      );
      
      if (!existingEnrollment) {
        // Tạo enrollment record
        const newEnrollment = {
          id: generateId(),
          studentId: studentId,
          courseId: courseId,
          teacherId: course.teacherId,
          enrolledAt: new Date().toISOString()
        };
        addToStorage(STORAGE_KEYS.ENROLLMENTS, newEnrollment);
        
        // Cũng cập nhật course.students để tương thích ngược
        if (!course.students) {
          course.students = [];
        }
        if (!course.students.includes(studentId)) {
          course.students.push(studentId);
          updateInStorage(STORAGE_KEYS.COURSES, courseId, course);
        }
        
        // Broadcast course update event
        window.dispatchEvent(new CustomEvent('coursesUpdated', {
          detail: { action: 'student_added', courseId, courseTitle: course.title }
        }));
      }
    }
  }
  
  function removeStudentFromCourse(courseId, studentId) {
    const courses = getFromStorage(STORAGE_KEYS.COURSES);
    const enrollments = getFromStorage(STORAGE_KEYS.ENROLLMENTS) || [];
    const course = courses.find(c => c.id === courseId);
    
    if (course) {
      // Xóa enrollment record
      const enrollment = enrollments.find(
        e => e.studentId === studentId && e.courseId === courseId
      );
      if (enrollment) {
        deleteFromStorage(STORAGE_KEYS.ENROLLMENTS, enrollment.id);
      }
      
      // Cũng cập nhật course.students để tương thích ngược
      if (course.students) {
        course.students = course.students.filter(id => id !== studentId);
        updateInStorage(STORAGE_KEYS.COURSES, courseId, course);
      }
      
      // Broadcast course update event
      window.dispatchEvent(new CustomEvent('coursesUpdated', {
        detail: { action: 'student_removed', courseId, courseTitle: course.title }
      }));
    }
  }

  function showCourseDetails(container, courseId) {
    const courses = getFromStorage(STORAGE_KEYS.COURSES);
    const course = courses.find(c => c.id === courseId);
    
    if (!course) {
      alert('Không tìm thấy khóa học!');
      return;
    }
    
    const lessonsList = course.lessons && course.lessons.length > 0 
      ? course.lessons.map((lesson, index) => `
          <div class="lesson-card">
            <div class="lesson-header">
              <div class="lesson-number">Bài ${index + 1}</div>
              <div class="lesson-duration">⏱️ ${lesson.duration} phút</div>
            </div>
            <h4 class="lesson-title">${lesson.title}</h4>
            <p class="lesson-description">${lesson.description || 'Không có mô tả'}</p>
            <div class="lesson-video">
              <div class="video-thumbnail-large" data-video-url="${lesson.videoUrl}">
                <img src="https://img.youtube.com/vi/${extractYouTubeId(lesson.videoUrl)}/sddefault.jpg" 
                     alt="Video bài học"
                     onerror="this.src='https://via.placeholder.com/400x225?text=Video+Không+Tồn+Tại'">
                <div class="play-button-large">
                  <span>▶️</span>
                  <p>Nhấn để<br>xem video</p>
                </div>
              </div>
            </div>
            <button class="btn btn-primary btn-watch-lesson" data-video-url="${lesson.videoUrl}">📖 Xem bài học</button>
          </div>
        `).join('')
      : '<p class="no-lessons-message">Chưa có bài học nào</p>';
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
      <div class="modal-content large-modal course-details-modal">
        <div class="modal-header">
          <div class="modal-header-content">
            <button class="btn btn-back modal-back">← Quay lại</button>
            <h2>${course.title}</h2>
          </div>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="course-details-header">
            <p class="course-description">${course.description}</p>
            <div class="course-meta">
              <span class="meta-item">📚 ${course.lessons?.length || 0} bài học</span>
              <span class="meta-item">👥 ${course.students?.length || 0} học sinh</span>
            </div>
          </div>
          
          <div class="course-lessons-section">
            <h3>📚 Danh sách bài học</h3>
            <div class="lessons-grid">
              ${lessonsList}
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    document.body.classList.add('modal-open');
    
    const closeModal = () => {
      document.body.removeChild(modal);
      document.body.classList.remove('modal-open');
    };
    
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.modal-back').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    
    // Video play functionality
    modal.addEventListener('click', (e) => {
      const videoThumbnail = e.target.closest('.video-thumbnail-large');
      const watchBtn = e.target.closest('.btn-watch-lesson');
      
      if (videoThumbnail || watchBtn) {
        const videoUrl = videoThumbnail?.dataset.videoUrl || watchBtn?.dataset.videoUrl;
        if (videoUrl) {
          playVideoInModal(videoUrl);
        }
      }
    });
  }
  