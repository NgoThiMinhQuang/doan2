
// Import core modules
import { stateManager } from './state.js';
import { initAuth, isAuthenticated } from './auth.js';
import { navigateTo, handlePopState } from './routing.js';

// Import components
import { renderLogin } from './components/login.js';
import { renderLayout } from './components/layout.js';

// Import dashboard modules
import { renderDashboard } from './dashboard.js';

// Import admin modules
import { renderAdminUsers } from './Admin/A-Users.js';
import { renderAdminCourses } from './Admin/A-Courses.js';
import { renderAdminExams } from './Admin/A-Exams.js';
import { renderAdminAssignments } from './Admin/A-Assignments.js';
import { renderAdminReports } from './Admin/A-Reports.js';
import { renderAdminForum } from './Admin/A-Forum.js';

// Import teacher modules
import { renderTeacherCourses } from './teacher/T-Courses.js';
import { renderTeacherGrading } from './teacher/T-Garding.js';
import { renderTeacherChat } from './teacher/T-Chat.js';
import { renderTeacherExercises } from './teacher/T-Exercise.js';

// Import student modules
import { renderStudentCourses } from './Student/S-Courses.js';
import { renderStudentAssignments } from './Student/S-Assignments.js';
import { renderStudentExams } from './Student/S-Exams.js';
import { renderStudentChat } from './Student/S-Chat.js';
import { renderStudentProgress } from './Student/S-Progress.js';

// Import teacher exams
import { renderTeacherExams } from './teacher/T-Exams.js';

// Import course details (shared)
import { renderCourseDetails } from './CourseDetails.js';

// Import trang chủ
import { renderTrangChu } from './TrangChu.js';

// Import utilities and charts
import {
  addToStorage,
  deleteFromStorage,
  generateId,
  getFromStorage,
  initializeSampleData,
  resetSampleData,
  saveToStorage,
  STORAGE_KEYS,
  updateInStorage,
} from './utils.js';

import {
  createStudentPerformanceChart,
  createExamResultsChart,
  createCourseEnrollmentChart,
  createAssignmentSubmissionChart
} from './charts.js';


function renderApp() {
  const state = stateManager.getState();
  const root = document.getElementById('root');

  if (!root) return;

  // Clear root
  root.innerHTML = '';

  // Get current route
  const route = state.currentRoute;

  // Check if authenticated
  if (!isAuthenticated()) {
    // Show home page when not authenticated (unless explicitly going to login)
    if (route === '/login') {
      // Remove home page styling when showing login page
      document.body.classList.remove('showing-home-page');
      document.body.style.background = '';
      document.body.style.backgroundImage = '';
      
      const loginPage = renderLogin();
      root.appendChild(loginPage);
      return;
    }
    // Show home page for root or other routes
    const homePage = renderTrangChu();
    root.appendChild(homePage);
    return;
  }

  // Render authenticated pages
  // Remove home page styling when showing authenticated pages
  document.body.classList.remove('showing-home-page');
  document.body.style.background = '';
  document.body.style.backgroundImage = '';
  
  let content;

  if (route === '/dashboard') {
    content = renderDashboard();
  } else if (route === '/admin/users') {
    content = renderAdminUsers();
  } else if (route === '/admin/courses') {
    content = renderAdminCourses();
  } else if (route === '/admin/exams') {
    content = renderAdminExams();
  } else if (route === '/admin/assignments') {
    content = renderAdminAssignments();
  } else if (route === '/admin/reports') {
    content = renderAdminReports();
  } else if (route === '/admin/forum') {
    content = renderAdminForum();
  } else if (route === '/teacher/courses') {
    content = renderTeacherCourses();
  } else if (route === '/teacher/grading') {
    content = renderTeacherGrading();
  } else if (route === '/teacher/chat') {
    content = renderTeacherChat();
  } else if (route === '/teacher/exams') {
    content = renderTeacherExams();
  } else if (route === '/teacher/exercises') {
    content = renderTeacherExercises();
  } else if (route === '/student/courses') {
    content = renderStudentCourses();
  } else if (route === '/student/assignments') {
    content = renderStudentAssignments();
  } else if (route === '/student/exams') {
    content = renderStudentExams();
  } else if (route === '/student/chat') {
    content = renderStudentChat();
  } else if (route === '/student/progress') {
    content = renderStudentProgress();
  } else if (route.startsWith('/student/course/')) {
    const courseId = route.split('/').pop();
    content = renderCourseDetails(courseId, 'student');
  } else if (route.startsWith('/teacher/course/')) {
    const courseId = route.split('/').pop();
    content = renderCourseDetails(courseId, 'teacher');
  } else if (route === '/login') {
    const loginPage = renderLogin();
    root.appendChild(loginPage);
    return;
  } else {
    // Default to dashboard for unknown routes
    content = renderDashboard();
  }

  // Wrap content in layout
  const layout = renderLayout(content);
  root.appendChild(layout);
}

export function initApp() {
  initAuth();

  // Set up routing
  window.addEventListener('popstate', handlePopState);

  // Initial render
  renderApp();

  // Subscribe to state changes
  stateManager.subscribe(() => {
    renderApp();
  });

  // Make renderApp available globally for routing
  window.renderApp = renderApp;
}
