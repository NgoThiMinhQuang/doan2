
import { stateManager } from '../state.js';
import { getFromStorage, STORAGE_KEYS } from '../utils.js';
import { navigateTo } from '../routing.js';

export function renderStudentDashboard() {
  const user = stateManager.getState().user;
  const courses = getFromStorage(STORAGE_KEYS.COURSES);
  const assignments = getFromStorage(STORAGE_KEYS.ASSIGNMENTS);
  const exams = getFromStorage(STORAGE_KEYS.EXAMS);

  const myCourses = courses.filter(course => course.students?.includes(user.id));
  const myAssignments = assignments.filter(assignment => {
    const course = myCourses.find(course => course.id === assignment.courseId);
    return course && assignment.teacherId === course.teacherId;
  });
  const myExams = exams.filter(exam => {
    const course = myCourses.find(course => course.id === exam.courseId);
    return course && exam.teacherId === course.teacherId;
  });

  const stats = [
    { label: 'Khóa học đã đăng ký', value: myCourses?.length, icon: '📚', color: '#3498db' },
    { label: 'Bài tập', value: myAssignments?.length, icon: '📝', color: '#f39c12' },
    { label: 'Kỳ thi', value: myExams?.length, icon: '📋', color: '#e74c3c' },
    { label: 'Tiến độ hoàn thành', value: '75%', icon: '📈', color: '#2ecc71' }
  ];

  const container = document.createElement('div');
  container.className = 'dashboard-student';

  container.innerHTML = `
    <div class="welcome-section">
      <h2>Chào mừng, ${user.fullName}!</h2>
      <p>Theo dõi tiến độ học tập của bạn</p>
    </div>

    <div class="stats-grid">
      ${stats.map((stat, index) => `
        <div class="stat-card" style="border-left-color: ${stat.color}">
          <div class="stat-icon" style="color: ${stat.color}">
            ${stat.icon}
          </div>
          <div class="stat-content">
            <div class="stat-value">${stat.value}</div>
            <div class="stat-label">${stat.label}</div>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="dashboard-grid">
      <div class="dashboard-card">
        <h3>Khóa học của tôi</h3>
        <div class="course-list">
          ${myCourses.map(course => `
            <div class="course-item">
              <div class="course-info">
                <div class="course-title">${course.title}</div>
                <div class="course-teacher">GV: ${course.teacherName}</div>
              </div>
              <a href="#" class="view-course-link" data-path="/student/courses">Xem khóa học</a>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="dashboard-card">
        <h3>Bài tập sắp hết hạn</h3>
        <div class="assignment-list">
          ${myAssignments.slice(0, 3).map(assignment => `
            <div class="assignment-item">
              <div class="assignment-info">
                <div class="assignment-title">${assignment.title}</div>
                <div class="assignment-due">Hạn nộp: ${new Date(assignment.dueDate).toLocaleDateString('vi-VN')}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <a href="#" class="view-all-link" data-path="/student/assignments">Xem tất cả bài tập</a>
      </div>

      <div class="dashboard-card">
        <h3>Kỳ thi sắp tới</h3>
        <div class="exam-list">
          ${myExams.slice(0, 3).map(exam => `
            <div class="exam-item">
              <div class="exam-info">
                <div class="exam-title">${exam.title}</div>
                <div class="exam-time">Bắt đầu: ${new Date(exam.startTime).toLocaleDateString('vi-VN')}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <a href="#" class="view-all-link" data-path="/student/exams">Xem tất cả kỳ thi</a>
      </div>
    </div>
  `;

  // Add click handlers for navigation links
  container.querySelectorAll('.view-course-link, .view-all-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const path = e.currentTarget.dataset.path;
      navigateTo(path);
    });
  });

  return container;
}
