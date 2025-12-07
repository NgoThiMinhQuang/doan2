import { stateManager } from '../state.js';
import { navigateTo } from '../routing.js';
import {
  getFromStorage,
  saveToStorage,
  generateId,
  STORAGE_KEYS
} from '../utils.js';

export function renderStudentExams() {
    const currentUser = stateManager.getState().user;
    const courses = getFromStorage(STORAGE_KEYS.COURSES);
    const exams = getFromStorage(STORAGE_KEYS.EXAMS);
    const examResults = getFromStorage(STORAGE_KEYS.EXAM_RESULTS) || [];
  
    // Get exams for courses the student is enrolled in
    const myCourses = courses.filter(course => course.students?.includes(currentUser.id));
    const myExams = exams.filter(exam => {
      const course = myCourses.find(course => course.id === exam.courseId);
      // Đảm bảo bài thi thuộc khóa học đã đăng ký và do giáo viên của khóa học đó tạo
      return course && exam.teacherId === course.teacherId;
    });
  
    const container = document.createElement('div');
    container.className = 'student-exams';
  
    container.innerHTML = `
      <div class="page-header">
        <h1>Thi trực tuyến</h1>
      </div>
      
      <div class="exams-tabs">
        <button class="tab-btn active" data-tab="official">
          Kỳ thi chính thức
        </button>
        <button class="tab-btn" data-tab="practice">
          Quiz ôn tập
        </button>
      </div>
  
      <!-- Tab: Kỳ thi chính thức -->
      <div id="official-exams-tab" class="tab-content active">
        <div class="exams-list">
        ${myExams.filter(e => e.examType === 'official' || !e.examType).length > 0 ? 
          myExams.filter(e => e.examType === 'official' || !e.examType).map(exam => {
            const course = courses.find(c => c.id === exam.courseId);
            
            // Check if student has taken this exam
            const hasResult = examResults.some(result => 
              result.examId === exam.id && result.studentId === currentUser.id
            );
            
            let statusText = hasResult ? 'Đã làm' : 'Sẵn sàng';
            let statusClass = hasResult ? 'completed' : 'available';
            let actionButton = hasResult ? 
              `<button class="btn btn-sm btn-view-results" data-exam-id="${exam.id}">Xem kết quả</button>` :
              `<button class="btn btn-sm btn-take-exam" data-exam-id="${exam.id}">Vào thi</button>`;

            return `
              <div class="exam-card ${hasResult ? 'completed' : ''}" data-exam-id="${exam.id}">
              <div class="exam-header">
                <h3>${exam.title}</h3>
                <span class="exam-status ${statusClass}">${statusText}</span>
              </div>
                <div class="exam-info">
                  <p><strong>📚 Khóa học:</strong> ${course ? course.title : 'N/A'}</p>
                  <p><strong>📝 Mô tả:</strong> ${exam.description ? (exam.description.substring(0, 120) + (exam.description.length > 120 ? '...' : '')) : 'Không có mô tả'}</p>
                  <p><strong>❓ Số câu hỏi:</strong> ${exam.questions?.length || 0} câu</p>
                  <p><strong>💯 Tổng điểm:</strong> ${exam.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0} điểm</p>
                </div>
                <div class="exam-actions">
                  ${actionButton}
                </div>
              </div>
            `;
          }).join('') : 
          `<div class="empty-state">
            <div class="empty-icon">🏁</div>
            <h3>Chưa có kỳ thi chính thức nào</h3>
            <p>Hiện tại chưa có kỳ thi chính thức nào được tạo. Hãy kiểm tra lại sau!</p>
          </div>`
        }
        </div>
      </div>
      
      <!-- Tab: Quiz ôn tập -->
      <div id="practice-exams-tab" class="tab-content">
        <div class="exams-list">
        ${myExams.filter(e => e.examType === 'practice').length > 0 ? 
          myExams.filter(e => e.examType === 'practice').map(exam => {
            const course = courses.find(c => c.id === exam.courseId);
            
            // Check if student has taken this quiz
            const hasResult = examResults.some(result => 
              result.examId === exam.id && result.studentId === currentUser.id
            );
            
            let statusText = hasResult ? 'Đã làm' : 'Sẵn sàng';
            let statusClass = hasResult ? 'completed' : 'available';
            let actionButton = `<button class="btn btn-sm btn-take-exam" data-exam-id="${exam.id}">Làm quiz</button>`;
            
            // For practice exams, always show both buttons if has result
            if (hasResult) {
              actionButton += ` <button class="btn btn-sm btn-view-results" data-exam-id="${exam.id}">Xem kết quả</button>`;
            }

            return `
              <div class="exam-card ${hasResult ? 'completed' : ''}" data-exam-id="${exam.id}">
              <div class="exam-header">
                <h3>${exam.title}</h3>
                <span class="exam-status ${statusClass}">${statusText}</span>
              </div>
                <div class="exam-info">
                  <p><strong>📚 Khóa học:</strong> ${course ? course.title : 'N/A'}</p>
                  <p><strong>📝 Mô tả:</strong> ${exam.description ? (exam.description.substring(0, 120) + (exam.description.length > 120 ? '...' : '')) : 'Không có mô tả'}</p>
                  <p><strong>❓ Số câu hỏi:</strong> ${exam.questions?.length || 0} câu</p>
                  <p><strong>💯 Tổng điểm:</strong> ${exam.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0} điểm</p>
                  <p><strong>💡 Lưu ý:</strong> Quiz ôn tập có thể làm nhiều lần, đáp án sẽ hiện sau khi nộp bài</p>
                </div>
                <div class="exam-actions">
                  ${actionButton}
                </div>
              </div>
            `;
          }).join('') : 
          `<div class="empty-state">
            <div class="empty-icon">🧠</div>
            <h3>Chưa có quiz ôn tập nào</h3>
            <p>Hiện tại chưa có quiz ôn tập nào được tạo. Hãy kiểm tra lại sau!</p>
          </div>`
        }
        </div>
      </div>
    `;
  
    setupStudentExamsEventListeners(container);
    return container;
  }
  
  function setupStudentExamsEventListeners(container) {
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
    
    // Action buttons
    container.addEventListener('click', (e) => {
      const target = e.target;
      const examId = target.dataset.examId;
  
      if (target.classList.contains('btn-take-exam')) {
        takeExam(examId);
      } else if (target.classList.contains('btn-view-exam')) {
        viewExamDetails(examId);
      } else if (target.classList.contains('btn-view-results')) {
        viewExamResults(examId);
      }
    });
  }
  
  function takeExam(examId) {
    const currentUser = stateManager.getState().user;
    const exams = getFromStorage(STORAGE_KEYS.EXAMS);
    const exam = exams.find(e => e.id === examId);
    
    if (!exam) {
      alert('Không tìm thấy bài kiểm tra!');
      return;
    }
    
    if (!exam.isActive) {
      alert('Bài kiểm tra này hiện không hoạt động!');
      return;
    }
    
    if (!exam.questions || exam.questions.length === 0) {
      alert('Bài kiểm tra này chưa có câu hỏi!');
      return;
    }
    
    // Kiểm tra số lần làm cho kỳ thi chính thức
    const examType = exam.examType || 'official';
    if (examType === 'official' && exam.maxAttempts > 0) {
      const results = getFromStorage(STORAGE_KEYS.EXAM_RESULTS) || [];
      const userAttempts = results.filter(r => 
        r.examId === examId && r.studentId === currentUser.id
      ).length;
      
      if (userAttempts >= exam.maxAttempts) {
        alert(`Bạn đã hết lượt làm bài!\n\nSố lần làm tối đa: ${exam.maxAttempts}\nSố lần đã làm: ${userAttempts}`);
        return;
      }
    }
    
    // Show exam taking interface
    showExamTakingInterface(exam);
  }
  
  function showExamTakingInterface(exam) {
    const courses = getFromStorage(STORAGE_KEYS.COURSES);
    const course = courses.find(c => c.id === exam.courseId);
    const totalPoints = exam.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0;
    
    const container = document.createElement('div');
    container.className = 'exam-taking-container';
    
    container.innerHTML = `
      <div class="exam-taking-header">
        <div class="exam-info">
          <h1>📝 ${exam.title}</h1>
          <div class="exam-meta">
            <span class="meta-item">📚 ${course ? course.title : 'N/A'}</span>
            <span class="meta-item">❓ ${exam.questions.length} câu hỏi</span>
            <span class="meta-item">💯 ${totalPoints} điểm</span>
          </div>
        </div>
        <div class="exam-timer">
          <div class="timer-display" id="exam-timer">⏱️ Không giới hạn thời gian</div>
        </div>
      </div>
      
      <div class="exam-content">
        <div class="questions-container" id="exam-questions">
          ${exam.questions.map((question, index) => `
            <div class="question-card" data-question-index="${index}">
              <div class="question-header">
                <span class="question-number">Câu ${index + 1}</span>
                <span class="question-points">${question.points || 1} điểm</span>
              </div>
              <div class="question-text">
                ${question.text || question.question}
              </div>
              <div class="question-options">
                ${question.options ? question.options.map((option, optIndex) => `
                  <label class="option-label">
                    <input type="radio" name="question-${index}" value="${optIndex}" class="option-input">
                    <span class="option-text">${String.fromCharCode(65 + optIndex)}. ${option}</span>
                  </label>
                `).join('') : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="exam-footer">
        <div class="exam-progress">
          <span id="progress-text">0/${exam.questions.length} câu đã trả lời</span>
          <div class="progress-bar">
            <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
          </div>
        </div>
        <div class="exam-actions">
          <button type="button" class="btn btn-secondary" id="exit-exam">Thoát</button>
          <button type="button" class="btn btn-primary" id="submit-exam">Nộp bài</button>
        </div>
      </div>
    `;
    
    // Replace current content with exam interface
    const mainContent = document.querySelector('.content');
    if (mainContent) {
      mainContent.innerHTML = '';
      mainContent.appendChild(container);
    } else {
      console.error('Could not find main content area');
    }
    
    // Ẩn chatbot khi đang làm bài
    import('../components/Chatbot.js').then(({ toggleChatbotVisibility }) => {
      toggleChatbotVisibility(true);
    });
    
    // Setup exam taking event listeners
    setupExamTakingListeners(exam);
  }
  
  function setupExamTakingListeners(exam) {
    const questionsContainer = document.getElementById('exam-questions');
    const progressText = document.getElementById('progress-text');
    const progressFill = document.getElementById('progress-fill');
    const submitBtn = document.getElementById('submit-exam');
    const exitBtn = document.getElementById('exit-exam');
    
    // Track answered questions
    function updateProgress() {
      const totalQuestions = exam.questions.length;
      const answeredQuestions = questionsContainer.querySelectorAll('input[type="radio"]:checked').length;
      const percentage = (answeredQuestions / totalQuestions) * 100;
      
      progressText.textContent = `${answeredQuestions}/${totalQuestions} câu đã trả lời`;
      progressFill.style.width = `${percentage}%`;
      
      // Enable submit button when all questions are answered
      if (answeredQuestions === totalQuestions) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Nộp bài';
      } else {
        submitBtn.disabled = true;
        submitBtn.textContent = `Nộp bài (${totalQuestions - answeredQuestions} câu chưa trả lời)`;
      }
    }
    
    // Listen for answer changes
    questionsContainer.addEventListener('change', updateProgress);
    
    // Submit exam
    submitBtn.addEventListener('click', () => {
      const totalQuestions = exam.questions.length;
      const answeredQuestions = questionsContainer.querySelectorAll('input[type="radio"]:checked').length;
      
      if (answeredQuestions < totalQuestions) {
        const unanswered = totalQuestions - answeredQuestions;
        if (!confirm(`Bạn còn ${unanswered} câu chưa trả lời. Bạn có chắc chắn muốn nộp bài?`)) {
          return;
        }
      }
      
      submitExam(exam);
    });
    
    // Exit exam
    exitBtn.addEventListener('click', () => {
      if (confirm('Bạn có chắc chắn muốn thoát? Kết quả sẽ không được lưu.')) {
        // Hiện lại chatbot khi thoát
        import('../components/Chatbot.js').then(({ toggleChatbotVisibility }) => {
          toggleChatbotVisibility(false);
        });
        const currentRoute = stateManager.getState().currentRoute;
        navigateTo('/student/exams');
      }
    });
    
    // Initial progress update
    updateProgress();
  }
  
  function submitExam(exam) {
    const currentUser = stateManager.getState().user;
    const questionsContainer = document.getElementById('exam-questions');
    const answers = [];
    let totalScore = 0;
    let correctAnswers = 0;
    
    // Collect answers and calculate score
    exam.questions.forEach((question, index) => {
      const selectedOption = questionsContainer.querySelector(`input[name="question-${index}"]:checked`);
      const selectedValue = selectedOption ? parseInt(selectedOption.value) : null;
      
      // Handle both old and new question formats
      let correctAnswerIndex;
      if (typeof question.correctAnswer === 'string') {
        // Old format: correctAnswer is the actual text
        correctAnswerIndex = question.options.indexOf(question.correctAnswer);
      } else {
        // New format: correctAnswer is already an index
        correctAnswerIndex = question.correctAnswer;
      }
      
      const isCorrect = selectedValue === correctAnswerIndex;
      
      if (isCorrect) {
        correctAnswers++;
        totalScore += question.points || 1;
      }
      
      answers.push({
        questionId: question.id,
        questionText: question.text || question.question,
        selectedOption: selectedValue,
        correctOption: correctAnswerIndex,
        isCorrect: isCorrect,
        points: isCorrect ? (question.points || 1) : 0,
        maxPoints: question.points || 1
      });
    });
    
    const maxScore = exam.questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const percentage = (totalScore / maxScore) * 100;
    
    // Save exam result
    const examResult = {
      id: generateId(),
      examId: exam.id,
      examTitle: exam.title,
      studentId: currentUser.id,
      studentName: currentUser.fullName,
      courseId: exam.courseId,
      answers: answers,
      totalScore: totalScore,
      maxScore: maxScore,
      percentage: percentage,
      correctAnswers: correctAnswers,
      totalQuestions: exam.questions.length,
      submittedAt: new Date().toISOString(),
      timeSpent: 0 // Could implement timer later
    };
    
    // Save to storage
    const results = getFromStorage(STORAGE_KEYS.EXAM_RESULTS) || [];
    results.push(examResult);
    saveToStorage(STORAGE_KEYS.EXAM_RESULTS, results);
    
    // Show results
    showExamResults(examResult);
  }
  
  function showExamResults(result) {
    const exams = getFromStorage(STORAGE_KEYS.EXAMS);
    const exam = exams.find(e => e.id === result.examId);
    const examType = exam?.examType || 'official';
    const isPractice = examType === 'practice';
    
    const container = document.createElement('div');
    container.className = 'exam-results-container';
    
    const grade = result.percentage >= 80 ? 'Xuất sắc' : 
                  result.percentage >= 70 ? 'Giỏi' : 
                  result.percentage >= 60 ? 'Khá' : 
                  result.percentage >= 50 ? 'Trung bình' : 'Yếu';
    
    const gradeColor = result.percentage >= 80 ? '#27ae60' : 
                       result.percentage >= 70 ? '#2ecc71' : 
                       result.percentage >= 60 ? '#f39c12' : 
                       result.percentage >= 50 ? '#e67e22' : '#e74c3c';
    
    container.innerHTML = `
      <div class="results-header">
        <div class="results-icon">${isPractice ? '🧠' : '🎉'}</div>
        <h1>Kết quả ${isPractice ? 'quiz ôn tập' : 'bài thi'}</h1>
        <h2>${result.examTitle}</h2>
      </div>
      
      <div class="results-summary">
        <div class="score-card">
          <div class="score-main">
            <span class="score-number">${result.totalScore}</span>
            <span class="score-max">/${result.maxScore}</span>
          </div>
          <div class="score-percentage">${result.percentage.toFixed(1)}%</div>
          <div class="score-grade" style="color: ${gradeColor}">${grade}</div>
        </div>
        
        <div class="results-stats">
          <div class="stat-item">
            <span class="stat-label">Đúng:</span>
            <span class="stat-value correct">${result.correctAnswers}/${result.totalQuestions}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Sai:</span>
            <span class="stat-value incorrect">${result.totalQuestions - result.correctAnswers}/${result.totalQuestions}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Thời gian nộp:</span>
            <span class="stat-value">${new Date(result.submittedAt).toLocaleString('vi-VN')}</span>
          </div>
        </div>
      </div>
      
      <div class="results-details">
        <h3>Chi tiết từng câu ${isPractice ? '(Đáp án đã hiển thị)' : ''}</h3>
        <div class="answers-review">
          ${result.answers.map((answer, index) => {
            // Lấy thông tin đáp án đúng từ exam
            const question = exam?.questions?.find(q => q.id === answer.questionId);
            const correctOptionText = question?.options?.[answer.correctOption] || '';
            const selectedOptionText = answer.selectedOption !== null ? (question?.options?.[answer.selectedOption] || '') : '';
            
            return `
            <div class="answer-item ${answer.isCorrect ? 'correct' : 'incorrect'}">
              <div class="answer-header">
                <span class="answer-number">Câu ${index + 1}</span>
                <span class="answer-points">${answer.points}/${answer.maxPoints} điểm</span>
                <span class="answer-status">${answer.isCorrect ? '✅ Đúng' : '❌ Sai'}</span>
              </div>
              <div class="answer-question">${answer.questionText}</div>
              <div class="answer-info">
                <div class="selected-answer">
                  <strong>Bạn chọn:</strong> ${answer.selectedOption !== null ? `${String.fromCharCode(65 + answer.selectedOption)}. ${selectedOptionText}` : 'Không trả lời'}
                </div>
                <div class="correct-answer">
                  <strong>Đáp án đúng:</strong> ${String.fromCharCode(65 + answer.correctOption)}. ${correctOptionText}
                </div>
              </div>
            </div>
          `;
          }).join('')}
        </div>
      </div>
      
      <div class="results-actions">
        <button type="button" class="btn btn-secondary" id="view-exams">Về danh sách</button>
        ${isPractice ? `
          <button type="button" class="btn btn-primary" id="retake-exam">Làm lại quiz</button>
        ` : `
          <button type="button" class="btn btn-primary" id="retake-exam">Thi lại</button>
        `}
      </div>
    `;
    
    // Replace current content with results
    const mainContent = document.querySelector('.content');
    if (mainContent) {
      mainContent.innerHTML = '';
      mainContent.appendChild(container);
    } else {
      console.error('Could not find main content area for results');
    }
    
    // Hiện lại chatbot sau khi nộp bài
    import('../components/Chatbot.js').then(({ toggleChatbotVisibility }) => {
      toggleChatbotVisibility(false);
    });
    
    // Setup results event listeners
    document.getElementById('view-exams').addEventListener('click', () => {
      navigateTo('/student/exams');
    });
    
    document.getElementById('retake-exam').addEventListener('click', () => {
      takeExam(result.examId);
    });
  }
  
  function viewExamDetails(examId) {
    const exams = getFromStorage(STORAGE_KEYS.EXAMS);
    const courses = getFromStorage(STORAGE_KEYS.COURSES);
    const exam = exams.find(e => e.id === examId);
    const course = courses.find(c => c.id === exam.courseId);
  
    if (exam) {
      const totalPoints = exam.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0;
      const message = `
        Chi tiết kỳ thi: ${exam.title}
  
        Khóa học: ${course ? course.title : 'N/A'}
        Mô tả: ${exam.description || 'Không có mô tả'}
        Số câu hỏi: ${exam.questions?.length || 0}
        Tổng điểm: ${totalPoints} điểm
        Trạng thái: ${exam.isActive ? 'Hoạt động' : 'Không hoạt động'}
      `;
      alert(message);
    }
  }
  
  function viewExamResults(examId) {
    const currentUser = stateManager.getState().user;
    const examResults = getFromStorage(STORAGE_KEYS.EXAM_RESULTS) || [];
    const exams = getFromStorage(STORAGE_KEYS.EXAMS) || [];
    const courses = getFromStorage(STORAGE_KEYS.COURSES) || [];
    
    // Get all results for this exam by current student
    const studentResults = examResults.filter(result => 
      result.examId === examId && result.studentId === currentUser.id
    );
    
    if (studentResults.length === 0) {
      alert('Bạn chưa làm bài thi này!');
      return;
    }
    
    const exam = exams.find(e => e.id === examId);
    const course = courses.find(c => c.id === exam?.courseId);
    
    // Get the latest result
    const latestResult = studentResults.sort((a, b) => 
      new Date(b.submittedAt) - new Date(a.submittedAt)
    )[0];
    
    // Create modal to show results
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="modal-content large-modal">
        <div class="modal-header">
          <h3>📊 Kết quả bài thi</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="exam-result-info">
            <h2>${exam?.title || 'N/A'}</h2>
            <p><strong>📚 Khóa học:</strong> ${course?.title || 'N/A'}</p>
            <p><strong>⏰ Thời gian làm bài:</strong> ${new Date(latestResult.submittedAt).toLocaleString('vi-VN')}</p>
            
            <div class="result-summary">
              <div class="score-display">
                <div class="score-main">${latestResult.totalScore}/${latestResult.maxScore}</div>
                <div class="score-percentage">${latestResult.percentage?.toFixed(1) || 0}%</div>
              </div>
              <div class="result-stats">
                <div class="stat-item">
                  <span class="stat-label">Câu đúng:</span>
                  <span class="stat-value correct">${latestResult.correctAnswers}/${latestResult.totalQuestions}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Câu sai:</span>
                  <span class="stat-value incorrect">${latestResult.totalQuestions - latestResult.correctAnswers}/${latestResult.totalQuestions}</span>
                </div>
              </div>
            </div>
            
            ${studentResults.length > 1 ? `
              <div class="attempt-history">
                <h4>📈 Lịch sử làm bài (${studentResults.length} lần)</h4>
                <div class="attempts-list">
                  ${studentResults.map((result, index) => `
                    <div class="attempt-item ${index === 0 ? 'latest' : ''}">
                      <span class="attempt-number">Lần ${studentResults.length - index}</span>
                      <span class="attempt-score">${result.totalScore}/${result.maxScore} (${result.percentage?.toFixed(1) || 0}%)</span>
                      <span class="attempt-date">${new Date(result.submittedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary modal-close-btn">Đóng</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    document.body.classList.add('modal-open');
    
    // Close modal events
    const closeButtons = modal.querySelectorAll('.modal-close, .modal-close-btn');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        document.body.removeChild(modal);
      });
    });
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        document.body.removeChild(modal);
      }
    });
  }
  