import { stateManager } from '../state.js';
import { getFromStorage, STORAGE_KEYS, addToStorage, updateInStorage, deleteFromStorage, generateId } from '../utils.js';
import { navigateTo } from '../routing.js';

export function renderAdminExams() {
    const exams = getFromStorage(STORAGE_KEYS.EXAMS);
    const courses = getFromStorage(STORAGE_KEYS.COURSES);
    const users = getFromStorage(STORAGE_KEYS.USERS);
    const teachers = users.filter(u => u.role === 'teacher');
    const container = document.createElement('div');
    container.className = 'admin-exams';
  
    container.innerHTML = `
      <div class="page-header">
        <h1>Quản lý kỳ thi</h1>
      </div>
  
      <div class="filters-section">
        <div class="filter-group teacher-filter-group">
          <label for="teacher-filter">Lọc theo giáo viên:</label>
          <select id="teacher-filter" class="form-control">
            <option value="">Tất cả giáo viên</option>
            ${teachers.map(teacher => `<option value="${teacher.id}">${teacher.fullName}</option>`).join('')}
          </select>
        </div>
        <div class="exam-type-filter-wrapper">
          <div class="exam-type-tabs" id="exam-type-tabs">
            <button class="exam-type-tab-btn" data-type="" disabled>
              <span class="tab-icon">📚</span>
              <span>Tất cả</span>
            </button>
            <button class="exam-type-tab-btn" data-type="quiz" disabled>
              <span class="tab-icon">🧠</span>
              <span>Quiz ôn tập</span>
            </button>
            <button class="exam-type-tab-btn" data-type="test" disabled>
              <span class="tab-icon">📝</span>
              <span>Bài kiểm tra</span>
            </button>
          </div>
        </div>
      </div>
  
      <div class="exams-grid">
        ${exams.map(exam => {
      const course = courses.find(c => c.id === exam.courseId);
      const teacher = users.find(u => u.id === exam.teacherId);
      const examType = exam.examType || (exam.type || 'test');
      return `
            <div class="exam-card" data-exam-id="${exam.id}" data-exam-type="${examType}" data-teacher-id="${exam.teacherId || ''}">
              <div class="exam-header">
                <h3>${exam.title}</h3>
                <div class="exam-header-actions">
                  <span class="exam-status ${exam.isActive ? 'active' : 'inactive'}">
                    ${exam.isActive ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                  <button class="exam-menu-btn" data-exam-id="${exam.id}">⋮</button>
                </div>
              </div>
              <div class="exam-info">
                <p><strong>Khóa học:</strong> ${course ? course.title : 'N/A'}</p>
                <p><strong>Giáo viên:</strong> ${teacher ? teacher.fullName : 'N/A'}</p>
                <p><strong>Loại:</strong> ${examType === 'practice' || examType === 'quiz' ? 'Quiz' : examType === 'assignment' ? 'Bài tập' : 'Test'}</p>
                <p><strong>Mô tả:</strong> ${exam.description?.substring(0, 100)}${exam.description?.length > 100 ? '...' : 'Không có mô tả'}</p>
                <p><strong>Số câu hỏi:</strong> ${exam.questions?.length}</p>
                <p><strong>Tổng điểm:</strong> ${exam.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0} điểm</p>
              </div>
              <div class="exam-actions">
                <button class="btn btn-sm btn-edit" data-exam-id="${exam.id}">Chỉnh sửa</button>
                <button class="btn btn-sm btn-${exam.isActive ? 'deactivate' : 'activate'}" data-exam-id="${exam.id}">
                  ${exam.isActive ? 'Vô hiệu' : 'Kích hoạt'}
                </button>
                <button class="btn btn-sm btn-delete" data-exam-id="${exam.id}">Xóa</button>
              </div>
            </div>
          `;
    }).join('')}
      </div>
  
      <div id="exam-modal" class="modal" style="display: none;">
        <div class="modal-content large-modal">
          <div class="modal-header">
            <h3 id="exam-modal-title">Chỉnh sửa kỳ thi</h3>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <form id="exam-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="exam-title">Tên kỳ thi:</label>
                  <input type="text" id="exam-title" name="title" required>
                </div>
                <div class="form-group">
                  <label for="exam-course">Khóa học:</label>
                  <select id="exam-course" name="courseId" required>
                    <option value="">Chọn khóa học</option>
                    ${courses.map(course => `<option value="${course.id}">${course.title}</option>`).join('')}
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label for="exam-description">Mô tả:</label>
                <textarea id="exam-description" name="description" rows="3"></textarea>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="exam-start-time">Thời gian bắt đầu:</label>
                  <input type="datetime-local" id="exam-start-time" name="startTime" required>
                </div>
                <div class="form-group">
                  <label for="exam-end-time">Thời gian kết thúc:</label>
                  <input type="datetime-local" id="exam-end-time" name="endTime" required>
                </div>
                <div class="form-group">
                  <label for="exam-duration">Thời lượng (phút):</label>
                  <input type="number" id="exam-duration" name="duration" min="1" required>
                </div>
              </div>
              <div class="questions-section">
                <h4>Câu hỏi</h4>
                <div id="questions-container">
                  <!-- Questions will be added here -->
                </div>
                <button type="button" class="btn btn-secondary" id="add-question-btn">Thêm câu hỏi</button>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="exam-modal-cancel">Hủy</button>
            <button type="button" class="btn btn-primary" id="exam-modal-save">Lưu</button>
          </div>
        </div>
      </div>
    `;
  
    setupAdminExamsEventListeners(container);
    return container;
  }
  
  function setupAdminExamsEventListeners(container) {
    // Filter functionality
    const typeTabs = container.querySelectorAll('.exam-type-tab-btn');
    const teacherFilter = container.querySelector('#teacher-filter');
    let selectedType = '';
    
    function filterExams() {
      const selectedTeacherId = teacherFilter.value;
      
      const examCards = container.querySelectorAll('.exam-card');
      
      examCards.forEach(card => {
        const examType = card.dataset.examType || '';
        const teacherId = card.dataset.teacherId || '';
        
        // Map examType to filter values
        let examTypeValue = '';
        if (examType === 'practice' || examType === 'quiz') {
          examTypeValue = 'quiz';
        } else if (examType === 'assignment') {
          examTypeValue = 'assignment';
        } else if (examType === 'official' || examType === 'test' || !examType) {
          examTypeValue = 'test';
        } else {
          examTypeValue = examType;
        }
        
        // Nếu chưa chọn giáo viên, hiển thị tất cả
        if (!selectedTeacherId) {
          card.style.display = '';
          return;
        }
        
        // Nếu đã chọn giáo viên, lọc theo giáo viên và loại (nếu có)
        const matchesTeacher = teacherId === selectedTeacherId;
        const matchesType = !selectedType || examTypeValue === selectedType;
        
        card.style.display = (matchesTeacher && matchesType) ? '' : 'none';
      });
    }
    
    // Khi chọn giáo viên
    if (teacherFilter) {
      teacherFilter.addEventListener('change', () => {
        const selectedTeacherId = teacherFilter.value;
        
        // Nếu chọn giáo viên, enable filter loại tabs
        if (selectedTeacherId) {
          typeTabs.forEach(tab => {
            tab.disabled = false;
            tab.style.opacity = '1';
            tab.style.cursor = 'pointer';
          });
          // Đảm bảo tab "Tất cả" được active khi chọn giáo viên
          const allTab = container.querySelector('.exam-type-tab-btn[data-type=""]');
          if (allTab && !allTab.classList.contains('active')) {
            typeTabs.forEach(t => t.classList.remove('active'));
            allTab.classList.add('active');
            selectedType = '';
          }
        } else {
          // Nếu chọn "Tất cả giáo viên", disable filter loại và reset về "Tất cả"
          typeTabs.forEach(tab => {
            tab.disabled = true;
            tab.style.opacity = '0.5';
            tab.style.cursor = 'not-allowed';
            tab.classList.remove('active');
          });
          // Kích hoạt tab "Tất cả"
          const allTab = container.querySelector('.exam-type-tab-btn[data-type=""]');
          if (allTab) {
            allTab.classList.add('active');
          }
          selectedType = '';
        }
        
        filterExams();
      });
    }
    
    // Khi click vào tab loại (chỉ hoạt động khi đã chọn giáo viên)
    typeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        if (tab.disabled) return;
        
        // Remove active class from all tabs
        typeTabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Update selected type
        selectedType = tab.dataset.type || '';
        
        filterExams();
      });
    });
    
    // Set tab "Tất cả" active mặc định
    const allTab = container.querySelector('.exam-type-tab-btn[data-type=""]');
    if (allTab) {
      allTab.classList.add('active');
    }
    
    // Action buttons
    container.addEventListener('click', (e) => {
      const target = e.target;
      const examId = target.dataset.examId;
  
      if (target.classList.contains('btn-edit')) {
        editExam(container, examId);
      } else if (target.classList.contains('btn-deactivate') || target.classList.contains('btn-activate')) {
        toggleExamStatus(examId);
        const currentRoute = stateManager.getState().currentRoute;
        navigateTo(currentRoute);
      } else if (target.classList.contains('btn-delete')) {
        if (confirm('Bạn có chắc chắn muốn xóa kỳ thi này?')) {
          deleteExam(examId);
          const currentRoute = stateManager.getState().currentRoute;
          navigateTo(currentRoute);
        }
      }
    });
  }
  
  function showExamModal(container, exam) {
    if (!exam) {
      alert('Không tìm thấy kỳ thi!');
      return;
    }

    const modal = container.querySelector('#exam-modal');
    const form = container.querySelector('#exam-form');
    const title = container.querySelector('#exam-modal-title');
  
    title.textContent = 'Chỉnh sửa kỳ thi';
    form['title'].value = exam.title;
    form['courseId'].value = exam.courseId;
    form['description'].value = exam.description || '';
    form['startTime'].value = new Date(exam.startTime).toISOString().slice(0, 16);
    form['endTime'].value = new Date(exam.endTime).toISOString().slice(0, 16);
    form['duration'].value = exam.duration;
    loadExamQuestions(container, exam.questions || []);
  
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
  
    // Modal event listeners
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('#exam-modal-cancel');
    const saveBtn = modal.querySelector('#exam-modal-save');
    const addQuestionBtn = modal.querySelector('#add-question-btn');
  
    const closeModal = () => {
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
    };
  
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
  
    addQuestionBtn.addEventListener('click', () => {
      addQuestionField(container);
    });
  
    saveBtn.addEventListener('click', () => {
      if (form.checkValidity()) {
        saveExam(form, exam.id);
        closeModal();
        const currentRoute = stateManager.getState().currentRoute;
        navigateTo(currentRoute);
      } else {
        form.reportValidity();
      }
    });
  }
  
  function loadExamQuestions(container, questions) {
    const questionsContainer = container.querySelector('#questions-container');
    questionsContainer.innerHTML = '';
  
    if (questions?.length === 0) {
      addQuestionField(container);
    } else {
      questions.forEach((question, index) => {
        addQuestionField(container, question, index);
      });
    }
  }
  
  function addQuestionField(container, question = null, index = null) {
    const questionsContainer = container.querySelector('#questions-container');
    const questionIndex = index !== null ? index : questionsContainer.children?.length;
  
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-item';
    questionDiv.innerHTML = `
      <div class="question-header">
        <h5>Câu hỏi ${questionIndex + 1}</h5>
        <button type="button" class="btn btn-sm btn-danger remove-question">Xóa</button>
      </div>
      <div class="form-group">
        <label>Câu hỏi:</label>
        <input type="text" class="question-text" value="${question ? question.question : ''}" required>
      </div>
      <div class="form-group">
        <label>Loại câu hỏi:</label>
        <select class="question-type">
          <option value="multiple-choice" ${question && question.type === 'multiple-choice' ? 'selected' : ''}>Trắc nghiệm</option>
          <option value="essay" ${question && question.type === 'essay' ? 'selected' : ''}>Tự luận</option>
          <option value="true-false" ${question && question.type === 'true-false' ? 'selected' : ''}>Đúng/Sai</option>
        </select>
      </div>
      <div class="options-container" style="${question && question.type === 'multiple-choice' ? '' : 'display: none;'}">
        <label>Tùy chọn:</label>
        <div class="options-list">
          ${(question && question.options) ? question.options.map((option, optIndex) => `
            <div class="option-item">
              <input type="text" class="option-text" value="${option}" placeholder="Tùy chọn ${optIndex + 1}">
              <button type="button" class="btn btn-sm btn-danger remove-option">Xóa</button>
            </div>
          `).join('') : `
            <div class="option-item">
              <input type="text" class="option-text" value="" placeholder="Tùy chọn 1">
              <button type="button" class="btn btn-sm btn-danger remove-option">Xóa</button>
            </div>
            <div class="option-item">
              <input type="text" class="option-text" value="" placeholder="Tùy chọn 2">
              <button type="button" class="btn btn-sm btn-danger remove-option">Xóa</button>
            </div>
          `}
        </div>
        <button type="button" class="btn btn-sm btn-secondary add-option">Thêm tùy chọn</button>
      </div>
      <div class="form-group">
        <label>Điểm số:</label>
        <input type="number" class="question-points" value="${question ? question.points : 10}" min="1" required>
      </div>
    `;
  
    questionsContainer.appendChild(questionDiv);
  
    // Event listeners for question
    const removeBtn = questionDiv.querySelector('.remove-question');
    const typeSelect = questionDiv.querySelector('.question-type');
    const addOptionBtn = questionDiv.querySelector('.add-option');
  
    removeBtn.addEventListener('click', () => {
      questionDiv.remove();
      updateQuestionNumbers(container);
    });
  
    typeSelect.addEventListener('change', () => {
      const optionsContainer = questionDiv.querySelector('.options-container');
      optionsContainer.style.display = typeSelect.value === 'multiple-choice' ? 'block' : 'none';
    });
  
    if (addOptionBtn) {
      addOptionBtn.addEventListener('click', () => {
        addOptionToQuestion(questionDiv);
      });
    }
  
    // Remove option buttons
    questionDiv.querySelectorAll('.remove-option').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.option-item').remove();
      });
    });
  
    updateQuestionNumbers(container);
  }
  
  function addOptionToQuestion(questionDiv) {
    const optionsList = questionDiv.querySelector('.options-list');
    const optionCount = optionsList.children?.length + 1;
  
    const optionDiv = document.createElement('div');
    optionDiv.className = 'option-item';
    optionDiv.innerHTML = `
      <input type="text" class="option-text" value="" placeholder="Tùy chọn ${optionCount}">
      <button type="button" class="btn btn-sm btn-danger remove-option">Xóa</button>
    `;
  
    optionsList.appendChild(optionDiv);
  
    optionDiv.querySelector('.remove-option').addEventListener('click', () => {
      optionDiv.remove();
    });
  }
  
  function updateQuestionNumbers(container) {
    const questionItems = container.querySelectorAll('.question-item');
    questionItems.forEach((item, index) => {
      const header = item.querySelector('.question-header h5');
      if (header) {
        header.textContent = `Câu hỏi ${index + 1}`;
      }
    });
  }
  
  // Update points distribution based on total number of questions
  function updatePointsDistribution(container) {
    const questionItems = container.querySelectorAll('.question-item');
    const totalQuestions = questionItems.length;
    
    if (totalQuestions === 0) return;
    
    // Get total points from form input
    const totalPointsInput = document.querySelector('#teacher-exam-total-points');
    const totalPoints = totalPointsInput ? parseFloat(totalPointsInput.value) : 100;
    
    // Calculate points per question (rounded to nearest 0.5)
    const basePointsPerQuestion = totalPoints / totalQuestions;
    const roundedPoints = Math.round(basePointsPerQuestion * 2) / 2; // Round to nearest 0.5
    
    // Update each question's points
    questionItems.forEach((item, index) => {
      const pointsInput = item.querySelector('.points-input');
      if (pointsInput) {
        pointsInput.value = roundedPoints;
      }
    });
    
    // If there's a remainder due to rounding, adjust the last question
    const totalAssigned = roundedPoints * totalQuestions;
    const remainder = totalPoints - totalAssigned;
    
    if (remainder !== 0 && questionItems.length > 0) {
      const lastQuestionPoints = questionItems[questionItems.length - 1].querySelector('.points-input');
      if (lastQuestionPoints) {
        lastQuestionPoints.value = roundedPoints + remainder;
      }
    }
  }
  
  function saveExam(form, examId) {
    if (!examId) {
      alert('Lỗi: Không tìm thấy ID kỳ thi!');
      return;
    }

    const exams = getFromStorage(STORAGE_KEYS.EXAMS) || [];
    const existingExam = exams.find(e => e.id === examId);
    
    if (!existingExam) {
      alert('Không tìm thấy kỳ thi để chỉnh sửa!');
      return;
    }

    const questions = [];
    const questionItems = form.closest('.modal-content').querySelectorAll('.question-item');
  
    questionItems.forEach(item => {
      const questionText = item.querySelector('.question-text').value;
      const questionType = item.querySelector('.question-type').value;
      const questionPoints = parseInt(item.querySelector('.question-points').value);
  
      let question = {
        id: generateId(),
        question: questionText,
        type: questionType,
        points: questionPoints
      };
  
      if (questionType === 'multiple-choice') {
        const options = [];
        item.querySelectorAll('.option-text').forEach(input => {
          if (input.value.trim()) {
            options.push(input.value.trim());
          }
        });
        question.options = options;
        question.correctAnswer = options[0]; // Default to first option
      }
  
      questions.push(question);
    });
  
    const examData = {
      title: form['title'].value,
      description: form['description'].value,
      courseId: form['courseId'].value,
      startTime: form['startTime'].value,
      endTime: form['endTime'].value,
      duration: parseInt(form['duration'].value),
      questions: questions,
      // Giữ nguyên các trường không thay đổi
      isActive: existingExam.isActive,
      createdAt: existingExam.createdAt
    };
  
    updateInStorage(STORAGE_KEYS.EXAMS, examId, examData);
  }
  
  function editExam(container, examId) {
    const exams = getFromStorage(STORAGE_KEYS.EXAMS);
    const exam = exams.find(e => e.id === examId);
    if (exam) {
      showExamModal(container, exam);
    }
  }
  
  function toggleExamStatus(examId) {
    const exams = getFromStorage(STORAGE_KEYS.EXAMS);
    const exam = exams.find(e => e.id === examId);
    if (exam) {
      updateInStorage(STORAGE_KEYS.EXAMS, examId, { isActive: !exam.isActive });
    }
  }
  
  function deleteExam(examId) {
    deleteFromStorage(STORAGE_KEYS.EXAMS, examId);
  }
  