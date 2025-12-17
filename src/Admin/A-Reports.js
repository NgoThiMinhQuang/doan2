import { stateManager } from '../state.js';
import { navigateTo } from '../routing.js';
import {
  getFromStorage,
  STORAGE_KEYS
} from '../utils.js';

export function renderAdminReports() {
    // Kiểm tra quyền truy cập
    const currentUser = stateManager.getState().user;
    if (!currentUser || currentUser.role !== 'admin') {
      navigateTo('/dashboard');
      return document.createElement('div');
    }
    
    const users = getFromStorage(STORAGE_KEYS.USERS) || [];
    const courses = getFromStorage(STORAGE_KEYS.COURSES) || [];
    const assignments = getFromStorage(STORAGE_KEYS.ASSIGNMENTS) || [];
    const exams = getFromStorage(STORAGE_KEYS.EXAMS) || [];
    const submissions = getFromStorage(STORAGE_KEYS.SUBMISSIONS) || [];
    const courseCompletions = getFromStorage(STORAGE_KEYS.COURSE_COMPLETIONS) || [];
    const lessonProgress = getFromStorage(STORAGE_KEYS.LESSON_PROGRESS) || [];
  
    const container = document.createElement('div');
    container.className = 'admin-reports';
  
    // Calculate statistics
    const totalUsers = users?.length;
    const activeUsers = users.filter(u => u.isActive)?.length;
    const totalCourses = courses?.length;
    const activeCourses = courses.filter(c => c.isActive)?.length;
    const totalAssignments = assignments?.length;
    const activeAssignments = assignments.filter(a => a.isActive)?.length;
    const totalExams = exams?.length;
    const activeExams = exams.filter(e => e.isActive)?.length;
  
    // User role distribution
    const adminCount = users.filter(u => u.role === 'admin')?.length;
    const teacherCount = users.filter(u => u.role === 'teacher')?.length;
    const studentCount = users.filter(u => u.role === 'student')?.length;

    // Calculate course completion rates
    const courseCompletionRates = courses.map(course => {
      const enrolledStudents = course.students || [];
      const totalEnrolled = enrolledStudents.length;
      
      if (totalEnrolled === 0) {
        return {
          course,
          completionRate: 0,
          completedCount: 0,
          totalEnrolled: 0
        };
      }

      // Calculate completed students - check if all lessons are completed
      let completedCount = 0;
      const courseLessons = course.lessons || [];
      const totalLessons = courseLessons.length;

      if (totalLessons === 0) {
        return {
          course,
          completionRate: 0,
          completedCount: 0,
          totalEnrolled
        };
      }

      enrolledStudents.forEach(studentId => {
        // Check if student completed all lessons
        const studentLessons = lessonProgress.filter(
          p => p.userId === studentId && 
          courseLessons.some(lesson => lesson.id === p.lessonId) &&
          p.completed === true
        );
        
        // Check course completions
        const isCompleted = courseCompletions.some(
          cc => cc.userId === studentId && cc.courseId === course.id && cc.completed === true
        );

        // Consider completed if all lessons completed or explicitly marked as completed
        if (isCompleted || (studentLessons.length === totalLessons && totalLessons > 0)) {
          completedCount++;
        }
      });

      const completionRate = totalEnrolled > 0 ? (completedCount / totalEnrolled) * 100 : 0;

      return {
        course,
        completionRate: Math.round(completionRate * 10) / 10,
        completedCount,
        totalEnrolled
      };
    });

    // Calculate average completion rate
    const totalEnrolledAll = courseCompletionRates.reduce((sum, r) => sum + r.totalEnrolled, 0);
    const totalCompletedAll = courseCompletionRates.reduce((sum, r) => sum + r.completedCount, 0);
    const averageCompletionRate = totalEnrolledAll > 0 
      ? Math.round((totalCompletedAll / totalEnrolledAll) * 100 * 10) / 10 
      : 0;

    // Get top 3 courses by completion rate
    const sortedCoursesByCompletion = [...courseCompletionRates]
      .filter(cr => cr.totalEnrolled > 0)
      .sort((a, b) => b.completionRate - a.completionRate);

    const topCourse = sortedCoursesByCompletion.length > 0 ? sortedCoursesByCompletion[0] : null;
    const bottomCourse = sortedCoursesByCompletion.length > 0 
      ? sortedCoursesByCompletion[sortedCoursesByCompletion.length - 1] 
      : null;
    const middleCourse = sortedCoursesByCompletion.length > 2
      ? sortedCoursesByCompletion[Math.floor(sortedCoursesByCompletion.length / 2)]
      : null;

    // Calculate on-time submission rate
    const totalSubmissions = submissions.length;
    let onTimeSubmissions = 0;

    submissions.forEach(submission => {
      const assignment = assignments.find(a => a.id === submission.assignmentId);
      if (assignment && assignment.dueDate && submission.submittedAt) {
        const dueDate = new Date(assignment.dueDate);
        const submittedAt = new Date(submission.submittedAt);
        if (submittedAt <= dueDate) {
          onTimeSubmissions++;
        }
      }
    });

    const onTimeSubmissionRate = totalSubmissions > 0 
      ? Math.round((onTimeSubmissions / totalSubmissions) * 100 * 10) / 10 
      : 0;
  
    container.innerHTML = `
      <div class="page-header">
        <h1>Báo cáo thống kê</h1>
        <button class="btn btn-primary export-report-btn">Xuất báo cáo</button>
      </div>
  
      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-value">${totalUsers}</div>
            <div class="stat-label">Tổng người dùng</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📚</div>
          <div class="stat-content">
            <div class="stat-value">${totalCourses}</div>
            <div class="stat-label">Tổng khóa học</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <div class="stat-value">${totalAssignments}</div>
            <div class="stat-label">Tổng bài tập</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div class="stat-content">
            <div class="stat-value">${totalExams}</div>
            <div class="stat-label">Tổng kỳ thi</div>
          </div>
        </div>
      </div>
  
      <div class="reports-grid">
        <div class="report-card">
          <h3>Phân bố người dùng theo vai trò</h3>
          <div class="chart-container">
            <div class="role-distribution">
              <div class="role-item">
                <span class="role-label">Quản trị viên:</span>
                <span class="role-count">${adminCount}</span>
                <div class="role-bar" style="width: ${totalUsers > 0 ? (adminCount / totalUsers * 100) : 0}%"></div>
              </div>
              <div class="role-item">
                <span class="role-label">Giảng viên:</span>
                <span class="role-count">${teacherCount}</span>
                <div class="role-bar" style="width: ${totalUsers > 0 ? (teacherCount / totalUsers * 100) : 0}%"></div>
              </div>
              <div class="role-item">
                <span class="role-label">Sinh viên:</span>
                <span class="role-count">${studentCount}</span>
                <div class="role-bar" style="width: ${totalUsers > 0 ? (studentCount / totalUsers * 100) : 0}%"></div>
              </div>
            </div>
          </div>
        </div>
  
        <div class="report-card">
          <h3>Số khóa học phụ trách theo giảng viên</h3>
          <p class="report-description">Giúp admin cân bằng tải giảng viên</p>
          <div class="courses-by-teacher">
            ${Object.entries(courses.reduce((acc, course) => {
      const teacher = users.find(u => u.id === course.teacherId);
      const teacherName = teacher ? teacher.fullName : 'N/A';
      if (!acc[teacherName]) acc[teacherName] = 0;
      acc[teacherName]++;
      return acc;
    }, {})).map(([teacher, count]) => `
              <div class="teacher-course-item">
                <span class="teacher-name">${teacher}:</span>
                <span class="course-count">${count} khóa học</span>
              </div>
            `).join('')}
          </div>
        </div>
  
        <div class="report-card assignment-exam-card">
          <h3>Thống kê bài tập và kỳ thi</h3>
          <div class="assignment-exam-stats">
            <div class="stat-item">
              <span class="stat-label">Bài tập đã giao:</span>
              <span class="stat-value">${totalAssignments}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Kỳ thi đã tạo:</span>
              <span class="stat-value">${totalExams}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Tổng số học sinh:</span>
              <span class="stat-value">${studentCount}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Tổng số giảng viên:</span>
              <span class="stat-value">${teacherCount}</span>
          </div>
        </div>
      </div>
      
        <div class="report-card large-card">
          <h3>Tiến độ & tỉ lệ hoàn thành học tập</h3>
          <div class="progress-stats">
            <div class="progress-stat-item">
              <div class="progress-stat-label">Tỉ lệ hoàn thành khóa học trung bình</div>
              <div class="progress-stat-value">${averageCompletionRate}%</div>
              <div class="progress-stat-detail">${totalCompletedAll} / ${totalEnrolledAll} sinh viên</div>
          </div>
          
            <div class="progress-stat-item">
              <div class="progress-stat-label">Tỉ lệ nộp bài tập đúng hạn</div>
              <div class="progress-stat-value">${onTimeSubmissionRate}%</div>
              <div class="progress-stat-detail">${onTimeSubmissions} / ${totalSubmissions} bài nộp</div>
            </div>
          </div>
          
          <div class="course-progress-list">
            <h4>Danh sách khóa học</h4>
            ${topCourse ? `
              <div class="course-progress-item top">
                <div class="course-progress-header">
                  <span class="course-progress-badge">🏆 Cao nhất</span>
                  <span class="course-progress-rate">${topCourse.completionRate}%</span>
                </div>
                <div class="course-progress-name">${topCourse.course.title}</div>
                <div class="course-progress-detail">${topCourse.completedCount} / ${topCourse.totalEnrolled} sinh viên</div>
              </div>
            ` : ''}
            ${middleCourse && middleCourse.course && (!topCourse || middleCourse.course.id !== topCourse.course.id) && (!bottomCourse || middleCourse.course.id !== bottomCourse.course.id) ? `
              <div class="course-progress-item middle">
                <div class="course-progress-header">
                  <span class="course-progress-badge">📊 Trung bình</span>
                  <span class="course-progress-rate">${middleCourse.completionRate}%</span>
                </div>
                <div class="course-progress-name">${middleCourse.course.title}</div>
                <div class="course-progress-detail">${middleCourse.completedCount} / ${middleCourse.totalEnrolled} sinh viên</div>
            </div>
            ` : ''}
            ${bottomCourse && bottomCourse.course && (!topCourse || bottomCourse.course.id !== topCourse.course.id) ? `
              <div class="course-progress-item bottom">
                <div class="course-progress-header">
                  <span class="course-progress-badge">📉 Thấp nhất</span>
                  <span class="course-progress-rate">${bottomCourse.completionRate}%</span>
          </div>
                <div class="course-progress-name">${bottomCourse.course.title}</div>
                <div class="course-progress-detail">${bottomCourse.completedCount} / ${bottomCourse.totalEnrolled} sinh viên</div>
            </div>
            ` : ''}
            ${!topCourse && !bottomCourse ? `
              <div class="no-data">Chưa có dữ liệu tiến độ học tập</div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  
    // Export functionality
    container.querySelector('.export-report-btn').addEventListener('click', () => {
      const currentUser = stateManager.getState().user;
      const examResults = getFromStorage(STORAGE_KEYS.EXAM_RESULTS) || [];
      
      // Tính toán thêm các thống kê cho PDF
      const totalExamResults = examResults.length;
      const avgScore = totalExamResults > 0 
        ? examResults.reduce((sum, result) => sum + (result.percentage || 0), 0) / totalExamResults 
        : 0;
      const passRate = totalExamResults > 0
        ? examResults.filter(r => (r.percentage || 0) >= 50).length / totalExamResults * 100
        : 0;
      
      const inactiveCourses = courses.filter(c => !c.isActive)?.length || 0;
      const activeAssignmentRate = totalAssignments > 0 
        ? (activeAssignments / totalAssignments) * 100 
        : 0;
      
      exportReport({
        users,
        courses,
        assignments,
        exams,
        submissions,
        courseCompletions,
        lessonProgress,
        examResults,
        currentUser,
        totalUsers,
        activeUsers,
        totalCourses,
        activeCourses,
        inactiveCourses,
        totalAssignments,
        activeAssignments,
        activeAssignmentRate,
        totalExams,
        activeExams,
        adminCount,
        teacherCount,
        studentCount,
        averageCompletionRate,
        totalCompletedAll,
        totalEnrolledAll,
        onTimeSubmissionRate,
        onTimeSubmissions,
        totalSubmissions,
        topCourse,
        bottomCourse,
        middleCourse,
        teacherCourses: courses.reduce((acc, course) => {
          const teacher = users.find(u => u.id === course.teacherId);
          const teacherName = teacher ? teacher.fullName : 'N/A';
          if (!acc[teacherName]) acc[teacherName] = 0;
          acc[teacherName]++;
          return acc;
        }, {}),
        avgScore: Math.round(avgScore * 10) / 10,
        passRate: Math.round(passRate * 10) / 10,
        totalExamResults
      });
    });
  
    return container;
  }
  
  function exportReport(reportData) {
    try {
      // Sử dụng html2pdf.js để hỗ trợ Unicode tốt hơn
      if (typeof window.html2pdf === 'undefined') {
        const existingScript = document.querySelector('script[src*="html2pdf"]');
        if (!existingScript) {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
          script.onload = () => {
            setTimeout(() => {
              try {
                generatePDFFromHTML(reportData);
              } catch (error) {
                console.error('Lỗi khi tạo PDF:', error);
                alert('Lỗi khi tạo file PDF. Vui lòng thử lại hoặc kiểm tra console để biết chi tiết.');
              }
            }, 100);
          };
          script.onerror = () => {
            alert('Không thể tải thư viện PDF. Vui lòng kiểm tra kết nối mạng.');
          };
          document.head.appendChild(script);
        } else {
          setTimeout(() => {
            if (typeof window.html2pdf !== 'undefined') {
              generatePDFFromHTML(reportData);
            } else {
              alert('Thư viện PDF chưa sẵn sàng. Vui lòng thử lại sau vài giây.');
            }
          }, 500);
        }
      } else {
        generatePDFFromHTML(reportData);
      }
    } catch (error) {
      console.error('Lỗi khi xuất báo cáo:', error);
      alert('Lỗi khi xuất báo cáo. Vui lòng kiểm tra console để biết chi tiết.');
    }
  }
  
  function generatePDFFromHTML(data) {
    try {
      console.log('Bắt đầu tạo PDF từ HTML...');
      
      // Tạo HTML content từ data
      const htmlContent = createReportHTML(data);
      console.log('HTML content đã được tạo, độ dài:', htmlContent.length);
      
      // Xóa element/container cũ nếu có
      const oldWrapper = document.getElementById('pdf-export-wrapper');
      if (oldWrapper && oldWrapper.parentNode) {
        document.body.removeChild(oldWrapper);
      }
      
      // Tạo element tạm - đặt trong container có kích thước 0 và overflow hidden
      // Điều này đảm bảo không ảnh hưởng layout
      const wrapper = document.createElement('div');
      wrapper.id = 'pdf-export-wrapper';
      wrapper.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 0 !important;
        height: 0 !important;
        overflow: hidden !important;
        z-index: -999999 !important;
        pointer-events: none !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
      `;
      
      // Tạo element tạm để chứa HTML - đặt ở vị trí (0, 0) để html2canvas capture được
      const element = document.createElement('div');
      element.id = 'pdf-export-temp';
      element.style.cssText = `
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 210mm !important;
        padding: 15mm !important;
        background-color: #ffffff !important;
        color: #000000 !important;
        font-size: 12px !important;
        line-height: 1.5 !important;
        box-sizing: border-box !important;
        visibility: visible !important;
        opacity: 1 !important;
        display: block !important;
        margin: 0 !important;
        overflow: visible !important;
        white-space: normal !important;
        font-family: Arial, 'DejaVu Sans', sans-serif !important;
      `;
      
      // Set innerHTML
      element.innerHTML = htmlContent;
      console.log('Element đã được tạo với nội dung, innerHTML length:', element.innerHTML.length);
      
      // Thêm element vào wrapper, wrapper vào body
      wrapper.appendChild(element);
      document.body.appendChild(wrapper);
      console.log('Wrapper và element đã được thêm vào body');
      
      // Kiểm tra nội dung ngay lập tức
      const hasTextContent = element.textContent && element.textContent.trim().length > 0;
      console.log('Element có text content:', hasTextContent);
      
      // Đợi để element được render đầy đủ
      setTimeout(() => {
        const elementHeight = element.scrollHeight || element.offsetHeight;
        const elementWidth = element.scrollWidth || element.offsetWidth;
        const textContent = element.textContent || '';
        const hasContent = textContent.trim().length > 0;
        
        console.log('Element dimensions - height:', elementHeight, 'width:', elementWidth);
        console.log('Element có nội dung:', hasContent, 'Text length:', textContent.length);
        
        if (!elementHeight || !elementWidth || elementHeight === 0 || elementWidth === 0 || !hasContent) {
          console.error('Element không có nội dung hoặc kích thước hợp lệ!');
          if (wrapper && wrapper.parentNode) {
            document.body.removeChild(wrapper);
          }
          alert('Lỗi: Không thể tạo PDF. Element không có nội dung. Vui lòng kiểm tra console.');
          return;
        }
        
        // Cấu hình html2pdf
        const opt = {
          margin: [5, 5, 5, 5],
          filename: `Bao-cao-thong-ke-${new Date().toISOString().split('T')[0]}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 2, 
            useCORS: true, 
            letterRendering: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: elementWidth,
            windowHeight: elementHeight
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };
        
        console.log('Bắt đầu tạo PDF với element dimensions:', elementWidth, 'x', elementHeight);
        
        // Tạo PDF
        window.html2pdf()
          .set(opt)
          .from(element)
          .save()
          .then(() => {
            console.log('PDF đã được tạo thành công!');
            // Xóa wrapper ngay lập tức
            if (wrapper && wrapper.parentNode) {
              document.body.removeChild(wrapper);
            }
          })
          .catch((error) => {
            console.error('Lỗi chi tiết khi tạo PDF:', error);
            console.error('Stack trace:', error.stack);
            if (wrapper && wrapper.parentNode) {
              document.body.removeChild(wrapper);
            }
            alert('Lỗi khi tạo file PDF: ' + (error.message || 'Unknown error') + '. Vui lòng kiểm tra console.');
          });
      }, 1000); // Đợi 1 giây để đảm bảo element được render đầy đủ
      
    } catch (error) {
      console.error('Lỗi khi tạo PDF từ HTML:', error);
      console.error('Stack trace:', error.stack);
      alert('Lỗi khi tạo file PDF: ' + (error.message || 'Unknown error') + '. Vui lòng kiểm tra console.');
    }
  }
  
  function generatePDFDirectly(data) {
    try {
      console.log('Bắt đầu tạo PDF trực tiếp với jsPDF...');
      
      // Lấy jsPDF
      const { jsPDF } = window.jspdf || window;
      if (!jsPDF) {
        throw new Error('Không tìm thấy jsPDF');
      }
      
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let yPos = margin;
      
      const {
        users = [], courses = [], assignments = [], exams = [], examResults = [], lessonProgress = [],
        currentUser = null, totalUsers = 0, activeUsers = 0, totalCourses = 0, activeCourses = 0,
        inactiveCourses = 0, totalAssignments = 0, activeAssignments = 0, totalExams = 0,
        activeExams = 0, adminCount = 0, teacherCount = 0, studentCount = 0,
        averageCompletionRate = 0, totalCompletedAll = 0, totalEnrolledAll = 0,
        onTimeSubmissionRate = 0, onTimeSubmissions = 0, totalSubmissions = 0,
        topCourse = null, bottomCourse = null, teacherCourses = {},
        avgScore = 0, passRate = 0, totalExamResults = 0
      } = data;
      
      const exportDate = new Date().toLocaleDateString('vi-VN', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      const exporterName = currentUser ? currentUser.fullName : 'Hệ thống';
      const activeAssignmentRateValue = totalAssignments > 0
        ? ((activeAssignments / totalAssignments) * 100).toFixed(1)
        : '0.0';
      
      // Helper function để thêm text với wrap
      const addText = (text, fontSize = 11, isBold = false, x = margin) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        const lines = doc.splitTextToSize(text, contentWidth);
        if (yPos + (lines.length * fontSize * 0.4) > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }
        doc.text(lines, x, yPos);
        yPos += lines.length * fontSize * 0.4 + 3;
      };
      
      // Header
      addText('HỆ THỐNG QUẢN LÝ HỌC TRỰC TUYẾN', 18, true, pageWidth / 2);
      addText('BÁO CÁO THỐNG KÊ', 14, true, pageWidth / 2);
      yPos += 5;
      
      // 1. THÔNG TIN HỆ THỐNG
      addText('1. THÔNG TIN HỆ THỐNG', 14, true);
      addText(`Tên hệ thống: Hệ thống Quản lý Học trực tuyến (LMS)`, 11);
      addText(`Ngày giờ xuất báo cáo: ${exportDate}`, 11);
      addText(`Người xuất báo cáo: ${exporterName}`, 11);
      addText(`Phiên bản / Mô-đun: Admin Reports v1.0`, 11);
      yPos += 5;
      
      // 2. THỐNG KÊ TỔNG QUAN
      addText('2. THỐNG KÊ TỔNG QUAN', 14, true);
      addText(`• Tổng số người dùng: ${totalUsers}`, 11);
      addText(`  - Số admin: ${adminCount}`, 11);
      addText(`  - Số giảng viên: ${teacherCount}`, 11);
      addText(`  - Số sinh viên: ${studentCount}`, 11);
      addText(`• Tổng số khóa học: ${totalCourses}`, 11);
      addText(`• Tổng số bài tập: ${totalAssignments}`, 11);
      addText(`• Tổng số kỳ thi: ${totalExams}`, 11);
      yPos += 5;
      
      // 3. PHÂN BỐ NGƯỜI DÙNG THEO VAI TRÒ
      addText('3. PHÂN BỐ NGƯỜI DÙNG THEO VAI TRÒ', 14, true);
      
      // Tạo bảng thủ công
      const colWidths = [60, 30, 30];
      const startX = margin;
      let tableY = yPos;
      
      // Header
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Vai trò', startX, tableY);
      doc.text('Số lượng', startX + colWidths[0], tableY);
      doc.text('Tỉ lệ', startX + colWidths[0] + colWidths[1], tableY);
      tableY += 6;
      
      // Vẽ đường kẻ header
      doc.setLineWidth(0.5);
      doc.line(startX, tableY - 8, startX + colWidths[0] + colWidths[1] + colWidths[2], tableY - 8);
      
      // Rows
      doc.setFont('helvetica', 'normal');
      const rows = [
        ['Admin', adminCount.toString(), totalUsers > 0 ? ((adminCount / totalUsers) * 100).toFixed(1) + '%' : '0.0%'],
        ['Giảng viên', teacherCount.toString(), totalUsers > 0 ? ((teacherCount / totalUsers) * 100).toFixed(1) + '%' : '0.0%'],
        ['Sinh viên', studentCount.toString(), totalUsers > 0 ? ((studentCount / totalUsers) * 100).toFixed(1) + '%' : '0.0%']
      ];
      
      rows.forEach(row => {
        if (tableY > pageHeight - margin) {
          doc.addPage();
          tableY = margin;
        }
        doc.text(row[0], startX, tableY);
        doc.text(row[1], startX + colWidths[0], tableY);
        doc.text(row[2], startX + colWidths[0] + colWidths[1], tableY);
        tableY += 7;
      });
      
      yPos = tableY + 5;
      
      // 4. THỐNG KÊ KHÓA HỌC
      addText('4. THỐNG KÊ KHÓA HỌC', 14, true);
      addText('4.1. Số khóa học theo giảng viên', 12, true);
      addText('(Giúp admin cân bằng tải giảng viên)', 10, false);
      
      if (Object.keys(teacherCourses).length > 0) {
        Object.entries(teacherCourses).forEach(([teacher, count]) => {
          addText(`  • ${teacher}: ${count} khóa học`, 11);
        });
      } else {
        addText('  Chưa có dữ liệu', 11);
      }
      
      addText('4.2. Tình trạng khóa học', 12, true);
      addText(`  • Số khóa đang hoạt động: ${activeCourses}`, 11);
      addText(`  • Số khóa tạm dừng: ${inactiveCourses}`, 11);
      yPos += 5;
      
      // 5. BÀI TẬP & KỲ THI
      addText('5. BÀI TẬP & KỲ THI', 14, true);
      addText('5.1. Bài tập', 12, true);
      addText(`  • Tổng bài tập: ${totalAssignments}`, 11);
      addText(`  • Tỉ lệ bài tập đang hoạt động: ${activeAssignmentRateValue}%`, 11);
      addText(`  • Tỉ lệ nộp bài đúng hạn: ${onTimeSubmissionRate}%`, 11);
      addText(`  • Tổng lượt nộp bài: ${totalSubmissions}`, 11);
      
      addText('5.2. Kỳ thi', 12, true);
      addText(`  • Tổng kỳ thi: ${totalExams}`, 11);
      if (totalExamResults > 0) {
        addText(`  • Điểm trung bình: ${avgScore.toFixed(1)}%`, 11);
        addText(`  • Tỉ lệ đạt ≥ 50%: ${passRate.toFixed(1)}%`, 11);
        addText(`  • Tổng số lượt thi: ${totalExamResults}`, 11);
      } else {
        addText(`  • Điểm trung bình: Chưa có dữ liệu`, 11);
        addText(`  • Tỉ lệ đạt ≥ 50%: Chưa có dữ liệu`, 11);
        addText(`  • Tổng số lượt thi: 0`, 11);
      }
      yPos += 5;
      
      // 6. TIẾN ĐỘ - TỈ LỆ HOÀN THÀNH
      addText('6. TIẾN ĐỘ - TỈ LỆ HOÀN THÀNH', 14, true);
      addText('(Phân tích theo từng khóa học)', 10, false);
      
      if (totalEnrolledAll > 0) {
        addText(`• % sinh viên hoàn thành khóa học trung bình: ${averageCompletionRate}%`, 11);
        addText(`  (${totalCompletedAll} / ${totalEnrolledAll} sinh viên)`, 11);
        
        if (topCourse && topCourse.course) {
          addText(`• Khóa hoàn thành cao nhất: ${topCourse.course.title}`, 11);
          addText(`  Tỉ lệ: ${topCourse.completionRate}% (${topCourse.completedCount} / ${topCourse.totalEnrolled} sinh viên)`, 11);
        }
        
        if (bottomCourse && bottomCourse.course && (!topCourse || !topCourse.course || bottomCourse.course.id !== topCourse.course.id)) {
          addText(`• Khóa hoàn thành thấp nhất: ${bottomCourse.course.title}`, 11);
          addText(`  Tỉ lệ: ${bottomCourse.completionRate}% (${bottomCourse.completedCount} / ${bottomCourse.totalEnrolled} sinh viên)`, 11);
        }
        
        const totalLessons = courses.reduce((sum, c) => sum + (c.lessons?.length || 0), 0);
        const completedLessons = lessonProgress.filter(p => p.completed === true).length;
        const avgLessonCompletion = totalLessons > 0 && totalEnrolledAll > 0
          ? ((completedLessons / (totalLessons * totalEnrolledAll)) * 100).toFixed(1)
          : '0.0';
        
        addText(`• % hoàn thành bài giảng trung bình: ${avgLessonCompletion}%`, 11);
        addText(`  (${completedLessons} / ${totalLessons * totalEnrolledAll} bài giảng)`, 11);
      } else {
        addText('Định hướng phát triển', 11, true);
        addText('  Hệ thống hiện chưa có đủ dữ liệu về tiến độ học tập.', 11);
        addText('  Chức năng này sẽ được phát triển trong tương lai.', 11);
      }
      
      // Lưu PDF
      const filename = `Bao-cao-thong-ke-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      console.log('PDF đã được tạo thành công!');
      
    } catch (error) {
      console.error('Lỗi khi tạo PDF trực tiếp:', error);
      console.error('Stack trace:', error.stack);
      alert('Lỗi khi tạo file PDF: ' + (error.message || 'Unknown error') + '. Vui lòng kiểm tra console.');
    }
  }

  function createReportHTML(data) {
    const {
      users = [],
      courses = [],
      assignments = [],
      exams = [],
      examResults = [],
      lessonProgress = [],
      currentUser = null,
      totalUsers = 0,
      activeUsers = 0,
      totalCourses = 0,
      activeCourses = 0,
      inactiveCourses = 0,
      totalAssignments = 0,
      activeAssignments = 0,
      totalExams = 0,
      activeExams = 0,
      adminCount = 0,
      teacherCount = 0,
      studentCount = 0,
      averageCompletionRate = 0,
      totalCompletedAll = 0,
      totalEnrolledAll = 0,
      onTimeSubmissionRate = 0,
      onTimeSubmissions = 0,
      totalSubmissions = 0,
      topCourse = null,
      bottomCourse = null,
      teacherCourses = {},
      avgScore = 0,
      passRate = 0,
      totalExamResults = 0
    } = data;

    const exportDate = new Date().toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const exporterName = currentUser ? currentUser.fullName : 'Hệ thống';
    const activeAssignmentRateValue = totalAssignments > 0 
      ? ((activeAssignments / totalAssignments) * 100).toFixed(1) 
      : '0.0';

    // Tạo HTML với style in-line để đảm bảo hiển thị đúng
    let html = `
      <div style="font-family: Arial, 'DejaVu Sans', sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; background: white;">
        <style>
          .report-container { font-family: Arial, 'DejaVu Sans', sans-serif; }
          h1 { text-align: center; font-size: 18px; margin-bottom: 5px; font-weight: bold; }
          h2 { text-align: center; font-size: 14px; margin-top: 5px; margin-bottom: 20px; font-weight: bold; }
          h3 { font-size: 14px; font-weight: bold; margin-top: 20px; }
          h4 { font-size: 12px; font-weight: bold; margin-top: 10px; }
          p { font-size: 11px; margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; }
          th { background-color: #f0f0f0; font-weight: bold; }
          .section { margin-bottom: 15px; }
          .sub-section { margin-left: 20px; }
          hr { border: none; border-top: 1px solid #ccc; margin: 20px 0; }
        </style>
        <h1>HỆ THỐNG QUẢN LÝ HỌC TRỰC TUYẾN</h1>
        <h2>BÁO CÁO THỐNG KÊ</h2>
        <hr style="margin-bottom: 20px;">
        
        <div class="section">
          <h3>1. THÔNG TIN HỆ THỐNG</h3>
          <p>Tên hệ thống: Hệ thống Quản lý Học trực tuyến (LMS)</p>
          <p>Ngày giờ xuất báo cáo: ${exportDate}</p>
          <p>Người xuất báo cáo: ${exporterName}</p>
          <p>Phiên bản / Mô-đun: Admin Reports v1.0</p>
        </div>
        
        <div class="section">
          <h3>2. THỐNG KÊ TỔNG QUAN</h3>
          <p>• Tổng số người dùng: ${totalUsers}</p>
          <p class="sub-section">- Số admin: ${adminCount}</p>
          <p class="sub-section">- Số giảng viên: ${teacherCount}</p>
          <p class="sub-section">- Số sinh viên: ${studentCount}</p>
          <p>• Tổng số khóa học: ${totalCourses}</p>
          <p>• Tổng số bài tập: ${totalAssignments}</p>
          <p>• Tổng số kỳ thi: ${totalExams}</p>
        </div>
        
        <div class="section">
          <h3>3. PHÂN BỐ NGƯỜI DÙNG THEO VAI TRÒ</h3>
          <table>
            <tr>
              <th>Vai trò</th>
              <th>Số lượng</th>
              <th>Tỉ lệ</th>
            </tr>
            <tr>
              <td>Admin</td>
              <td>${adminCount}</td>
              <td>${totalUsers > 0 ? ((adminCount / totalUsers) * 100).toFixed(1) : '0.0'}%</td>
            </tr>
            <tr>
              <td>Giảng viên</td>
              <td>${teacherCount}</td>
              <td>${totalUsers > 0 ? ((teacherCount / totalUsers) * 100).toFixed(1) : '0.0'}%</td>
            </tr>
            <tr>
              <td>Sinh viên</td>
              <td>${studentCount}</td>
              <td>${totalUsers > 0 ? ((studentCount / totalUsers) * 100).toFixed(1) : '0.0'}%</td>
            </tr>
          </table>
        </div>
        
        <div class="section">
          <h3>4. THỐNG KÊ KHÓA HỌC</h3>
          <h4>4.1. Số khóa học theo giảng viên</h4>
          <p style="font-style: italic; font-size: 10px;">(Giúp admin cân bằng tải giảng viên)</p>
    `;

    // Thêm danh sách giảng viên
    if (Object.keys(teacherCourses).length > 0) {
      Object.entries(teacherCourses).forEach(([teacher, count]) => {
        html += `<p class="sub-section">• ${teacher}: ${count} khóa học</p>`;
      });
    } else {
      html += `<p class="sub-section">Chưa có dữ liệu</p>`;
    }

    html += `
          <h4>4.2. Tình trạng khóa học</h4>
          <p class="sub-section">• Số khóa đang hoạt động: ${activeCourses}</p>
          <p class="sub-section">• Số khóa tạm dừng: ${inactiveCourses}</p>
        </div>
        
        <div class="section">
          <h3>5. BÀI TẬP & KỲ THI</h3>
          <h4>5.1. Bài tập</h4>
          <p class="sub-section">• Tổng bài tập: ${totalAssignments}</p>
          <p class="sub-section">• Tỉ lệ bài tập đang hoạt động: ${activeAssignmentRateValue}%</p>
          <p class="sub-section">• Tỉ lệ nộp bài đúng hạn: ${onTimeSubmissionRate}%</p>
          <p class="sub-section">• Tổng lượt nộp bài: ${totalSubmissions}</p>
          
          <h4>5.2. Kỳ thi</h4>
          <p class="sub-section">• Tổng kỳ thi: ${totalExams}</p>
    `;

    if (totalExamResults > 0) {
      html += `
          <p class="sub-section">• Điểm trung bình: ${avgScore.toFixed(1)}%</p>
          <p class="sub-section">• Tỉ lệ đạt ≥ 50%: ${passRate.toFixed(1)}%</p>
          <p class="sub-section">• Tổng số lượt thi: ${totalExamResults}</p>
      `;
    } else {
      html += `
          <p class="sub-section">• Điểm trung bình: Chưa có dữ liệu</p>
          <p class="sub-section">• Tỉ lệ đạt ≥ 50%: Chưa có dữ liệu</p>
          <p class="sub-section">• Tổng số lượt thi: 0</p>
      `;
    }

    html += `
        </div>
        
        <div class="section">
          <h3>6. TIẾN ĐỘ - TỈ LỆ HOÀN THÀNH</h3>
          <p style="font-style: italic; font-size: 10px;">(Phân tích theo từng khóa học)</p>
    `;

    if (totalEnrolledAll > 0) {
      html += `
          <p>• % sinh viên hoàn thành khóa học trung bình: ${averageCompletionRate}%</p>
          <p class="sub-section">(${totalCompletedAll} / ${totalEnrolledAll} sinh viên)</p>
      `;

      if (topCourse && topCourse.course) {
        html += `
          <p>• Khóa hoàn thành cao nhất: ${topCourse.course.title}</p>
          <p class="sub-section">Tỉ lệ: ${topCourse.completionRate}% (${topCourse.completedCount} / ${topCourse.totalEnrolled} sinh viên)</p>
        `;
      }

      if (bottomCourse && bottomCourse.course && (!topCourse || !topCourse.course || bottomCourse.course.id !== topCourse.course.id)) {
        html += `
          <p>• Khóa hoàn thành thấp nhất: ${bottomCourse.course.title}</p>
          <p class="sub-section">Tỉ lệ: ${bottomCourse.completionRate}% (${bottomCourse.completedCount} / ${bottomCourse.totalEnrolled} sinh viên)</p>
        `;
      }

      const totalLessons = courses.reduce((sum, c) => sum + (c.lessons?.length || 0), 0);
      const completedLessons = lessonProgress.filter(p => p.completed === true).length;
      const avgLessonCompletion = totalLessons > 0 && totalEnrolledAll > 0
        ? ((completedLessons / (totalLessons * totalEnrolledAll)) * 100).toFixed(1)
        : '0.0';

      html += `
          <p>• % hoàn thành bài giảng trung bình: ${avgLessonCompletion}%</p>
          <p class="sub-section">(${completedLessons} / ${totalLessons * totalEnrolledAll} bài giảng)</p>
      `;
    } else {
      html += `
          <p style="font-weight: bold;">Định hướng phát triển</p>
          <p class="sub-section">Hệ thống hiện chưa có đủ dữ liệu về tiến độ học tập.</p>
          <p class="sub-section">Chức năng này sẽ được phát triển trong tương lai.</p>
      `;
    }

    html += `
      </div>
    `;
    return html;
  }

  function generatePDF(data) {
    try {
      // Kiểm tra và lấy jsPDF từ window
      let jsPDF;
      if (typeof window.jspdf !== 'undefined') {
        jsPDF = window.jspdf.jsPDF;
      } else if (typeof window.jsPDF !== 'undefined') {
        jsPDF = window.jsPDF;
      } else {
        throw new Error('Thư viện jsPDF chưa được tải. Vui lòng thử lại.');
      }
      
      if (!jsPDF) {
        throw new Error('Không tìm thấy jsPDF trong window. Vui lòng kiểm tra lại.');
      }
      
      const doc = new jsPDF();
      
      const {
        users = [],
        courses = [],
        assignments = [],
        exams = [],
        examResults = [],
        lessonProgress = [],
        currentUser = null,
        totalUsers = 0,
        activeUsers = 0,
        totalCourses = 0,
        activeCourses = 0,
        inactiveCourses = 0,
        totalAssignments = 0,
        activeAssignments = 0,
        activeAssignmentRate = 0,
        totalExams = 0,
        activeExams = 0,
        adminCount = 0,
        teacherCount = 0,
        studentCount = 0,
        averageCompletionRate = 0,
        totalCompletedAll = 0,
        totalEnrolledAll = 0,
        onTimeSubmissionRate = 0,
        onTimeSubmissions = 0,
        totalSubmissions = 0,
        topCourse = null,
        bottomCourse = null,
        middleCourse = null,
        teacherCourses = {},
        avgScore = 0,
        passRate = 0,
        totalExamResults = 0
      } = data;
      
      let yPos = 20;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      // ========================================
      // 1. THÔNG TIN HỆ THỐNG
      // ========================================
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
    doc.text('HỆ THỐNG QUẢN LÝ HỌC TRỰC TUYẾN', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
    
    doc.setFontSize(14);
    doc.text('BÁO CÁO THỐNG KÊ', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('1. THÔNG TIN HỆ THỐNG', margin, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tên hệ thống: Hệ thống Quản lý Học trực tuyến (LMS)`, margin, yPos);
    yPos += 6;
    
    const exportDateTime = new Date();
    const exportDate = exportDateTime.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Ngày giờ xuất báo cáo: ${exportDate}`, margin, yPos);
    yPos += 6;
    
    const exporterName = currentUser ? currentUser.fullName : 'Hệ thống';
    doc.text(`Người xuất báo cáo: ${exporterName}`, margin, yPos);
    yPos += 6;
    
    doc.text('Phiên bản / Mô-đun: Admin Reports v1.0', margin, yPos);
    yPos += 12;
    
    // Kiểm tra nếu cần sang trang mới
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }
    
    // ========================================
    // 2. THỐNG KÊ TỔNG QUAN
    // ========================================
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('2. THỐNG KÊ TỔNG QUAN', margin, yPos);
    yPos += 8;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    doc.text(`• Tổng số người dùng: ${totalUsers}`, margin + 5, yPos);
    yPos += 6;
    doc.text(`  - Số admin: ${adminCount}`, margin + 10, yPos);
    yPos += 6;
    doc.text(`  - Số giảng viên: ${teacherCount}`, margin + 10, yPos);
    yPos += 6;
    doc.text(`  - Số sinh viên: ${studentCount}`, margin + 10, yPos);
    yPos += 8;
    
    doc.text(`• Tổng số khóa học: ${totalCourses}`, margin + 5, yPos);
    yPos += 8;
    
    doc.text(`• Tổng số bài tập: ${totalAssignments}`, margin + 5, yPos);
    yPos += 8;
    
    doc.text(`• Tổng số kỳ thi: ${totalExams}`, margin + 5, yPos);
    yPos += 12;
    
    // Kiểm tra nếu cần sang trang mới
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }
    
    // ========================================
    // 3. PHÂN BỐ NGƯỜI DÙNG THEO VAI TRÒ
    // ========================================
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('3. PHÂN BỐ NGƯỜI DÙNG THEO VAI TRÒ', margin, yPos);
    yPos += 8;
    
    // Tạo bảng
    const tableStartY = yPos;
    const colWidths = [60, 40, 40];
    const headerRowHeight = 8;
    
    // Header bảng
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.rect(margin, tableStartY, colWidths[0], headerRowHeight);
    doc.text('Vai trò', margin + 3, tableStartY + 5.5);
    
    doc.rect(margin + colWidths[0], tableStartY, colWidths[1], headerRowHeight);
    doc.text('Số lượng', margin + colWidths[0] + 3, tableStartY + 5.5);
    
    doc.rect(margin + colWidths[0] + colWidths[1], tableStartY, colWidths[2], headerRowHeight);
    doc.text('Tỉ lệ', margin + colWidths[0] + colWidths[1] + 3, tableStartY + 5.5);
    
    yPos = tableStartY + headerRowHeight;
    
    // Dữ liệu bảng
    doc.setFont('helvetica', 'normal');
    const roles = [
      { name: 'Admin', count: adminCount },
      { name: 'Giảng viên', count: teacherCount },
      { name: 'Sinh viên', count: studentCount }
    ];
    
    roles.forEach(role => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      const percentage = totalUsers > 0 ? ((role.count / totalUsers) * 100).toFixed(1) : '0.0';
      
      doc.rect(margin, yPos, colWidths[0], headerRowHeight);
      doc.text(role.name, margin + 3, yPos + 5.5);
      
      doc.rect(margin + colWidths[0], yPos, colWidths[1], headerRowHeight);
      doc.text(role.count.toString(), margin + colWidths[0] + 3, yPos + 5.5);
      
      doc.rect(margin + colWidths[0] + colWidths[1], yPos, colWidths[2], headerRowHeight);
      doc.text(`${percentage}%`, margin + colWidths[0] + colWidths[1] + 3, yPos + 5.5);
      
      yPos += headerRowHeight;
    });
    
    yPos += 8;
    
    // ========================================
    // 4. THỐNG KÊ KHÓA HỌC
    // ========================================
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('4. THỐNG KÊ KHÓA HỌC', margin, yPos);
    yPos += 8;
    
    // 4.1. Số khóa học theo giảng viên
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('4.1. Số khóa học theo giảng viên', margin + 5, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('(Giúp admin cân bằng tải giảng viên)', margin + 10, yPos);
    yPos += 8;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    if (Object.keys(teacherCourses).length > 0) {
      Object.entries(teacherCourses).forEach(([teacher, count]) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`• ${teacher}: ${count} khóa học`, margin + 10, yPos);
        yPos += 6;
      });
    } else {
      doc.text('Chưa có dữ liệu', margin + 10, yPos);
      yPos += 6;
    }
    
    yPos += 8;
    
    // 4.2. Tình trạng khóa học
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('4.2. Tình trạng khóa học', margin + 5, yPos);
    yPos += 8;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`• Số khóa đang hoạt động: ${activeCourses}`, margin + 10, yPos);
    yPos += 6;
    doc.text(`• Số khóa tạm dừng: ${inactiveCourses}`, margin + 10, yPos);
    yPos += 12;
    
    // ========================================
    // 5. BÀI TẬP & KỲ THI
    // ========================================
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('5. BÀI TẬP & KỲ THI', margin, yPos);
    yPos += 8;
    
    // 5.1. Bài tập
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('5.1. Bài tập', margin + 5, yPos);
    yPos += 8;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`• Tổng bài tập: ${totalAssignments}`, margin + 10, yPos);
    yPos += 6;
    
    const activeAssignmentRateValue = totalAssignments > 0 
      ? ((activeAssignments / totalAssignments) * 100).toFixed(1) 
      : '0.0';
    doc.text(`• Tỉ lệ bài tập đang hoạt động: ${activeAssignmentRateValue}%`, margin + 10, yPos);
    yPos += 6;
    
    doc.text(`• Tỉ lệ nộp bài đúng hạn: ${onTimeSubmissionRate}%`, margin + 10, yPos);
    yPos += 6;
    
    doc.text(`• Tổng lượt nộp bài: ${totalSubmissions}`, margin + 10, yPos);
    yPos += 10;
    
    // 5.2. Kỳ thi
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('5.2. Kỳ thi', margin + 5, yPos);
    yPos += 8;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`• Tổng kỳ thi: ${totalExams}`, margin + 10, yPos);
    yPos += 6;
    
    if (totalExamResults > 0) {
      doc.text(`• Điểm trung bình: ${avgScore.toFixed(1)}%`, margin + 10, yPos);
      yPos += 6;
      
      doc.text(`• Tỉ lệ đạt ≥ 50%: ${passRate.toFixed(1)}%`, margin + 10, yPos);
      yPos += 6;
      
      doc.text(`• Tổng số lượt thi: ${totalExamResults}`, margin + 10, yPos);
    } else {
      doc.text('• Điểm trung bình: Chưa có dữ liệu', margin + 10, yPos);
      yPos += 6;
      
      doc.text('• Tỉ lệ đạt ≥ 50%: Chưa có dữ liệu', margin + 10, yPos);
      yPos += 6;
      
      doc.text('• Tổng số lượt thi: 0', margin + 10, yPos);
    }
    
    yPos += 12;
    
    // ========================================
    // 6. TIẾN ĐỘ - TỈ LỆ HOÀN THÀNH
    // ========================================
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('6. TIẾN ĐỘ - TỈ LỆ HOÀN THÀNH', margin, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('(Phân tích theo từng khóa học)', margin + 5, yPos);
    yPos += 8;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    if (totalEnrolledAll > 0) {
      // % sinh viên hoàn thành khóa học trung bình
      doc.text(`• % sinh viên hoàn thành khóa học trung bình: ${averageCompletionRate}%`, margin + 5, yPos);
      yPos += 6;
      doc.text(`  (${totalCompletedAll} / ${totalEnrolledAll} sinh viên)`, margin + 10, yPos);
      yPos += 8;
      
      // Khóa hoàn thành cao nhất
      if (topCourse && topCourse.course) {
        doc.text(`• Khóa hoàn thành cao nhất: ${topCourse.course.title}`, margin + 5, yPos);
        yPos += 6;
        doc.text(`  Tỉ lệ: ${topCourse.completionRate}% (${topCourse.completedCount} / ${topCourse.totalEnrolled} sinh viên)`, margin + 10, yPos);
        yPos += 8;
      }
      
      // Khóa hoàn thành thấp nhất
      if (bottomCourse && bottomCourse.course && (!topCourse || !topCourse.course || bottomCourse.course.id !== topCourse.course.id)) {
        doc.text(`• Khóa hoàn thành thấp nhất: ${bottomCourse.course.title}`, margin + 5, yPos);
        yPos += 6;
        doc.text(`  Tỉ lệ: ${bottomCourse.completionRate}% (${bottomCourse.completedCount} / ${bottomCourse.totalEnrolled} sinh viên)`, margin + 10, yPos);
        yPos += 8;
      }
      
      // % hoàn thành bài giảng trung bình (nếu có)
      const totalLessons = courses.reduce((sum, c) => sum + (c.lessons?.length || 0), 0);
      const completedLessons = lessonProgress.filter(p => p.completed === true).length;
      const avgLessonCompletion = totalLessons > 0 && totalEnrolledAll > 0
        ? ((completedLessons / (totalLessons * totalEnrolledAll)) * 100).toFixed(1)
        : '0.0';
      
      doc.text(`• % hoàn thành bài giảng trung bình: ${avgLessonCompletion}%`, margin + 5, yPos);
      yPos += 6;
      doc.text(`  (${completedLessons} / ${totalLessons * totalEnrolledAll} bài giảng)`, margin + 10, yPos);
    } else {
      doc.text('Định hướng phát triển', margin + 5, yPos);
      yPos += 6;
      doc.text('Hệ thống hiện chưa có đủ dữ liệu về tiến độ học tập.', margin + 10, yPos);
      yPos += 6;
      doc.text('Chức năng này sẽ được phát triển trong tương lai.', margin + 10, yPos);
    }
    
      // Xuất file PDF
      const fileName = `Bao-cao-thong-ke-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Lỗi chi tiết khi tạo PDF:', error);
      alert(`Lỗi khi tạo file PDF: ${error.message}\n\nVui lòng kiểm tra console để biết thêm chi tiết.`);
    }
  }