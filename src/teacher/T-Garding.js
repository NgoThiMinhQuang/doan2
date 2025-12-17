import { stateManager } from '../state.js';
import { navigateTo } from '../routing.js';
import {
  getFromStorage,
  updateInStorage,
  STORAGE_KEYS
} from '../utils.js';

export function renderTeacherGrading() {
    // Kiểm tra quyền truy cập
    const currentUser = stateManager.getState().user;
    if (!currentUser || currentUser.role !== 'teacher') {
      navigateTo('/dashboard');
      return document.createElement('div');
    }
    
    const assignments = getFromStorage(STORAGE_KEYS.ASSIGNMENTS) || [];
    const submissions = getFromStorage(STORAGE_KEYS.SUBMISSIONS) || [];
    const exams = getFromStorage(STORAGE_KEYS.EXAMS) || [];
    const examResults = getFromStorage(STORAGE_KEYS.EXAM_RESULTS) || [];
    const users = getFromStorage(STORAGE_KEYS.USERS) || [];
    const courses = getFromStorage(STORAGE_KEYS.COURSES) || [];
  
    // Get assignments created by this teacher
    const myAssignments = assignments.filter(a => a.teacherId === currentUser.id);
  
    // Get submissions for these assignments (Điểm bài ôn tập)
    // Chỉ lấy submissions từ học sinh đã đăng ký khóa học
    const enrollments = getFromStorage(STORAGE_KEYS.ENROLLMENTS) || [];
    const mySubmissions = submissions.filter(s => {
      const assignment = myAssignments.find(a => a.id === s.assignmentId);
      if (!assignment) return false;
      
      // Kiểm tra học sinh có trong enrollment của khóa học không
      const isEnrolled = enrollments.some(e =>
        e.studentId === s.studentId &&
        e.courseId === assignment.courseId &&
        e.teacherId === currentUser.id
      );
      return isEnrolled;
    });
  
    // Get exams created by this teacher
    const myExams = exams.filter(e => e.teacherId === currentUser.id);
    
    // Get exam results for official exams (Điểm bài kiểm tra)
    // Chỉ lấy kết quả từ học sinh đã đăng ký khóa học
    const officialExamResults = examResults.filter(er => {
      const exam = myExams.find(e => e.id === er.examId);
      if (!exam || exam.examType !== 'official') return false;
      
      // Kiểm tra học sinh có trong enrollment của khóa học không
      const isEnrolled = enrollments.some(e =>
        e.studentId === er.studentId &&
        e.courseId === exam.courseId &&
        e.teacherId === currentUser.id
      );
      return isEnrolled;
    });
    
    // Get exam results for practice exams (Điểm bài ôn tập)
    // Chỉ lấy kết quả từ học sinh đã đăng ký khóa học
    const practiceExamResults = examResults.filter(er => {
      const exam = myExams.find(e => e.id === er.examId);
      if (!exam || exam.examType !== 'practice') return false;
      
      // Kiểm tra học sinh có trong enrollment của khóa học không
      const isEnrolled = enrollments.some(e =>
        e.studentId === er.studentId &&
        e.courseId === exam.courseId &&
        e.teacherId === currentUser.id
      );
      return isEnrolled;
    });
  
    const container = document.createElement('div');
    container.className = 'teacher-grading';
  
    container.innerHTML = `
      <div class="page-header">
        <h1>📝 Chấm điểm</h1>
        <div class="header-stats">
          <span class="stat-badge">📊 Tổng: ${mySubmissions.length + officialExamResults.length + practiceExamResults.length} bài</span>
          <span class="stat-badge pending">⏳ Chưa chấm: ${(mySubmissions.filter(s => !s.grade).length + officialExamResults.filter(er => !er.teacherGrade).length + practiceExamResults.filter(er => !er.teacherGrade).length)}</span>
          <span class="stat-badge graded">✓ Đã chấm: ${(mySubmissions.filter(s => s.grade).length + officialExamResults.filter(er => er.teacherGrade).length + practiceExamResults.filter(er => er.teacherGrade).length)}</span>
        </div>
      </div>
  
      <div class="grading-type-tabs">
        <button class="type-tab-btn active" data-type="assignment">📝 Điểm bài tập</button>
        <button class="type-tab-btn" data-type="quiz">🧠 Điểm bài quiz</button>
        <button class="type-tab-btn" data-type="exam">🏁 Điểm bài kiểm tra</button>
      </div>

      <!-- Điểm bài tập (Bài tự luận) -->
      <div id="assignment-grading-section" class="grading-section">
        <div class="grading-tabs">
          <button class="tab-btn active" data-tab="assignment-pending">⏳ Chưa chấm (${mySubmissions.filter(s => !s.grade).length})</button>
          <button class="tab-btn" data-tab="assignment-graded">✓ Đã chấm (${mySubmissions.filter(s => s.grade).length})</button>
        </div>
        
        <!-- Chưa chấm - Điểm bài tập -->
        <div id="assignment-pending-list" class="submissions-list">
          ${mySubmissions.filter(s => !s.grade).length > 0 ? mySubmissions.filter(s => !s.grade).map(submission => {
              const assignment = assignments.find(a => a.id === submission.assignmentId);
              const student = users.find(u => u.id === submission.studentId);
              const course = courses.find(c => c.id === assignment?.courseId);
              return `
                <div class="submission-card-grading">
                  <div class="submission-card-header">
                    <h4 class="submission-card-title">${assignment?.title || 'N/A'}</h4>
                    <span class="submission-status-badge pending-badge">CHƯA CHẤM</span>
                  </div>
                  <div class="submission-card-info">
                    <p><strong>Học sinh:</strong> ${student ? student.fullName : 'N/A'}</p>
                    <p><strong>Khóa học:</strong> ${course ? course.title : 'N/A'}</p>
                    <p><strong>Nộp lúc:</strong> ${new Date(submission.submittedAt).toLocaleString('vi-VN')}</p>
                    <p class="submission-content-preview"><strong>Nội dung:</strong> ${submission.content.substring(0, 100)}${submission.content.length > 100 ? '...' : ''}</p>
                  </div>
                  <div class="submission-card-actions">
                    <button class="btn btn-sm btn-grade-card" data-submission-id="${submission.id}">Chấm điểm</button>
                    <button class="btn btn-sm btn-view-card" data-submission-id="${submission.id}">Xem đầy đủ</button>
                  </div>
                </div>
              `;
            }).join('') : `
            <div class="empty-submissions-state">
              <div class="empty-icon-large">✅</div>
              <h3 class="empty-title">Tất cả bài tập đã được chấm</h3>
              <p class="empty-description">Hiện tại không có bài tập nào cần chấm điểm.</p>
            </div>
          `}
        </div>
        
        <!-- Đã chấm - Điểm bài tập -->
        <div id="assignment-graded-list" class="submissions-list" style="display: none;">
          ${mySubmissions.filter(s => s.grade).length > 0 ? mySubmissions.filter(s => s.grade).map(submission => {
              const assignment = assignments.find(a => a.id === submission.assignmentId);
              const student = users.find(u => u.id === submission.studentId);
              const course = courses.find(c => c.id === assignment?.courseId);
              
              return `
                <div class="submission-card-grading" data-submission-id="${submission.id}" data-type="assignment">
                  <div class="submission-card-header">
                    <h4 class="submission-card-title">${assignment ? assignment.title : 'N/A'}</h4>
                    <span class="submission-status-badge graded-badge">ĐÃ CHẤM: ${submission.grade}/10</span>
                  </div>
                  <div class="submission-card-info">
                    <p><strong>Học sinh:</strong> ${student ? student.fullName : 'N/A'}</p>
                    <p><strong>Khóa học:</strong> ${course ? course.title : 'N/A'}</p>
                    <p><strong>Nộp lúc:</strong> ${submission.submittedAt ? new Date(submission.submittedAt).toLocaleString('vi-VN') : 'N/A'}</p>
                    <p><strong>Chấm lúc:</strong> ${submission.gradedAt ? new Date(submission.gradedAt).toLocaleString('vi-VN') : 'N/A'}</p>
                  </div>
                  <div class="submission-card-actions">
                    <button class="btn btn-sm btn-edit-grade" data-submission-id="${submission.id}">Sửa điểm</button>
                    <button class="btn btn-sm btn-view-card" data-submission-id="${submission.id}">Xem đầy đủ</button>
                  </div>
                </div>
              `;
            }).join('') : '<div class="empty-state">📭 Chưa có bài tập nào được chấm</div>'}
        </div>
      </div>

      <!-- Điểm bài quiz (Practice exams) -->
      <div id="quiz-grading-section" class="grading-section" style="display: none;">
        <div class="submissions-list">
          ${practiceExamResults.length > 0 ? practiceExamResults.map(result => {
            const exam = myExams.find(e => e.id === result.examId);
            const student = users.find(u => u.id === result.studentId);
            const course = courses.find(c => c.id === result.courseId);
            
            return `
              <div class="submission-card" data-result-id="${result.id}" data-type="practice-exam">
                <div class="submission-header">
                  <h4>🧠 ${exam ? exam.title : 'N/A'}</h4>
                  <span class="submission-status auto-graded">📊 Điểm: ${result.totalScore}/${result.maxScore} (${result.percentage?.toFixed(1) || 0}%)</span>
                </div>
                <div class="submission-info">
                  <p><strong>👤 Học sinh:</strong> ${student ? student.fullName : 'N/A'}</p>
                  <p><strong>📚 Khóa học:</strong> ${course ? course.title : 'N/A'}</p>
                  <p><strong>⏰ Nộp lúc:</strong> ${new Date(result.submittedAt).toLocaleString('vi-VN')}</p>
                  <p><strong>✅ Số câu đúng:</strong> ${result.correctAnswers || 0}/${result.totalQuestions || 0}</p>
                </div>
                <div class="submission-actions">
                  <button class="btn btn-sm btn-outline btn-view-exam" data-result-id="${result.id}">👁️ Xem chi tiết</button>
                </div>
              </div>
            `;
          }).join('') : '<div class="empty-state">📭 Chưa có bài quiz nào</div>'}
        </div>
      </div>

      <!-- Điểm bài kiểm tra (Official exams) -->
      <div id="exam-grading-section" class="grading-section" style="display: none;">
        <div class="grading-tabs">
          <button class="tab-btn active" data-tab="exam-pending">⏳ Chưa chấm (${officialExamResults.filter(er => !er.teacherGrade)?.length})</button>
          <button class="tab-btn" data-tab="exam-graded">✓ Đã chấm (${officialExamResults.filter(er => er.teacherGrade)?.length})</button>
        </div>

        <div id="exam-pending-list" class="submissions-list">
          ${officialExamResults.filter(er => !er.teacherGrade).length > 0 ? officialExamResults.filter(er => !er.teacherGrade).map(result => {
            const exam = myExams.find(e => e.id === result.examId);
            const student = users.find(u => u.id === result.studentId);
            const course = courses.find(c => c.id === result.courseId);
            
            return `
              <div class="submission-card" data-result-id="${result.id}" data-type="exam">
                <div class="submission-header">
                  <h4>🏁 ${exam ? exam.title : 'N/A'}</h4>
                  <span class="submission-status pending">⏳ Chưa chấm</span>
                </div>
                <div class="submission-info">
                  <p><strong>👤 Học sinh:</strong> ${student ? student.fullName : 'N/A'}</p>
                  <p><strong>📚 Khóa học:</strong> ${course ? course.title : 'N/A'}</p>
                  <p><strong>⏰ Nộp lúc:</strong> ${new Date(result.submittedAt).toLocaleString('vi-VN')}</p>
                  <p><strong>📊 Điểm tự động:</strong> ${result.totalScore}/${result.maxScore} (${result.percentage?.toFixed(1) || 0}%)</p>
                </div>
                <div class="submission-actions">
                  <button class="btn btn-sm btn-primary btn-grade-exam" data-result-id="${result.id}">✏️ Chấm điểm</button>
                  <button class="btn btn-sm btn-outline btn-view-exam" data-result-id="${result.id}">👁️ Xem chi tiết</button>
                </div>
              </div>
            `;
          }).join('') : '<div class="empty-state">✅ Tất cả bài kiểm tra đã được chấm!</div>'}
        </div>

        <div id="exam-graded-list" class="submissions-list" style="display: none;">
          ${officialExamResults.filter(er => er.teacherGrade).length > 0 ? officialExamResults.filter(er => er.teacherGrade).map(result => {
            const exam = myExams.find(e => e.id === result.examId);
            const student = users.find(u => u.id === result.studentId);
            const course = courses.find(c => c.id === result.courseId);
            
            return `
              <div class="submission-card graded" data-result-id="${result.id}" data-type="exam">
                <div class="submission-header">
                  <h4>✓ ${exam ? exam.title : 'N/A'}</h4>
                  <span class="submission-status graded">✓ Đã chấm: ${result.teacherGrade}/10</span>
                </div>
                <div class="submission-info">
                  <p><strong>👤 Học sinh:</strong> ${student ? student.fullName : 'N/A'}</p>
                  <p><strong>📚 Khóa học:</strong> ${course ? course.title : 'N/A'}</p>
                  <p><strong>⏰ Nộp lúc:</strong> ${new Date(result.submittedAt).toLocaleString('vi-VN')}</p>
                  <p><strong>📊 Điểm tự động:</strong> ${result.totalScore}/${result.maxScore} (${result.percentage?.toFixed(1) || 0}%)</p>
                  <p><strong>✏️ Chấm lúc:</strong> ${result.teacherGradedAt ? new Date(result.teacherGradedAt).toLocaleString('vi-VN') : 'N/A'}</p>
                </div>
                <div class="submission-actions">
                  <button class="btn btn-sm btn-warning btn-edit-exam-grade" data-result-id="${result.id}">📝 Sửa điểm</button>
                  <button class="btn btn-sm btn-outline btn-view-exam" data-result-id="${result.id}">👁️ Xem chi tiết</button>
                </div>
              </div>
            `;
          }).join('') : '<div class="empty-state">📭 Chưa có bài kiểm tra nào được chấm</div>'}
        </div>
      </div>
  
      <div id="grading-modal" class="modal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="modal-title">Chấm điểm</h3>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div id="submission-details"></div>
            <form id="grading-form">
              <div class="form-group">
                <label for="grade">Điểm số:</label>
                <input type="number" id="grade" name="grade" min="0" max="10" step="0.1" required>
              </div>
              <div class="form-group">
                <label for="feedback">Nhận xét:</label>
                <textarea id="feedback" name="feedback" rows="3"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="grading-modal-cancel">Hủy</button>
            <button type="button" class="btn btn-primary" id="grading-modal-save">Lưu điểm</button>
          </div>
        </div>
      </div>
    `;
  
    setupTeacherGradingEventListeners(container);
    
    // Adjust grid layout based on number of cards
    adjustSubmissionListLayout(container);
    
    // Restore state after grading (use setTimeout to ensure DOM is ready)
    setTimeout(() => {
      const lastAction = sessionStorage.getItem('grading_last_action');
      if (lastAction) {
        try {
          const action = JSON.parse(lastAction);
          // Only restore if it was less than 10 seconds ago
          if (Date.now() - action.timestamp < 10000) {
            console.log('Restoring grading state:', action);
            
            // 1. Show the correct section (assignment, quiz, or exam)
            const section = container.querySelector(`#${action.type}-grading-section`);
            if (section) {
              // Hide all sections first
              container.querySelectorAll('.grading-section').forEach(s => {
                s.style.display = 'none';
              });
              
              // Show the target section
              section.style.display = 'block';
              
              // 2. Update type tab button (Điểm bài tập / Điểm bài quiz / Điểm bài kiểm tra)
              container.querySelectorAll('.type-tab-btn').forEach(b => {
                b.classList.remove('active');
              });
              const typeTab = container.querySelector(`.type-tab-btn[data-type="${action.type}"]`);
              if (typeTab) {
                typeTab.classList.add('active');
              }
              
              // 3. Switch to "Đã chấm" tab within the section (only for assignment and exam, not quiz)
              if (action.type !== 'quiz') {
                const tabBtn = section.querySelector(`.tab-btn[data-tab="${action.type}-${action.tab}"]`);
                if (tabBtn) {
                  // Remove active from all tabs in this section
                  section.querySelectorAll('.tab-btn').forEach(b => {
                    b.classList.remove('active');
                  });
                  // Add active to target tab
                  tabBtn.classList.add('active');
                  
                  // Hide all lists in this section
                  section.querySelectorAll('.submissions-list').forEach(list => {
                    list.style.display = 'none';
                  });
                  // Show the target list
                  const targetList = section.querySelector(`#${action.type}-${action.tab}-list`);
                  if (targetList) {
                    targetList.style.display = 'block';
                  }
                }
              }
            }
            
            // Adjust layout after restoring state
            adjustSubmissionListLayout(container);
          }
          // Always clear the stored action
          sessionStorage.removeItem('grading_last_action');
        } catch (e) {
          console.error('Error restoring grading state:', e);
          sessionStorage.removeItem('grading_last_action');
        }
      }
      
      // Always adjust layout on initial load
      adjustSubmissionListLayout(container);
    }, 100);
    
    return container;
  }
  
  function adjustSubmissionListLayout(container) {
    // Find all submission lists (including hidden ones)
    const submissionLists = container.querySelectorAll('.submissions-list');
    
    submissionLists.forEach(list => {
      // Phần đã chấm luôn hiển thị 3 ô mỗi hàng
      const isGradedList = list.id === 'assignment-graded-list' || list.id === 'exam-graded-list';
      
      if (isGradedList) {
        // Loại bỏ tất cả các class layout
        list.classList.remove('single-card', 'double-card', 'triple-card');
        // Đảm bảo style inline luôn là 3 cột với !important
        list.style.setProperty('grid-template-columns', 'repeat(3, 1fr)', 'important');
        list.style.setProperty('width', '100%', 'important');
        list.style.setProperty('max-width', '100%', 'important');
        list.style.setProperty('justify-content', 'stretch', 'important');
        return;
      }
      
      // Phần chưa chấm - luôn xử lý để đảm bảo layout đúng
      // Count cards (đếm cả khi ẩn)
      const cards = list.querySelectorAll('.submission-card-grading');
      const cardCount = cards.length;
      
      // Remove existing classes trước
      list.classList.remove('single-card', 'double-card', 'triple-card');
      
      // Đảm bảo không có style inline còn sót - xóa hoàn toàn
      list.style.removeProperty('grid-template-columns');
      list.style.removeProperty('width');
      list.style.removeProperty('max-width');
      list.style.removeProperty('justify-content');
      
      // Add appropriate class based on count
      if (cardCount === 1) {
        list.classList.add('single-card');
      } else if (cardCount === 2) {
        list.classList.add('double-card');
      } else {
        // >= 3 cards hoặc 0 cards - luôn dùng 3 cột
        list.classList.add('triple-card');
      }
      
      // Force reflow để đảm bảo CSS được áp dụng
      void list.offsetHeight;
    });
  }

  function setupTeacherGradingEventListeners(container) {
    // Type tabs (Điểm bài tập / Điểm bài quiz / Điểm bài kiểm tra)
    container.querySelectorAll('.type-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = e.target.dataset.type;
        
        // Update active type tab
        container.querySelectorAll('.type-tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        // Show corresponding section
        container.querySelectorAll('.grading-section').forEach(section => {
          section.style.display = 'none';
        });
        if (type === 'assignment') {
          container.querySelector('#assignment-grading-section').style.display = 'block';
        } else if (type === 'quiz') {
          container.querySelector('#quiz-grading-section').style.display = 'block';
        } else if (type === 'exam') {
          container.querySelector('#exam-grading-section').style.display = 'block';
        }
      });
    });
  
    // Tab switching (Chưa chấm / Đã chấm)
    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.target.dataset.tab;
        const section = e.target.closest('.grading-section');
        
        // Update active tab
        section.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
  
        // Show corresponding content
        section.querySelectorAll('.submissions-list').forEach(list => {
          list.style.display = 'none';
        });
        const targetList = section.querySelector(`#${tab}-list`);
        if (targetList) {
          // Reset HOÀN TOÀN tất cả style và class của TẤT CẢ lists trước
          section.querySelectorAll('.submissions-list').forEach(list => {
            // Reset style inline
            list.style.removeProperty('grid-template-columns');
            list.style.removeProperty('width');
            list.style.removeProperty('max-width');
            list.style.removeProperty('justify-content');
            // Reset class
            list.classList.remove('single-card', 'double-card', 'triple-card');
          });
          
          // Hiển thị target list
          targetList.style.display = 'block';
          
          // Force reflow để đảm bảo DOM đã cập nhật
          void targetList.offsetHeight;
          
          // Adjust layout sau khi đã reset hoàn toàn
          requestAnimationFrame(() => {
            adjustSubmissionListLayout(container);
          });
        }
      });
    });
  
    // Event delegation for all buttons
    container.addEventListener('click', (e) => {
      const button = e.target.closest('button');
      if (!button) return;
      
      const submissionId = button.getAttribute('data-submission-id');
      const resultId = button.getAttribute('data-result-id');
      const id = submissionId || resultId;
      if (!id) return;
  
      // Handle exam grading (official exams)
      if (button.classList.contains('btn-grade-exam') || button.classList.contains('btn-edit-exam-grade')) {
        e.preventDefault();
        e.stopPropagation();
        showGradingModal(container, id, 'exam');
      } 
      // Handle practice exam grading
      else if (button.classList.contains('btn-grade-practice') || button.classList.contains('btn-edit-practice-grade')) {
        e.preventDefault();
        e.stopPropagation();
        showGradingModal(container, id, 'practice-exam');
      }
      // Handle assignment grading (always in practice section)
      else if (button.classList.contains('btn-grade') || button.classList.contains('btn-edit-grade') || button.classList.contains('btn-grade-v2') || button.classList.contains('btn-grade-action') || button.classList.contains('btn-grade-card')) {
        e.preventDefault();
        e.stopPropagation();
        showGradingModal(container, id, 'assignment');
      }
      // Handle view full assignment
      else if (button.classList.contains('btn-view-full') || button.classList.contains('btn-view-v2') || button.classList.contains('btn-view-action') || button.classList.contains('btn-view-card')) {
        e.preventDefault();
        e.stopPropagation();
        viewFullSubmission(id);
      }
      // Handle view exam details
      else if (button.classList.contains('btn-view-exam')) {
        e.preventDefault();
        e.stopPropagation();
        viewExamResult(id);
      }
    });
  }
  
  function showGradingModal(container, id, type) {
    const submissions = getFromStorage(STORAGE_KEYS.SUBMISSIONS) || [];
    const assignments = getFromStorage(STORAGE_KEYS.ASSIGNMENTS) || [];
    const exams = getFromStorage(STORAGE_KEYS.EXAMS) || [];
    const examResults = getFromStorage(STORAGE_KEYS.EXAM_RESULTS) || [];
    const users = getFromStorage(STORAGE_KEYS.USERS) || [];
    const courses = getFromStorage(STORAGE_KEYS.COURSES) || [];
  
    // Get current active tab (assignment, quiz, or exam)
    const activeTypeTab = container.querySelector('.type-tab-btn.active');
    // Determine section type based on the item being graded
    let currentSectionType = 'assignment';
    if (type === 'practice-exam') {
      currentSectionType = 'quiz';
    } else if (type === 'exam') {
      currentSectionType = 'exam';
    } else if (type === 'assignment') {
      currentSectionType = 'assignment';
    } else if (activeTypeTab) {
      currentSectionType = activeTypeTab.getAttribute('data-type');
    }
  
    const modal = container.querySelector('#grading-modal');
    if (!modal) {
      alert('❌ Không tìm thấy form chấm điểm');
      return;
    }
    
    const detailsDiv = container.querySelector('#submission-details');
    const form = container.querySelector('#grading-form');
    const modalTitle = container.querySelector('#modal-title');
    
    if (!detailsDiv || !form) {
      alert('❌ Không tìm thấy form chấm điểm');
      return;
    }
  
    let submission, assignment, exam, result, student, course;
    let currentGrade = null;
    let currentFeedback = null;
  
    if (type === 'assignment') {
      submission = submissions.find(s => s.id === id);
      assignment = assignments.find(a => a.id === submission?.assignmentId);
      student = users.find(u => u.id === submission?.studentId);
      course = courses.find(c => c.id === assignment?.courseId);
      
      if (!submission || !assignment) {
        alert('❌ Không tìm thấy bài nộp hoặc bài tập');
        return;
      }
      
      modalTitle.textContent = 'Chấm điểm bài tập';
      currentGrade = submission.grade;
      currentFeedback = submission.feedback;
      
      detailsDiv.innerHTML = `
        <div class="submission-details">
          <h4>${assignment.title}</h4>
          <p><strong>Học sinh:</strong> ${student ? student.fullName : 'N/A'}</p>
          <p><strong>Khóa học:</strong> ${course ? course.title : 'N/A'}</p>
          <p><strong>Nộp lúc:</strong> ${new Date(submission.submittedAt).toLocaleString('vi-VN')}</p>
          <div class="submission-content-full">
            <strong>Nội dung bài làm:</strong>
            <p>${submission.content}</p>
          </div>
        </div>
      `;
    } else if (type === 'exam' || type === 'practice-exam') {
      result = examResults.find(r => r.id === id);
      exam = exams.find(e => e.id === result?.examId);
      student = users.find(u => u.id === result?.studentId);
      course = courses.find(c => c.id === result?.courseId);
      
      if (!result || !exam) {
        alert('❌ Không tìm thấy kết quả thi hoặc đề thi');
        return;
      }
      
      if (type === 'exam') {
        modalTitle.textContent = 'Chấm điểm bài kiểm tra';
      } else if (type === 'practice-exam') {
        modalTitle.textContent = 'Chấm điểm bài quiz';
      }
      currentGrade = result.teacherGrade;
      currentFeedback = result.teacherFeedback;
      
      detailsDiv.innerHTML = `
        <div class="submission-details">
          <h4>${exam.title}</h4>
          <p><strong>Học sinh:</strong> ${student ? student.fullName : 'N/A'}</p>
          <p><strong>Khóa học:</strong> ${course ? course.title : 'N/A'}</p>
          <p><strong>Nộp lúc:</strong> ${new Date(result.submittedAt).toLocaleString('vi-VN')}</p>
          <p><strong>Điểm tự động:</strong> ${result.totalScore}/${result.maxScore} (${result.percentage?.toFixed(1) || 0}%)</p>
          <p><strong>Số câu đúng:</strong> ${result.correctAnswers}/${result.totalQuestions}</p>
          <div class="submission-content-full">
            <strong>Chi tiết câu trả lời:</strong>
            <div style="margin-top: 10px;">
              ${result.answers?.map((answer, idx) => `
                <div style="margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 5px;">
                  <p><strong>Câu ${idx + 1}:</strong> ${answer.questionText}</p>
                  <p>Đáp án học sinh chọn: ${answer.selectedOption !== null ? `Option ${answer.selectedOption + 1}` : 'Chưa trả lời'}</p>
                  <p>Đáp án đúng: Option ${answer.correctOption + 1}</p>
                  <p style="color: ${answer.isCorrect ? 'green' : 'red'};">
                    ${answer.isCorrect ? '✓ Đúng' : '✗ Sai'} (${answer.points}/${answer.maxPoints} điểm)
                  </p>
                </div>
              `).join('') || 'Không có dữ liệu'}
            </div>
          </div>
        </div>
      `;
    }
  
    // Fill in form values
    if (currentGrade !== null && currentGrade !== undefined) {
      form['grade'].value = currentGrade;
      form['feedback'].value = currentFeedback || '';
    } else {
      form.reset();
      form['grade'].max = 10;
    }
  
    // Show modal
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
  
    // Setup close handlers
    const closeModal = () => {
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
    };
  
    // Remove old event listeners by replacing buttons
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('#grading-modal-cancel');
    const saveBtn = modal.querySelector('#grading-modal-save');
  
    if (closeBtn) {
      const newCloseBtn = closeBtn.cloneNode(true);
      closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
      newCloseBtn.onclick = closeModal;
    }
    
    if (cancelBtn) {
      const newCancelBtn = cancelBtn.cloneNode(true);
      cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
      newCancelBtn.onclick = closeModal;
    }

    if (saveBtn) {
      const newSaveBtn = saveBtn.cloneNode(true);
      saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
      newSaveBtn.onclick = () => {
        if (form.checkValidity()) {
          // Use the current section type (exam or practice) that was active when modal opened
          // This ensures we stay on the same tab after saving
          const sectionType = currentSectionType;
          
          console.log('Saving grade, type:', type, 'sectionType:', sectionType, 'currentSectionType:', currentSectionType);
          
          // Save grade first
          saveGrade(form, id, type);
          
          // Save state to show correct tab after refresh, using the current section type
          // For quiz, no tab needed since it's a single list
          const tabToShow = sectionType === 'quiz' ? null : 'graded';
          sessionStorage.setItem('grading_last_action', JSON.stringify({
            type: sectionType,
            tab: tabToShow,
            timestamp: Date.now()
          }));
          
          console.log('Saved state:', { type: sectionType, tab: 'graded' });
          
          closeModal();
          
          // Refresh the page to update the lists
          const currentRoute = stateManager.getState().currentRoute;
          navigateTo(currentRoute);
          
          // Adjust layout after navigation
          setTimeout(() => {
            const newContainer = document.querySelector('.teacher-grading');
            if (newContainer) {
              adjustSubmissionListLayout(newContainer);
            }
          }, 100);
        } else {
          form.reportValidity();
        }
      };
    }
    
    // Close when clicking outside
    modal.onclick = (e) => {
      if (e.target === modal) {
        closeModal();
      }
    };
  }
  
  function saveGrade(form, id, type) {
    const currentUser = stateManager.getState().user;
    const grade = parseFloat(form['grade'].value);
    const feedback = form['feedback'].value;
    
    if (type === 'assignment') {
      const gradeData = {
        grade: grade,
        feedback: feedback,
        gradedAt: new Date().toISOString(),
        gradedBy: currentUser.id
      };
      updateInStorage(STORAGE_KEYS.SUBMISSIONS, id, gradeData);
    } else if (type === 'exam' || type === 'practice-exam') {
      const gradeData = {
        teacherGrade: grade,
        teacherFeedback: feedback,
        teacherGradedAt: new Date().toISOString(),
        teacherGradedBy: currentUser.id
      };
      updateInStorage(STORAGE_KEYS.EXAM_RESULTS, id, gradeData);
    }
  }
  
  function viewFullSubmission(submissionId) {
    const submissions = getFromStorage(STORAGE_KEYS.SUBMISSIONS) || [];
    const submission = submissions.find(s => s.id === submissionId);
  
    if (submission) {
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.style.display = 'flex';
      modal.innerHTML = `
        <div class="modal-content large-modal">
          <div class="modal-header">
            <h3>Nội dung bài làm</h3>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; white-space: pre-wrap; font-family: monospace; line-height: 1.6;">
              ${submission.content}
            </div>
          </div>
          <div class="modal-footer">
            <button class="modal-close-btn btn btn-secondary">Đóng</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      document.body.classList.add('modal-open');
      
      const closeButtons = modal.querySelectorAll('.modal-close, .modal-close-btn');
      closeButtons.forEach(btn => {
        btn.onclick = () => {
          modal.remove();
          document.body.classList.remove('modal-open');
        };
      });
      
      modal.onclick = (e) => {
        if (e.target === modal) {
          modal.remove();
          document.body.classList.remove('modal-open');
        }
      };
    }
  }
  
  function viewExamResult(resultId) {
    const examResults = getFromStorage(STORAGE_KEYS.EXAM_RESULTS) || [];
    const exams = getFromStorage(STORAGE_KEYS.EXAMS) || [];
    const users = getFromStorage(STORAGE_KEYS.USERS) || [];
    const courses = getFromStorage(STORAGE_KEYS.COURSES) || [];
    
    const result = examResults.find(r => r.id === resultId);
    if (!result) return;
    
    const exam = exams.find(e => e.id === result.examId);
    const student = users.find(u => u.id === result.studentId);
    const course = courses.find(c => c.id === result.courseId);
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="modal-content large-modal">
        <div class="modal-header">
          <h3>Chi tiết kết quả thi</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div style="margin-bottom: 20px;">
            <p><strong>Đề thi:</strong> ${exam ? exam.title : 'N/A'}</p>
            <p><strong>Học sinh:</strong> ${student ? student.fullName : 'N/A'}</p>
            <p><strong>Khóa học:</strong> ${course ? course.title : 'N/A'}</p>
            <p><strong>Điểm tự động:</strong> ${result.totalScore}/${result.maxScore} (${result.percentage?.toFixed(1) || 0}%)</p>
            <p><strong>Số câu đúng:</strong> ${result.correctAnswers}/${result.totalQuestions}</p>
            ${result.teacherGrade ? `<p><strong>Điểm giáo viên:</strong> ${result.teacherGrade}/10</p>` : ''}
            ${result.teacherFeedback ? `<p><strong>Nhận xét:</strong> ${result.teacherFeedback}</p>` : ''}
          </div>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
            <strong>Chi tiết câu trả lời:</strong>
            ${result.answers?.map((answer, idx) => `
              <div style="margin-top: 15px; padding: 10px; background: white; border-radius: 5px; border-left: 4px solid ${answer.isCorrect ? 'green' : 'red'};">
                <p><strong>Câu ${idx + 1}:</strong> ${answer.questionText}</p>
                <p>Đáp án học sinh: ${answer.selectedOption !== null ? `Option ${answer.selectedOption + 1}` : 'Chưa trả lời'}</p>
                <p>Đáp án đúng: Option ${answer.correctOption + 1}</p>
                <p style="color: ${answer.isCorrect ? 'green' : 'red'};">
                  ${answer.isCorrect ? '✓ Đúng' : '✗ Sai'} (${answer.points}/${answer.maxPoints} điểm)
                </p>
              </div>
            `).join('') || 'Không có dữ liệu'}
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-close-btn btn btn-secondary">Đóng</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    document.body.classList.add('modal-open');
    
    const closeButtons = modal.querySelectorAll('.modal-close, .modal-close-btn');
    closeButtons.forEach(btn => {
      btn.onclick = () => {
        modal.remove();
        document.body.classList.remove('modal-open');
      };
    });
    
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.remove();
        document.body.classList.remove('modal-open');
      }
    };
  }
