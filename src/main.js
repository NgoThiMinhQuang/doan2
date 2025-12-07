import './index.css';
import './App.css';
import './styles/Layout.css';
import './styles/Sidebar.css';
import './styles/Header.css';
import './styles/Login.css';
import './styles/Dashboard.css';
import './styles/AdminUsers.css';
import './styles/AdminCourses.css';
import './styles/AdminExams.css';
import './styles/AdminAssignments.css';
import './styles/AdminReports.css';
import './styles/AdminForum.css';
import './styles/TeacherCourses.css';
import './styles/TeachErexercise.css';
import './styles/TeacherExams.css';
import './styles/TeacherGrading.css';
import './styles/TeacherChat.css';
import './styles/StudentCourses.css';
import './styles/BrowseCourses.css';
import './styles/StudentAssignments.css';
import './styles/StudentExams.css';
import './styles/StudentChat.css';
import './styles/StudentProgress.css';
import './styles/CourseDetails.css';
import './styles/Charts.css';
// Import Modal.css to override other modal styles
import './styles/Modal.css';
// Import Chatbot.css
import './styles/Chatbot.css';
// Import TrangChu.css LAST to ensure landing page styles override everything
import './styles/TrangChu.css';
import { initApp } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});