import { stateManager } from '../state.js';
import { navigateTo } from '../routing.js';
import {
  getFromStorage,
  STORAGE_KEYS
} from '../utils.js';

export function renderStudentProgress() {
    const currentUser = stateManager.getState().user;
    const courses = getFromStorage(STORAGE_KEYS.COURSES);
    const assignments = getFromStorage(STORAGE_KEYS.ASSIGNMENTS);
    const submissions = getFromStorage(STORAGE_KEYS.SUBMISSIONS);
    const exams = getFromStorage(STORAGE_KEYS.EXAMS);
  
    // Get courses the student is enrolled in
    const myCourses = courses.filter(course => course.students?.includes(currentUser.id));
  
    const container = document.createElement('div');
    container.className = 'student-progress';
  
    // Calculate progress for each course
    const courseProgress = myCourses.map(course => {
      // Chỉ lấy bài tập do giáo viên của khóa học này tạo
      const courseAssignments = assignments.filter(a => 
        a.courseId === course.id && a.teacherId === course.teacherId
      );
      const courseSubmissions = submissions.filter(s =>
        s.studentId === currentUser.id && courseAssignments.some(a => a.id === s.assignmentId)
      );
      const submittedCount = courseSubmissions?.length;
      const totalAssignments = courseAssignments?.length;
      const assignmentProgress = totalAssignments > 0 ? (submittedCount / totalAssignments) * 100 : 0;
  
      // Mock lesson progress (in a real app, this would come from lesson progress data)
      const lessonProgress = Math.floor(Math.random() * 100); // Random for demo
  
      const overallProgress = (assignmentProgress + lessonProgress) / 2;
  
      return {
        course,
        assignmentProgress: Math.round(assignmentProgress),
        lessonProgress,
        overallProgress: Math.round(overallProgress),
        submittedAssignments: submittedCount,
        totalAssignments
      };
    });
  
    const overallAverage = courseProgress?.length > 0
      ? Math.round(courseProgress.reduce((sum, cp) => sum + cp.overallProgress, 0) / courseProgress?.length)
      : 0;
  
    container.innerHTML = `
      <div class="page-header">
        <h1>Tiến độ học tập</h1>
      </div>
  
      <div class="progress-overview">
        <div class="progress-card">
          <div class="progress-header">
            <h3>Tiến độ tổng thể</h3>
            <div class="progress-circle" style="--progress: ${overallAverage}%">
              <span class="progress-value">${overallAverage}%</span>
            </div>
          </div>
          <div class="progress-stats">
            <div class="stat">
              <span class="stat-label">Khóa học đang học:</span>
              <span class="stat-value">${myCourses?.length}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Bài tập đã nộp:</span>
              <span class="stat-value">${submissions.filter(s => s.studentId === currentUser.id)?.length}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Kỳ thi đã tham gia:</span>
              <span class="stat-value">0</span>
            </div>
          </div>
        </div>
      </div>
  
      <div class="courses-progress">
        <h3>Tiến độ từng khóa học</h3>
        <div class="progress-list">
          ${courseProgress.map(cp => `
            <div class="course-progress-card">
              <div class="course-progress-header">
                <h4>${cp.course.title}</h4>
                <span class="overall-progress">${cp.overallProgress}% hoàn thành</span>
              </div>
              <div class="progress-details">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${cp.overallProgress}%"></div>
                </div>
                <div class="progress-breakdown">
                  <div class="progress-item">
                    <span>Bài học:</span>
                    <span>${cp.lessonProgress}%</span>
                  </div>
                  <div class="progress-item">
                    <span>Bài tập:</span>
                    <span>${cp.assignmentProgress}% (${cp.submittedAssignments}/${cp.totalAssignments})</span>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
  
      <div class="achievements-section">
        <h3>Thành tích</h3>
        <div class="achievements-grid">
          <div class="achievement-card ${myCourses?.length > 0 ? 'unlocked' : 'locked'}">
            <div class="achievement-icon">🎓</div>
            <div class="achievement-info">
              <h4>Bắt đầu học tập</h4>
              <p>Đăng ký khóa học đầu tiên</p>
            </div>
          </div>
          <div class="achievement-card ${submissions.filter(s => s.studentId === currentUser.id)?.length > 0 ? 'unlocked' : 'locked'}">
            <div class="achievement-icon">📝</div>
            <div class="achievement-info">
              <h4>Nộp bài đầu tiên</h4>
              <p>Hoàn thành bài tập đầu tiên</p>
            </div>
          </div>
          <div class="achievement-card locked">
            <div class="achievement-icon">🏆</div>
            <div class="achievement-info">
              <h4>Hoàn thành khóa học</h4>
              <p>Hoàn thành 100% một khóa học</p>
            </div>
          </div>
        </div>
      </div>
    `;
  
    return container;
  }