
import { stateManager } from '../state.js';
import { getFromStorage, STORAGE_KEYS, initializeSampleData } from '../utils.js';
import {
  createStudentPerformanceChart,
  createExamResultsChart,
  createCourseEnrollmentChart,
  createAssignmentSubmissionChart
} from '../charts.js';

export function renderTeacherDashboard() {
  const user = stateManager.getState().user;
  
  // Ensure sample data is initialized
  initializeSampleData();
  
  const courses = getFromStorage(STORAGE_KEYS.COURSES);
  const assignments = getFromStorage(STORAGE_KEYS.ASSIGNMENTS);
  const exams = getFromStorage(STORAGE_KEYS.EXAMS);

  const myCourses = courses.filter(course => course.teacherId === user.id);
  const myAssignments = assignments.filter(assignment => assignment.teacherId === user.id);
  const myExams = exams.filter(exam => exam.teacherId === user.id);

  // Tính tổng số sinh viên từ tất cả khóa học
  const totalStudents = myCourses.reduce((total, course) => {
    const studentCount = Array.isArray(course.students) ? course.students.length : 0;
    return total + studentCount;
  }, 0);

  const stats = [
    { label: 'Khóa học của tôi', value: myCourses?.length || 0, icon: '📚', color: '#3498db' },
    { label: 'Bài tập', value: myAssignments?.length || 0, icon: '📝', color: '#f39c12' },
    { label: 'Kỳ thi', value: myExams?.length || 0, icon: '📋', color: '#e74c3c' },
    { label: 'Sinh viên', value: totalStudents, icon: '👨‍🎓', color: '#2ecc71' }
  ];

  const container = document.createElement('div');
  container.className = 'dashboard-teacher';

  container.innerHTML = `
    <div class="welcome-section">
      <h2>Chào mừng, ${user.fullName}!</h2>
      <p>Quản lý lớp học và giảng dạy</p>
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

    <div class="charts-section">
      <h3>📊 Báo cáo thống kê</h3>
      <div class="charts-grid">
        <div class="chart-card">
          <h4>Thành tích sinh viên</h4>
          <div class="chart-container">
            <canvas id="studentPerformanceChart"></canvas>
          </div>
        </div>
        
        <div class="chart-card">
          <h4>Phân bố điểm thi</h4>
          <div class="chart-container">
            <canvas id="examResultsChart"></canvas>
          </div>
        </div>
        
        <div class="chart-card">
          <h4>Đăng ký khóa học</h4>
          <div class="chart-container">
            <canvas id="courseEnrollmentChart"></canvas>
          </div>
        </div>
        
        <div class="chart-card">
          <h4>Tỷ lệ nộp bài tập</h4>
          <div class="chart-container">
            <canvas id="assignmentSubmissionChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="dashboard-card">
        <h3>Khóa học của tôi</h3>
        <div class="course-list">
          ${myCourses.slice(0, 3).map(course => {
            const studentCount = Array.isArray(course.students) ? course.students.length : 0;
            return `
            <div class="course-item">
              <div class="course-info">
                <div class="course-title">${course.title}</div>
                <div class="course-students">${studentCount} sinh viên</div>
              </div>
            </div>
          `;
          }).join('')}
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
      </div>
    </div>
  `;

  // Initialize charts after DOM is ready
  setTimeout(() => {
    createStudentPerformanceChart('studentPerformanceChart', user.id);
    createExamResultsChart('examResultsChart', user.id);
    createCourseEnrollmentChart('courseEnrollmentChart', user.id);
    createAssignmentSubmissionChart('assignmentSubmissionChart', user.id);
  }, 100);

  return container;
}
