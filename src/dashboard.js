import { stateManager } from './state.js';
import { renderAdminDashboard } from './Admin/Admin-dashboard.js';
import { renderTeacherDashboard } from './teacher/Teacher-dashboard.js';
import { renderStudentDashboard } from './Student/Student-dashboard.js';
import { initializeSampleData } from './utils.js';

export function renderDashboard() {
  const user = stateManager.getState().user;

  // Initialize sample data if needed
  initializeSampleData();

  if (user.role === 'admin') {
    return renderAdminDashboard();
  } else if (user.role === 'teacher') {
    return renderTeacherDashboard();
  } else if (user.role === 'student') {
    return renderStudentDashboard();
  }

  return document.createElement('div');
}
