import { stateManager } from '../state.js';
import { navigateTo } from '../routing.js';
import {
  getFromStorage,
  saveToStorage,
  updateInStorage,
  generateId,
  STORAGE_KEYS,
  showModal,
  closeAllModals
} from '../utils.js';

export function renderTeacherExams() {
    // Kiểm tra quyền truy cập
    const currentUser = stateManager.getState().user;
    if (!currentUser || currentUser.role !== 'teacher') {
      navigateTo('/dashboard');
      return document.createElement('div');
    }
    
    const exams = getFromStorage(STORAGE_KEYS.EXAMS);
    const courses = getFromStorage(STORAGE_KEYS.COURSES);
  
    // Filter exams created by current teacher
    let teacherExams = exams.filter(exam => exam.teacherId === currentUser.id);
    const teacherCourses = courses.filter(course => course.teacherId === currentUser.id);
    
    // Đảm bảo tất cả exam đều có examType (mặc định là 'official' nếu không có)
    let hasChanges = false;
    teacherExams.forEach(exam => {
      if (!exam.examType) {
        exam.examType = 'official'; // Mặc định là bài kiểm tra
        hasChanges = true;
      }
    });
    
    // Lưu lại nếu có thay đổi
    if (hasChanges) {
      const allExams = getFromStorage(STORAGE_KEYS.EXAMS);
      teacherExams.forEach(updatedExam => {
        const index = allExams.findIndex(e => e.id === updatedExam.id);
        if (index !== -1) {
          allExams[index] = updatedExam;
        }
      });
      saveToStorage(STORAGE_KEYS.EXAMS, allExams);
      // Reload exams after update
      teacherExams = allExams.filter(exam => exam.teacherId === currentUser.id);
    }
  
    const container = document.createElement('div');
    container.className = 'teacher-exams';
  
    container.innerHTML = `
      <div class="page-header">
        <h1>📋 Quản lý thi trực tuyến</h1>
        <button class="btn btn-primary add-exam-btn">
          <span>➕</span> Tạo bài kiểm tra mới
        </button>
      </div>
      
      <div class="exams-stats">
        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div class="stat-info">
            <div class="stat-number">${teacherExams.length}</div>
            <div class="stat-label">Tổng bài kiểm tra</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🧠</div>
          <div class="stat-info">
            <div class="stat-number">${teacherExams.filter(e => e.examType === 'practice').length}</div>
            <div class="stat-label">Quiz ôn tập</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏁</div>
          <div class="stat-info">
            <div class="stat-number">${teacherExams.filter(e => e.examType === 'official').length}</div>
            <div class="stat-label">Bài kiểm tra</div>
          </div>
        </div>
      </div>
      
      <div class="exams-tabs">
        <button class="tab-btn active" data-tab="practice">
          🧠 Quiz ôn tập
        </button>
        <button class="tab-btn" data-tab="official">
          🏁 Bài kiểm tra
        </button>
      </div>
      
      <!-- Tab: Quiz ôn tập -->
      <div id="practice-exams-tab" class="tab-content active">
        <div class="exams-grid">
        ${teacherExams.filter(e => e.examType === 'practice').length > 0 ? teacherExams.filter(e => e.examType === 'practice').map(exam => {
      const course = courses.find(c => c.id === exam.courseId);
      
      // All exams are immediately available - no time-based status
      let examStatus = exam.isActive ? 'active' : 'inactive';
      let statusText = exam.isActive ? 'Hoạt động' : 'Không hoạt động';
      let statusColor = exam.isActive ? '#52c97f' : '#95a5a6';
  
      return `
            <div class="exam-card" data-exam-id="${exam.id}">
              <div class="exam-header">
                <div class="exam-title-section">
                  <h3 class="exam-title">${exam.title}</h3>
                  <span class="exam-type-badge practice">
                    🧠 Quiz ôn tập
                  </span>
                </div>
                <div class="exam-actions-menu">
                  <span class="exam-status" style="background: ${statusColor}">${statusText}</span>
                </div>
              </div>
              
              <div class="exam-info">
                <div class="info-row">
                  <span class="info-label">📚 Khóa học:</span>
                  <span class="info-value">${course ? course.title : 'Không xác định'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">👥 Học sinh:</span>
                  <span class="info-value">${course?.students?.length || 0} học sinh</span>
                </div>
                <div class="info-row">
                  <span class="info-label">❓ Số câu hỏi:</span>
                  <span class="info-value">${exam.questions?.length || 0} câu</span>
                </div>
                <div class="info-row">
                  <span class="info-label">💯 Tổng điểm:</span>
                  <span class="info-value">${exam.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0} điểm</span>
                </div>
                <div class="info-row">
                  <span class="info-label">📝 Mô tả:</span>
                  <span class="info-value">${exam.description || 'Không có mô tả'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">🔄 Số lần làm:</span>
                  <span class="info-value">${exam.maxAttempts === -1 ? 'Không giới hạn' : exam.maxAttempts + ' lần'}</span>
                </div>
              </div>
              
              <div class="exam-footer">
                <div class="exam-quick-actions">
                  <button class="btn btn-sm btn-outline btn-preview" data-exam-id="${exam.id}" title="Xem trước đề thi">
                    <span>👁️</span> Xem trước
                  </button>
                  <button class="btn btn-sm btn-edit-action btn-edit" data-exam-id="${exam.id}" title="Chỉnh sửa bài kiểm tra">
                    <span>✏️</span> Sửa
                  </button>
                  <button class="btn btn-sm btn-toggle-status ${exam.isActive ? 'btn-deactivate' : 'btn-activate'}" data-exam-id="${exam.id}" title="${exam.isActive ? 'Vô hiệu hóa bài kiểm tra' : 'Kích hoạt bài kiểm tra'}">
                    <span>${exam.isActive ? '⏸️' : '▶️'}</span> ${exam.isActive ? 'Vô hiệu' : 'Kích hoạt'}
                  </button>
                  <button class="btn btn-sm btn-delete-action btn-delete" data-exam-id="${exam.id}" title="Xóa bài kiểm tra">
                    <span>🗑️</span> Xóa
                  </button>
                </div>
              </div>
            </div>
          `;
    }).join('') : `
          <div class="empty-state">
            <div class="empty-icon">🧠</div>
            <h3>Chưa có quiz ôn tập nào</h3>
            <p>Hãy tạo quiz ôn tập đầu tiên để học sinh có thể luyện tập kiến thức.</p>
            <button class="btn btn-primary add-exam-btn">
              <span>➕</span> Tạo quiz ôn tập mới
            </button>
          </div>
        `}
        </div>
      </div>
      
      <!-- Tab: Bài kiểm tra -->
      <div id="official-exams-tab" class="tab-content">
        <div class="exams-grid">
        ${teacherExams.filter(e => e.examType === 'official').length > 0 ? teacherExams.filter(e => e.examType === 'official').map(exam => {
      const course = courses.find(c => c.id === exam.courseId);
      
      // All exams are immediately available - no time-based status
      let examStatus = exam.isActive ? 'active' : 'inactive';
      let statusText = exam.isActive ? 'Hoạt động' : 'Không hoạt động';
      let statusColor = exam.isActive ? '#52c97f' : '#95a5a6';
  
      return `
            <div class="exam-card" data-exam-id="${exam.id}">
              <div class="exam-header">
                <div class="exam-title-section">
                  <h3 class="exam-title">${exam.title}</h3>
                  <span class="exam-type-badge official">
                    🏁 Bài kiểm tra
                  </span>
                </div>
                <div class="exam-actions-menu">
                  <span class="exam-status" style="background: ${statusColor}">${statusText}</span>
                </div>
              </div>
              
              <div class="exam-info">
                <div class="info-row">
                  <span class="info-label">📚 Khóa học:</span>
                  <span class="info-value">${course ? course.title : 'Không xác định'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">👥 Học sinh:</span>
                  <span class="info-value">${course?.students?.length || 0} học sinh</span>
                </div>
                <div class="info-row">
                  <span class="info-label">❓ Số câu hỏi:</span>
                  <span class="info-value">${exam.questions?.length || 0} câu</span>
                </div>
                <div class="info-row">
                  <span class="info-label">💯 Tổng điểm:</span>
                  <span class="info-value">${exam.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0} điểm</span>
                </div>
                <div class="info-row">
                  <span class="info-label">📝 Mô tả:</span>
                  <span class="info-value">${exam.description || 'Không có mô tả'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">🔄 Số lần làm:</span>
                  <span class="info-value">${exam.maxAttempts === -1 ? 'Không giới hạn' : exam.maxAttempts + ' lần'}</span>
                </div>
              </div>
              
              <div class="exam-footer">
                <div class="exam-quick-actions">
                  <button class="btn btn-sm btn-outline btn-preview" data-exam-id="${exam.id}" title="Xem trước đề thi">
                    <span>👁️</span> Xem trước
                  </button>
                  <button class="btn btn-sm btn-edit-action btn-edit" data-exam-id="${exam.id}" title="Chỉnh sửa bài kiểm tra">
                    <span>✏️</span> Sửa
                  </button>
                  <button class="btn btn-sm btn-toggle-status ${exam.isActive ? 'btn-deactivate' : 'btn-activate'}" data-exam-id="${exam.id}" title="${exam.isActive ? 'Vô hiệu hóa bài kiểm tra' : 'Kích hoạt bài kiểm tra'}">
                    <span>${exam.isActive ? '⏸️' : '▶️'}</span> ${exam.isActive ? 'Vô hiệu' : 'Kích hoạt'}
                  </button>
                  <button class="btn btn-sm btn-delete-action btn-delete" data-exam-id="${exam.id}" title="Xóa bài kiểm tra">
                    <span>🗑️</span> Xóa
                  </button>
                </div>
              </div>
            </div>
          `;
    }).join('') : `
          <div class="empty-state">
            <div class="empty-icon">🏁</div>
            <h3>Chưa có bài kiểm tra nào</h3>
            <p>Hãy tạo bài kiểm tra đầu tiên của bạn để kiểm tra kiến thức học sinh.</p>
            <button class="btn btn-primary add-exam-btn">
              <span>➕</span> Tạo bài kiểm tra mới
            </button>
          </div>
        `}
        </div>
      </div>
      
      <!-- Modal tạo/chỉnh sửa kỳ thi -->
      <div id="teacher-exam-modal" class="modal" style="display: none;">
        <div class="modal-content exam-modal-content">
          <div class="modal-header exam-modal-header">
            <h3 id="teacher-exam-modal-title" class="exam-modal-title">
              <span class="exam-modal-title-icon">📝</span>
              <span>Tạo bài kiểm tra mới</span>
            </h3>
            <button class="modal-close exam-modal-close">&times;</button>
          </div>
          <div class="modal-body exam-modal-body">
            <form id="teacher-exam-form">
              <div class="exam-form-section">
                <h4 class="exam-form-section-title">
                  <span class="exam-form-section-icon">📝</span>
                  <span>Thông tin cơ bản</span>
                </h4>
                <div class="form-row">
                  <div class="form-group form-group-spacing">
                    <label for="teacher-exam-title" class="exam-form-label">
                      Tên kỳ thi <span class="required-field">*</span>
                    </label>
                    <input type="text" id="teacher-exam-title" name="title" required 
                           placeholder="VD: Kiểm tra giữa kỳ - Toán học" class="exam-form-input">
                  </div>
                  <div class="form-group form-group-spacing">
                    <label for="teacher-exam-course" class="exam-form-label">
                      Khóa học <span class="required-field">*</span>
                    </label>
                    <select id="teacher-exam-course" name="courseId" required class="exam-form-input">
                      <option value="">Chọn khóa học</option>
                      ${teacherCourses.map(course =>
      `<option value="${course.id}">${course.title}</option>`
    ).join('')}
                    </select>
                  </div>
                </div>
                <div class="form-group form-group-spacing">
                  <label for="teacher-exam-description" class="exam-form-label">Mô tả</label>
                  <textarea id="teacher-exam-description" name="description" rows="3" 
                            placeholder="Mô tả ngắn gọn về nội dung và mục tiêu của kỳ thi..." class="exam-form-textarea"></textarea>
                </div>
                <div class="form-group form-group-spacing">
                  <label for="teacher-exam-type" class="exam-form-label">
                    Loại bài kiểm tra <span class="required-field">*</span>
                  </label>
                  <select id="teacher-exam-type" name="examType" required class="exam-form-input">
                    <option value="official">🏁 Bài kiểm tra</option>
                    <option value="practice">🧠 Quiz ôn tập</option>
                  </select>
                  <small class="exam-form-help">Bài kiểm tra: có giới hạn số lần làm. Quiz ôn tập: không giới hạn, có thể hiện đáp án</small>
                </div>
                <div class="form-row">
                  <div class="form-group form-group-spacing">
                    <label for="teacher-exam-attempts" class="exam-form-label">Số lần làm tối đa</label>
                    <select id="teacher-exam-attempts" name="maxAttempts" class="exam-form-input">
                      <option value="1">1 lần</option>
                      <option value="2">2 lần</option>
                      <option value="3">3 lần</option>
                      <option value="-1">Không giới hạn</option>
                    </select>
                    <small class="exam-form-help" id="attempts-hint">Sẽ tự động cập nhật theo loại bài kiểm tra</small>
                  </div>
                  <div class="form-group form-group-spacing">
                    <label for="teacher-exam-total-points" class="exam-form-label">
                      Tổng điểm <span class="required-field">*</span>
                    </label>
                    <input type="number" id="teacher-exam-total-points" name="totalPoints" min="1" max="10" 
                           value="10" required step="0.5" class="exam-form-input">
                    <small class="exam-form-help" id="total-points-hint">Điểm sẽ được phân bổ đều cho các câu hỏi (tối đa 10 điểm)</small>
                  </div>
                </div>
              </div>
              
              <div class="exam-form-section">
                <div class="questions-header">
                  <h4 class="questions-header-title">
                    <span class="questions-header-icon">❓</span>
                    <span>Câu hỏi trắc nghiệm</span>
                  </h4>
                </div>
                <div class="questions-container" id="questions-container">
                  <!-- Câu hỏi sẽ được thêm vào đây -->
                </div>
                <div class="add-question-container">
                  <button type="button" class="btn btn-primary add-question-btn" id="add-question-btn">
                    <span class="add-question-btn-icon">➕</span>
                    <span>Thêm câu hỏi</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer exam-modal-footer">
            <button type="button" class="btn btn-secondary exam-modal-cancel-btn" id="teacher-exam-modal-cancel">Hủy</button>
            <button type="button" class="btn btn-primary exam-modal-save-btn" id="teacher-exam-modal-save">
              <span class="exam-modal-save-icon">💾</span>
              <span>Lưu kỳ thi</span>
            </button>
          </div>
        </div>
      </div>
    `;
  
    setupTeacherExamsEventListeners(container);
    return container;
  }
  
  // Setup event listeners for teacher exams
  function setupTeacherExamsEventListeners(container) {
    // Tab switching
    const tabButtons = container.querySelectorAll('.tab-btn');
    const tabContents = container.querySelectorAll('.tab-content');
    
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        
        // Update active tab button
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active tab content
        tabContents.forEach(content => content.classList.remove('active'));
        if (targetTab === 'official') {
          container.querySelector('#official-exams-tab').classList.add('active');
        } else if (targetTab === 'practice') {
          container.querySelector('#practice-exams-tab').classList.add('active');
        }
      });
    });
    
    // Add exam button
    const addExamBtns = container.querySelectorAll('.add-exam-btn');
    addExamBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        showTeacherExamModal(container);
      });
    });
  
    // Action buttons
    container.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (!target) return;

      const examId = target.dataset.examId;
      if (!examId) return;

      if (target.classList.contains('btn-edit')) {
        editTeacherExam(container, examId);
      } else if (target.classList.contains('btn-delete')) {
        deleteTeacherExam(container, examId);
      } else if (target.classList.contains('btn-preview')) {
        previewExam(examId);
      } else if (target.classList.contains('btn-preview')) {
        previewExam(examId);
      } else if (target.classList.contains('btn-view-results')) {
        viewExamResults(examId);
      } else if (target.classList.contains('btn-duplicate')) {
        duplicateExam(examId);
      } else if (target.classList.contains('btn-toggle-status')) {
        toggleExamStatus(container, examId);
      }
    });
  
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.exam-actions-menu')) {
        container.querySelectorAll('.actions-dropdown').forEach(d => {
          d.style.display = 'none';
        });
      }
    });
  }
  
  // Show teacher exam modal
  function showTeacherExamModal(container, exam = null) {
    closeAllModals();
  
    const modal = container.querySelector('#teacher-exam-modal');
    const form = container.querySelector('#teacher-exam-form');
    const title = container.querySelector('#teacher-exam-modal-title');
    const questionsContainer = container.querySelector('#questions-container');
  
    if (exam) {
      title.textContent = 'Chỉnh sửa bài kiểm tra';
      form['title'].value = exam.title;
      form['courseId'].value = exam.courseId;
      form['description'].value = exam.description || '';
      form['examType'].value = exam.examType || 'official';
      form['maxAttempts'].value = exam.maxAttempts || 1;
      
      // Update attempts hint based on exam type
      updateAttemptsHint(form['examType'].value);
      
      // Calculate total points from existing questions or use default
      const examType = exam.examType || 'official';
      const defaultPoints = examType === 'official' ? 10 : 100;
      const totalPoints = exam.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || defaultPoints;
      form['totalPoints'].value = totalPoints;
      
      // Update max points based on exam type
      updateMaxPoints(examType);
      
      // Load existing questions
      loadTeacherExamQuestions(questionsContainer, exam.questions || []);
    } else {
      title.textContent = 'Tạo bài kiểm tra mới';
      form.reset();
      form['examType'].value = 'official';
      form['maxAttempts'].value = 1;
      form['totalPoints'].value = 10;
      
      // Update attempts hint and max points based on exam type
      updateAttemptsHint('official');
      updateMaxPoints('official');
  
      // Clear questions and add one default question
      questionsContainer.innerHTML = '';
      addTeacherQuestionField(questionsContainer);
    }
  
    showModal(modal);
  
    // Setup modal event listeners
    setupTeacherExamModalListeners(container, modal, exam);
  }
  
  // Setup modal event listeners
  function setupTeacherExamModalListeners(container, modal, exam) {
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('#teacher-exam-modal-cancel');
    const saveBtn = modal.querySelector('#teacher-exam-modal-save');
    const addQuestionBtn = modal.querySelector('#add-question-btn');
    const questionsContainer = modal.querySelector('#questions-container');
  
    const closeModal = () => {
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
    };
  
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
  
    // Add question button
    addQuestionBtn.addEventListener('click', () => {
      addTeacherQuestionField(questionsContainer);
    });
  
    // Exam type change listener
    const examTypeSelect = modal.querySelector('#teacher-exam-type');
    if (examTypeSelect) {
      examTypeSelect.addEventListener('change', (e) => {
        const examType = e.target.value;
        updateAttemptsBasedOnType(examType, modal);
        updateAttemptsHint(examType);
        updateMaxPoints(examType);
      });
    }
    
    // Total points input change listener
    const totalPointsInput = modal.querySelector('#teacher-exam-total-points');
    if (totalPointsInput) {
      totalPointsInput.addEventListener('input', () => {
        updatePointsDistribution(questionsContainer);
      });
    }
  
    // Save exam button
    saveBtn.addEventListener('click', () => {
      const form = modal.querySelector('#teacher-exam-form');
      
      if (validateTeacherExamForm(form)) {
        saveTeacherExam(form, exam ? exam.id : null);
        closeModal();
        const currentRoute = stateManager.getState().currentRoute;
        navigateTo(currentRoute);
      }
    });
  
    // Handle question removal
    questionsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-question-btn')) {
        const questionDiv = e.target.closest('.question-item');
        if (questionsContainer.children.length > 1) {
          questionDiv.remove();
          updateTeacherQuestionNumbers(questionsContainer);
          updatePointsDistribution(questionsContainer);
        } else {
          alert('Kỳ thi phải có ít nhất 1 câu hỏi!');
        }
      }
    });
  }
  
  // Add question field for teacher exam
  function addTeacherQuestionField(container, question = null) {
    const questionIndex = container.children.length + 1;
    
    // No limit on number of questions - removed 10 question restriction
    
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-item';
    questionDiv.setAttribute('data-question-index', questionIndex);
  
    questionDiv.innerHTML = `
      <div class="question-header">
        <h5>❓ Câu hỏi ${questionIndex}</h5>
        <button type="button" class="remove-question-btn" title="Xóa câu hỏi">×</button>
      </div>
      
      <div class="form-group">
        <label>Nội dung câu hỏi:</label>
        <textarea name="question-text-${questionIndex}" rows="2" required 
                  placeholder="Nhập nội dung câu hỏi...">${question?.text || ''}</textarea>
      </div>
      
      <div class="form-group">
        <label>Các lựa chọn:</label>
        <div class="options-container">
          <div class="option-row">
            <div class="option-radio-wrapper">
              <input type="radio" id="radio-${questionIndex}-0" name="correct-answer-${questionIndex}" value="0" 
                     ${(question?.correctAnswer === 0) ? 'checked' : ''} required>
              <label for="radio-${questionIndex}-0" class="radio-label">A.</label>
            </div>
            <div class="option-input-wrapper">
              <input type="text" id="text-${questionIndex}-0" name="option-${questionIndex}-0" 
                     placeholder="Nhập đáp án A" value="${question?.options?.[0] || ''}" required 
                     class="option-input">
            </div>
          </div>
          <div class="option-row">
            <div class="option-radio-wrapper">
              <input type="radio" id="radio-${questionIndex}-1" name="correct-answer-${questionIndex}" value="1" 
                     ${(question?.correctAnswer === 1) ? 'checked' : ''} required>
              <label for="radio-${questionIndex}-1" class="radio-label">B.</label>
            </div>
            <div class="option-input-wrapper">
              <input type="text" id="text-${questionIndex}-1" name="option-${questionIndex}-1" 
                     placeholder="Nhập đáp án B" value="${question?.options?.[1] || ''}" required 
                     class="option-input">
            </div>
          </div>
          <div class="option-row">
            <div class="option-radio-wrapper">
              <input type="radio" id="radio-${questionIndex}-2" name="correct-answer-${questionIndex}" value="2" 
                     ${(question?.correctAnswer === 2) ? 'checked' : ''} required>
              <label for="radio-${questionIndex}-2" class="radio-label">C.</label>
            </div>
            <div class="option-input-wrapper">
              <input type="text" id="text-${questionIndex}-2" name="option-${questionIndex}-2" 
                     placeholder="Nhập đáp án C" value="${question?.options?.[2] || ''}" required 
                     class="option-input">
            </div>
          </div>
          <div class="option-row">
            <div class="option-radio-wrapper">
              <input type="radio" id="radio-${questionIndex}-3" name="correct-answer-${questionIndex}" value="3" 
                     ${(question?.correctAnswer === 3) ? 'checked' : ''} required>
              <label for="radio-${questionIndex}-3" class="radio-label">D.</label>
            </div>
            <div class="option-input-wrapper">
              <input type="text" id="text-${questionIndex}-3" name="option-${questionIndex}-3" 
                     placeholder="Nhập đáp án D" value="${question?.options?.[3] || ''}" required 
                     class="option-input">
            </div>
          </div>
        </div>
      </div>
      
      <div class="form-group">
        <label>Điểm số:</label>
        <input type="number" name="question-points-${questionIndex}" value="${question?.points || 1}" min="0.5" step="0.5" required class="points-input">
        <small class="form-text text-muted">Điểm sẽ được tự động tính lại khi thay đổi tổng số câu hỏi</small>
      </div>
    `;
  
    container.appendChild(questionDiv);
    updateTeacherQuestionNumbers(container);
    updatePointsDistribution(container);
    
    // Add event listeners for the new question
    setupQuestionEventListeners(questionDiv);
  }
  
  // Setup event listeners for question inputs
  function setupQuestionEventListeners(questionDiv) {
    console.log('=== SETTING UP EVENT LISTENERS ===');
    console.log('Question div:', questionDiv);
    
    // Setup text inputs (option inputs)
    const optionInputs = questionDiv.querySelectorAll('.option-input');
    console.log('Found option inputs:', optionInputs.length);
    
    optionInputs.forEach((input, index) => {
      console.log(`Setting up option input ${index}:`, input.id, input.name);
      
      // Force enable
      input.disabled = false;
      input.readOnly = false;
      input.style.pointerEvents = 'auto';
      input.tabIndex = 0;
      
      // Clear existing listeners
      input.replaceWith(input.cloneNode(true));
      const newInput = questionDiv.querySelectorAll('.option-input')[index];
      
      // Add event listeners to cloned input
      newInput.addEventListener('focus', function() {
        console.log('✅ Option input focused:', this.id);
        this.style.borderColor = '#667eea';
        this.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.2)';
      });
      
      newInput.addEventListener('blur', function() {
        console.log('Option input blurred:', this.id, 'value:', this.value);
      });
      
      newInput.addEventListener('input', function() {
        console.log('✅ Option input changed:', this.id, 'value:', this.value);
      });
      
      newInput.addEventListener('click', function() {
        console.log('Option input clicked:', this.id);
        this.focus();
      });
    });
    
    // Setup radio buttons
    const radioInputs = questionDiv.querySelectorAll('input[type="radio"]');
    console.log('Found radio inputs:', radioInputs.length);
    
    radioInputs.forEach((radio, index) => {
      console.log(`Setting up radio ${index}:`, radio.id, radio.name, radio.value);
      
      // Force enable
      radio.disabled = false;
      radio.style.pointerEvents = 'auto';
      
      // Clear existing listeners
      radio.replaceWith(radio.cloneNode(true));
      const newRadio = questionDiv.querySelectorAll('input[type="radio"]')[index];
      
      // Add event listeners to cloned radio
      newRadio.addEventListener('change', function() {
        console.log('✅ Radio changed:', this.id, 'value:', this.value, 'checked:', this.checked);
        
        // Visual feedback
        const optionRow = this.closest('.option-row');
        const allRows = questionDiv.querySelectorAll('.option-row');
        
        // Remove selected class from all rows
        allRows.forEach(row => row.classList.remove('selected'));
        
        // Add selected class to current row
        if (this.checked) {
          optionRow.classList.add('selected');
          console.log('✅ Added selected class to row');
        }
      });
      
      newRadio.addEventListener('click', function() {
        console.log('✅ Radio clicked:', this.id, this.value);
        this.checked = true;
        this.dispatchEvent(new Event('change', { bubbles: true }));
      });
      
      // Also setup label click
      const label = questionDiv.querySelector(`label[for="${newRadio.id}"]`);
      if (label) {
        label.addEventListener('click', function() {
          console.log('✅ Label clicked for:', newRadio.id);
          newRadio.checked = true;
          newRadio.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }
    });
    
    // Setup textarea
    const textarea = questionDiv.querySelector('textarea');
    if (textarea) {
      console.log('Setting up textarea:', textarea.name);
      textarea.disabled = false;
      textarea.readOnly = false;
      textarea.style.pointerEvents = 'auto';
      
      textarea.addEventListener('focus', function() {
        console.log('✅ Textarea focused:', this.name);
      });
      
      textarea.addEventListener('input', function() {
        console.log('✅ Textarea changed:', this.name, 'value length:', this.value.length);
      });
    }
    
    console.log('=== EVENT LISTENERS SETUP COMPLETED ===');
  }
  
  // Update question numbers for teacher exam
  function updateTeacherQuestionNumbers(container) {
    const questions = container.querySelectorAll('.question-item');
    questions.forEach((question, index) => {
      const header = question.querySelector('.question-header h5');
      header.textContent = `❓ Câu hỏi ${index + 1}`;
  
      // Update radio button names to be unique
      const radios = question.querySelectorAll('input[type="radio"]');
      radios.forEach(radio => {
        radio.name = `correct-answer-${index + 1}`;
      });
    });
  }
  
  // Load exam questions into container for teacher
  function loadTeacherExamQuestions(container, questions) {
    container.innerHTML = '';
    if (questions.length === 0) {
      addTeacherQuestionField(container);
    } else {
      questions.forEach(question => {
        addTeacherQuestionField(container, question);
      });
    }
  }
  
  // Validate teacher exam form
  function validateTeacherExamForm(form) {
    // Basic form validation
    if (!form.checkValidity()) {
      form.reportValidity();
      return false;
    }
  
    // Check if we have at least one question
    const questionsContainer = form.querySelector('#questions-container');
    const questions = questionsContainer.querySelectorAll('.question-item');
  
    if (questions.length === 0) {
      alert('Kỳ thi phải có ít nhất 1 câu hỏi!');
      return false;
    }
  
    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const questionIndex = i + 1;
      const questionText = question.querySelector(`textarea[name="question-text-${questionIndex}"]`);
      const options = question.querySelectorAll(`input[name^="option-${questionIndex}-"]`);
      const correctAnswer = question.querySelector('input[type="radio"]:checked');
  
      if (!questionText || !questionText.value.trim()) {
        alert(`Câu hỏi ${questionIndex}: Vui lòng nhập nội dung câu hỏi!`);
        return false;
      }
  
      // Check if all options are filled
      let emptyOptions = 0;
      options.forEach(option => {
        if (!option.value.trim()) emptyOptions++;
      });
  
      if (emptyOptions > 0) {
        alert(`Câu hỏi ${questionIndex}: Vui lòng điền đầy đủ các lựa chọn!`);
        return false;
      }
  
      if (!correctAnswer) {
        alert(`Câu hỏi ${questionIndex}: Vui lòng chọn đáp án đúng!`);
        return false;
      }
    }
  
    return true;
  }
  
  // Save teacher exam
  function saveTeacherExam(form, examId) {
    const currentUser = stateManager.getState().user;
    const formData = new FormData(form);
  
    // Collect questions data
    const questionsContainer = form.querySelector('#questions-container');
    const questionItems = questionsContainer.querySelectorAll('.question-item');
    const questions = [];
  
    questionItems.forEach((item, index) => {
      const questionIndex = index + 1;
      const questionText = item.querySelector(`textarea[name="question-text-${questionIndex}"]`).value.trim();
      const options = [];
  
      // Collect options
      for (let i = 0; i < 4; i++) {
        const optionInput = item.querySelector(`input[name="option-${questionIndex}-${i}"]`);
        if (optionInput) {
          options.push(optionInput.value.trim());
        }
      }
  
      const correctAnswerRadio = item.querySelector('input[type="radio"]:checked');
      const correctAnswer = correctAnswerRadio ? parseInt(correctAnswerRadio.value) : 0;
      const pointsInput = item.querySelector(`input[name="question-points-${questionIndex}"]`);
      const points = pointsInput ? parseFloat(pointsInput.value) : 1;
  
      questions.push({
        id: examId ? `${examId}-q${index + 1}` : `q${Date.now()}-${index + 1}`,
        text: questionText,
        options: options,
        correctAnswer: correctAnswer,
        points: points
      });
    });
  
    // Set default time values
    const now = new Date();
    const startTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    const endTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  
    const examType = formData.get('examType') || 'official';
    const maxAttempts = parseInt(formData.get('maxAttempts'));
    
    const examData = {
      id: examId || generateId(),
      title: formData.get('title'),
      description: formData.get('description'),
      courseId: formData.get('courseId'),
      teacherId: currentUser.id,
      examType: examType, // 'official' or 'practice'
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: 60, // Default 60 minutes
      maxAttempts: maxAttempts,
      questions: questions,
      isActive: true,
      createdAt: examId ? undefined : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  
    // Remove undefined fields for updates
    if (examId) {
      delete examData.createdAt;
    }
  
    if (examId) {
      updateInStorage(STORAGE_KEYS.EXAMS, examId, examData);
      alert('✅ Kỳ thi đã được cập nhật thành công!');
    } else {
      const exams = getFromStorage(STORAGE_KEYS.EXAMS);
      exams.push(examData);
      saveToStorage(STORAGE_KEYS.EXAMS, exams);
      alert('✅ Kỳ thi mới đã được tạo thành công!');
    }
    
    // Reload page to show exam in correct tab
    const currentRoute = stateManager.getState().currentRoute;
    navigateTo(currentRoute);
  }
  
  // Edit teacher exam
  function editTeacherExam(container, examId) {
    const exams = getFromStorage(STORAGE_KEYS.EXAMS);
    const exam = exams.find(e => e.id === examId);
    if (exam) {
      showTeacherExamModal(container, exam);
    }
  }
  
  // Delete teacher exam
  function toggleExamStatus(container, examId) {
    const exams = getFromStorage(STORAGE_KEYS.EXAMS);
    const exam = exams.find(e => e.id === examId);
    
    if (!exam) {
      alert('Không tìm thấy bài kiểm tra!');
      return;
    }
    
    exam.isActive = !exam.isActive;
    exam.updatedAt = new Date().toISOString();
    
    updateInStorage(STORAGE_KEYS.EXAMS, examId, exam);
    
    alert(`✅ Bài kiểm tra đã được ${exam.isActive ? 'kích hoạt' : 'vô hiệu hóa'} thành công!`);
    
    const currentRoute = stateManager.getState().currentRoute;
    navigateTo(currentRoute);
  }
  
  function deleteTeacherExam(container, examId) {
    const exams = getFromStorage(STORAGE_KEYS.EXAMS);
    const exam = exams.find(e => e.id === examId);
  
    if (!exam) {
      alert('Không tìm thấy kỳ thi!');
      return;
    }
  
    const confirmMessage = `Bạn có chắc chắn muốn xóa kỳ thi "${exam.title}"?\n\n⚠️ Lưu ý: Việc này sẽ xóa:\n\n• Tất cả ${exam.questions?.length || 0} câu hỏi trong kỳ thi\n• Kết quả thi của học sinh\n• Lịch sử làm bài\n\n🚫 Hành động này KHÔNG THỂ HOÀN TÁC!`;
  
    if (confirm(confirmMessage)) {
      const updatedExams = exams.filter(e => e.id !== examId);
      saveToStorage(STORAGE_KEYS.EXAMS, updatedExams);
  
      alert(`✅ Thành công!\n\nKỳ thi "${exam.title}" đã được xóa hoàn toàn khỏi hệ thống.`);
  
      const currentRoute = stateManager.getState().currentRoute;
      navigateTo(currentRoute);
    }
  }
  
  // Preview exam
  function previewExam(examId) {
    const exams = getFromStorage(STORAGE_KEYS.EXAMS);
    const exam = exams.find(e => e.id === examId);
    
    if (!exam) {
      alert('Không tìm thấy bài kiểm tra!');
      return;
    }
    
    if (!exam.questions || exam.questions.length === 0) {
      alert('Bài kiểm tra này chưa có câu hỏi!');
      return;
    }
    
    // Show exam preview interface
    showExamPreviewInterface(exam);
  }
  
  function showExamPreviewInterface(exam) {
    const courses = getFromStorage(STORAGE_KEYS.COURSES);
    const course = courses.find(c => c.id === exam.courseId);
    const totalPoints = exam.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0;
    
    const container = document.createElement('div');
    container.className = 'exam-preview-container';
    
    container.innerHTML = `
      <div class="exam-preview-header">
        <div class="exam-info">
          <h1>👁️ Xem trước: ${exam.title}</h1>
          <div class="exam-meta">
            <span class="meta-item">📚 ${course ? course.title : 'N/A'}</span>
            <span class="meta-item">❓ ${exam.questions.length} câu hỏi</span>
            <span class="meta-item">💯 ${totalPoints} điểm</span>
            <span class="meta-item">🔄 ${exam.maxAttempts === -1 ? 'Không giới hạn' : exam.maxAttempts + ' lần'}</span>
          </div>
          <p class="exam-description">${exam.description || 'Không có mô tả'}</p>
        </div>
        <button class="btn btn-secondary" id="close-preview">← Quay lại</button>
      </div>
      
      <div class="exam-preview-content">
        <div class="questions-preview" id="exam-questions-preview">
          ${exam.questions.map((question, index) => {
            // Handle both old and new question formats
            let correctAnswerIndex;
            if (typeof question.correctAnswer === 'string') {
              correctAnswerIndex = question.options.indexOf(question.correctAnswer);
            } else {
              correctAnswerIndex = question.correctAnswer;
            }
            
            return `
              <div class="question-preview-card" data-question-index="${index}">
                <div class="question-preview-header">
                  <span class="question-number">Câu ${index + 1}</span>
                  <span class="question-points">${question.points || 1} điểm</span>
                  <span class="correct-answer-badge">✓ Đáp án đúng: ${String.fromCharCode(65 + correctAnswerIndex)}</span>
                </div>
                <div class="question-preview-text">
                  ${question.text || question.question}
                </div>
                <div class="question-preview-options">
                  ${question.options ? question.options.map((option, optIndex) => {
                    const isCorrect = optIndex === correctAnswerIndex;
                    return `
                      <div class="option-preview ${isCorrect ? 'correct-answer' : ''}">
                        <span class="option-letter">${String.fromCharCode(65 + optIndex)}.</span>
                        <span class="option-text">${option}</span>
                        ${isCorrect ? '<span class="correct-mark">✓</span>' : ''}
                      </div>
                    `;
                  }).join('') : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    
    // Replace current content with preview interface
    const mainContent = document.querySelector('.content');
    if (mainContent) {
      mainContent.innerHTML = '';
      mainContent.appendChild(container);
    } else {
      console.error('Could not find main content area');
    }
    
    // Close preview button
    const closeBtn = container.querySelector('#close-preview');
    closeBtn.addEventListener('click', () => {
      const currentRoute = stateManager.getState().currentRoute;
      navigateTo(currentRoute);
    });
  }
  
  // Duplicate exam
  function duplicateExam(examId) {
    const exams = getFromStorage(STORAGE_KEYS.EXAMS);
    const exam = exams.find(e => e.id === examId);
  
    if (exam) {
      const duplicatedExam = {
        ...exam,
        id: generateId(),
        title: exam.title + ' (Sao chép)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
  
      exams.push(duplicatedExam);
      saveToStorage(STORAGE_KEYS.EXAMS, exams);
  
      alert('✅ Kỳ thi đã được sao chép thành công!');
  
      const currentRoute = stateManager.getState().currentRoute;
      navigateTo(currentRoute);
    }
  }
  
// Update attempts based on exam type
function updateAttemptsBasedOnType(examType, modal) {
  const maxAttemptsSelect = modal.querySelector('#teacher-exam-attempts');
  if (!maxAttemptsSelect) return;
  
  if (examType === 'official') {
    // Bài kiểm tra: mặc định 1-2 lần
    maxAttemptsSelect.value = '1';
  } else if (examType === 'practice') {
    // Quiz ôn tập: không giới hạn
    maxAttemptsSelect.value = '-1';
  }
}

// Update max points based on exam type
function updateMaxPoints(examType) {
  const totalPointsInput = document.querySelector('#teacher-exam-total-points');
  const totalPointsHint = document.querySelector('#total-points-hint');
  
  if (!totalPointsInput) return;
  
  if (examType === 'official') {
    // Bài kiểm tra: tối đa 10 điểm
    totalPointsInput.max = 10;
    if (parseFloat(totalPointsInput.value) > 10) {
      totalPointsInput.value = 10;
    }
    if (totalPointsHint) {
      totalPointsHint.textContent = 'Điểm sẽ được phân bổ đều cho các câu hỏi (tối đa 10 điểm)';
    }
  } else if (examType === 'practice') {
    // Quiz ôn tập: tối đa 100 điểm
    totalPointsInput.max = 100;
    if (totalPointsHint) {
      totalPointsHint.textContent = 'Điểm sẽ được phân bổ đều cho các câu hỏi (tối đa 100 điểm)';
    }
  }
}

// Update attempts hint text
function updateAttemptsHint(examType) {
  const hint = document.querySelector('#attempts-hint');
  if (!hint) return;
  
  if (examType === 'official') {
    hint.textContent = 'Bài kiểm tra: thường 1-2 lần';
  } else if (examType === 'practice') {
    hint.textContent = 'Quiz ôn tập: không giới hạn số lần làm';
  }
}

// Update points distribution when total points or number of questions changes
function updatePointsDistribution(container) {
  const totalPointsInput = document.querySelector('#teacher-exam-total-points');
  if (!totalPointsInput) return;
  
  const totalPoints = parseFloat(totalPointsInput.value) || 10;
  const questions = container.querySelectorAll('.question-item');
  const questionCount = questions.length;
  
  if (questionCount === 0) return;
  
  const pointsPerQuestion = totalPoints / questionCount;
  
  questions.forEach(question => {
    const pointsInput = question.querySelector('.points-input');
    if (pointsInput) {
      pointsInput.value = pointsPerQuestion.toFixed(2);
    }
  });
}

// View exam details
function viewExamDetails(examId) {
  const exams = getFromStorage(STORAGE_KEYS.EXAMS);
  const exam = exams.find(e => e.id === examId);
  const courses = getFromStorage(STORAGE_KEYS.COURSES);
  const course = courses.find(c => c.id === exam?.courseId);
  const results = getFromStorage(STORAGE_KEYS.EXAM_RESULTS) || [];
  const examResults = results.filter(r => r.examId === examId);
  
  if (!exam) {
    alert('Không tìm thấy bài kiểm tra!');
    return;
  }
  
  const totalPoints = exam.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0;
  const totalStudents = course?.students?.length || 0;
  const completedStudents = examResults.length;
  const avgScore = examResults.length > 0 
    ? (examResults.reduce((sum, r) => sum + r.score, 0) / examResults.length).toFixed(2)
    : 0;
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal large-modal">
      <div class="modal-header">
        <h3>📊 Chi tiết bài kiểm tra: ${exam.title}</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="exam-details-section">
          <h4>📝 Thông tin cơ bản</h4>
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">Khóa học:</span>
              <span class="detail-value">${course ? course.title : 'N/A'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Mô tả:</span>
              <span class="detail-value">${exam.description || 'Không có mô tả'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Số câu hỏi:</span>
              <span class="detail-value">${exam.questions?.length || 0} câu</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Tổng điểm:</span>
              <span class="detail-value">${totalPoints} điểm</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Số lần làm:</span>
              <span class="detail-value">${exam.maxAttempts === -1 ? 'Không giới hạn' : exam.maxAttempts + ' lần'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Trạng thái:</span>
              <span class="detail-value">${exam.isActive ? 'Hoạt động' : 'Không hoạt động'}</span>
            </div>
          </div>
        </div>
        
        <div class="exam-details-section">
          <h4>📈 Thống kê</h4>
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-value">${totalStudents}</div>
              <div class="stat-label">Tổng số học sinh</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${completedStudents}</div>
              <div class="stat-label">Đã làm bài</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${avgScore}/${totalPoints}</div>
              <div class="stat-label">Điểm trung bình</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${totalStudents > 0 ? ((completedStudents / totalStudents) * 100).toFixed(1) : 0}%</div>
              <div class="stat-label">Tỷ lệ hoàn thành</div>
            </div>
          </div>
        </div>
        
        <div class="exam-details-section">
          <h4>📋 Danh sách câu hỏi</h4>
          <div class="questions-list">
            ${exam.questions?.map((question, index) => {
              let correctAnswerIndex;
              if (typeof question.correctAnswer === 'string') {
                correctAnswerIndex = question.options.indexOf(question.correctAnswer);
              } else {
                correctAnswerIndex = question.correctAnswer;
              }
              
              return `
                <div class="question-detail-item">
                  <div class="question-detail-header">
                    <span class="question-number">Câu ${index + 1}</span>
                    <span class="question-points">${question.points || 1} điểm</span>
                  </div>
                  <div class="question-detail-text">${question.text || question.question}</div>
                  <div class="question-detail-options">
                    ${question.options?.map((option, optIndex) => {
                      const isCorrect = optIndex === correctAnswerIndex;
                      return `
                        <div class="option-detail ${isCorrect ? 'correct' : ''}">
                          ${String.fromCharCode(65 + optIndex)}. ${option}
                          ${isCorrect ? ' <span class="correct-mark">✓</span>' : ''}
                        </div>
                      `;
                    }).join('') || ''}
                  </div>
                </div>
              `;
            }).join('') || 'Chưa có câu hỏi'}
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-primary" id="preview-exam-btn">👁️ Xem trước đề thi</button>
          <button class="btn btn-secondary modal-close-btn">Đóng</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Event listeners
  modal.querySelector('.modal-close').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  modal.querySelector('.modal-close-btn').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  modal.querySelector('#preview-exam-btn').addEventListener('click', () => {
    document.body.removeChild(modal);
    previewExam(examId);
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

// View exam results
function viewExamResults(examId) {
  alert('Chức năng xem kết quả thi đang được phát triển. ID: ' + examId);
}