import { stateManager } from '../state.js';
import { navigateTo } from '../routing.js';
import {
  getFromStorage,
  addToStorage,
  updateInStorage,
  generateId,
  STORAGE_KEYS,
  showModal
} from '../utils.js';

export function renderStudentAssignments() {
    const currentUser = stateManager.getState().user;
    const courses = getFromStorage(STORAGE_KEYS.COURSES);
    const assignments = getFromStorage(STORAGE_KEYS.ASSIGNMENTS);
    const submissions = getFromStorage(STORAGE_KEYS.SUBMISSIONS);
  
    // Get assignments for courses the student is enrolled in
    const myCourses = courses.filter(course => course.students?.includes(currentUser.id));
    const myAssignments = assignments.filter(assignment => {
      const course = myCourses.find(course => course.id === assignment.courseId);
      // Đảm bảo bài tập thuộc khóa học đã đăng ký và do giáo viên của khóa học đó tạo
      return course && assignment.teacherId === course.teacherId;
    });
  
    const container = document.createElement('div');
    container.className = 'student-assignments';
  
    container.innerHTML = `
      <div class="page-header">
        <h1>Bài tập của tôi</h1>
      </div>
  
      <div class="assignments-list">
        ${myAssignments.map(assignment => {
      const course = courses.find(c => c.id === assignment.courseId);
      const submission = submissions.find(s =>
        s.assignmentId === assignment.id && s.studentId === currentUser.id
      );
      const isSubmitted = !!submission;
      const isOverdue = new Date(assignment.dueDate) < new Date();
  
      return `
            <div class="assignment-card ${isOverdue && !isSubmitted ? 'overdue' : ''}" data-assignment-id="${assignment.id}">
              <div class="assignment-header">
                <h3>${assignment.title}</h3>
                <span class="assignment-status ${isSubmitted ? (submission.grade !== null && submission.grade !== undefined ? 'graded' : 'submitted') : 'pending'}">
                  ${isSubmitted ? 
                    (submission.grade !== null && submission.grade !== undefined ? 
                      `Đã chấm: ${submission.grade}/${assignment.maxScore}` : 
                      'Đã nộp - Chờ chấm') : 
                    (isOverdue ? 'Quá hạn' : 'Chưa nộp')
                  }
                </span>
              </div>
              <div class="assignment-info">
                <p><strong>Khóa học:</strong> ${course ? course.title : 'N/A'}</p>
                <p><strong>Mô tả:</strong> ${assignment.description.substring(0, 100)}${assignment.description?.length > 100 ? '...' : ''}</p>
                <p><strong>Hạn nộp:</strong> ${new Date(assignment.dueDate).toLocaleDateString('vi-VN')}</p>
                <p><strong>Điểm tối đa:</strong> ${assignment.maxScore}</p>
                ${isSubmitted ? `
                  <p><strong>Điểm số:</strong> ${submission.grade !== null && submission.grade !== undefined ? submission.grade : 'Chưa chấm'}</p>
                  ${submission.feedback ? `<p><strong>Nhận xét:</strong> ${submission.feedback}</p>` : ''}
                ` : ''}
              </div>
              <div class="assignment-actions">
                ${!isSubmitted ?
          `<button class="btn btn-sm btn-submit" data-assignment-id="${assignment.id}">Nộp bài</button>` :
          `<button class="btn btn-sm btn-view-submission" data-assignment-id="${assignment.id}">Xem bài nộp</button>`
        }
              </div>
            </div>
          `;
    }).join('')}
      </div>
  
      <div id="assignment-modal" class="modal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="assignment-modal-title">Nộp bài tập</h3>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div id="assignment-details"></div>
            <form id="submission-form">
              <div class="form-group">
                <label for="submission-content">Nội dung bài làm:</label>
                <textarea id="submission-content" name="content" rows="6" required></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="assignment-modal-cancel">Hủy</button>
            <button type="button" class="btn btn-primary" id="assignment-modal-save">Nộp bài</button>
          </div>
        </div>
      </div>
    `;
  
    setupStudentAssignmentsEventListeners(container);
    return container;
  }
  
  function setupStudentAssignmentsEventListeners(container) {
    // Action buttons
    container.addEventListener('click', (e) => {
      const target = e.target;
      const assignmentId = target.dataset.assignmentId;
  
      if (target.classList.contains('btn-submit')) {
        showSubmissionModal(container, assignmentId);
      } else if (target.classList.contains('btn-view-submission')) {
        viewSubmission(assignmentId);
      }
    });
  }
  
  function showSubmissionModal(container, assignmentId) {
    const assignments = getFromStorage(STORAGE_KEYS.ASSIGNMENTS);
    const courses = getFromStorage(STORAGE_KEYS.COURSES);
    const assignment = assignments.find(a => a.id === assignmentId);
    const course = courses.find(c => c.id === assignment.courseId);
  
    const modal = container.querySelector('#assignment-modal');
    const title = container.querySelector('#assignment-modal-title');
    const detailsDiv = container.querySelector('#assignment-details');
    const form = container.querySelector('#submission-form');
  
    title.textContent = `Nộp bài: ${assignment.title}`;
    detailsDiv.innerHTML = `
      <div class="assignment-details">
        <p><strong>Khóa học:</strong> ${course.title}</p>
        <p><strong>Mô tả:</strong> ${assignment.description}</p>
        <p><strong>Hạn nộp:</strong> ${new Date(assignment.dueDate).toLocaleDateString('vi-VN')}</p>
        <p><strong>Điểm tối đa:</strong> ${assignment.maxScore}</p>
      </div>
    `;
  
    form.reset();
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
        submitAssignment(form, assignmentId);
        closeModal();
        const currentRoute = stateManager.getState().currentRoute;
        navigateTo(currentRoute);
      } else {
        form.reportValidity();
      }
    });
  }
  
  function submitAssignment(form, assignmentId) {
    const currentUser = stateManager.getState().user;
    const submissions = getFromStorage(STORAGE_KEYS.SUBMISSIONS);
  
    // Check if already submitted
    const existingSubmission = submissions.find(s =>
      s.assignmentId === assignmentId && s.studentId === currentUser.id
    );
  
    const submissionData = {
      assignmentId: assignmentId,
      studentId: currentUser.id,
      studentName: currentUser.fullName,
      content: form['content'].value,
      submittedAt: new Date().toISOString(),
      status: 'submitted'
    };
  
    if (existingSubmission) {
      updateInStorage(STORAGE_KEYS.SUBMISSIONS, existingSubmission.id, submissionData);
    } else {
      const newSubmission = {
        id: generateId(),
        ...submissionData
      };
      addToStorage(STORAGE_KEYS.SUBMISSIONS, newSubmission);
    }
  }
  
  function viewSubmission(assignmentId) {
    const currentUser = stateManager.getState().user;
    const submissions = getFromStorage(STORAGE_KEYS.SUBMISSIONS);
    const submission = submissions.find(s =>
      s.assignmentId === assignmentId && s.studentId === currentUser.id
    );
  
    if (submission) {
      let message = `Bài nộp của bạn:\n\n${submission.content}\n\n`;
      message += `Nộp lúc: ${new Date(submission.submittedAt).toLocaleString('vi-VN')}\n`;
  
      if (submission.grade) {
        message += `Điểm: ${submission.grade}\n`;
        if (submission.feedback) {
          message += `Nhận xét: ${submission.feedback}\n`;
        }
      } else {
        message += 'Chưa được chấm điểm\n';
      }
  
      alert(message);
    }
  }
  