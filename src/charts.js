import { getFromStorage, STORAGE_KEYS } from './utils.js';
import Chart from 'chart.js/auto';

// Chart utility functions for teacher dashboard reports

/**
 * Get student performance data for a teacher's courses (Mock Data)
 */
export function getStudentPerformanceData(teacherId) {
  // Hard-coded mock data for consistent chart display
  return [
    { studentName: 'Ngô Thị Minh Quang', averageScore: 92.5, totalAssessments: 4 },
    { studentName: 'Phạm Văn Hiểu', averageScore: 89.8, totalAssessments: 5 },
    { studentName: 'Lê Thị Lan', averageScore: 87.3, totalAssessments: 3 },
    { studentName: 'Nguyễn Văn Minh', averageScore: 85.7, totalAssessments: 4 },
    { studentName: 'Trần Văn Đức', averageScore: 83.2, totalAssessments: 3 },
    { studentName: 'Hoàng Thị Mai', averageScore: 81.9, totalAssessments: 4 },
    { studentName: 'Vũ Văn Nam', averageScore: 79.5, totalAssessments: 3 },
    { studentName: 'Đặng Thị Hoa', averageScore: 77.8, totalAssessments: 4 },
    { studentName: 'Bùi Văn Tùng', averageScore: 75.2, totalAssessments: 3 },
    { studentName: 'Lý Thị Nga', averageScore: 73.6, totalAssessments: 4 }
  ];
}

/**
 * Get exam results distribution for a teacher's exams (Mock Data)
 */
export function getExamResultsDistribution(teacherId) {
  // Hard-coded mock data for consistent chart display
  return {
    labels: ['A (90-100)', 'B (80-89)', 'C (70-79)', 'D (60-69)', 'F (0-59)'],
    data: [15, 25, 18, 8, 4],
    totalResults: 70
  };
}

/**
 * Get course enrollment statistics (Mock Data)
 */
export function getCourseEnrollmentData(teacherId) {
  // Hard-coded mock data for consistent chart display
  return [
    { courseName: 'Logic mệnh đề', enrollmentCount: 35, courseId: '1' },
    { courseName: 'Logic vị từ và ứng dụng của logic', enrollmentCount: 28, courseId: '3' },
    { courseName: 'Một số phương pháp chứng minh', enrollmentCount: 22, courseId: '4' },
    { courseName: 'Thuật toán và ứng dụng', enrollmentCount: 18, courseId: '5' },
    { courseName: 'Kỹ thuật đếm cơ bản, quan hệ truy hồi', enrollmentCount: 15, courseId: '6' }
  ];
}

/**
 * Get assignment submission statistics (Mock Data)
 */
export function getAssignmentSubmissionData(teacherId) {
  // Hard-coded mock data for consistent chart display
  return [
    { assignmentTitle: 'Bài tập logic mệnh đề', submittedCount: 32, totalStudents: 35, submissionRate: 91 },
    { assignmentTitle: 'Bài tập logic vị từ và ứng dụng của logic', submittedCount: 25, totalStudents: 28, submissionRate: 89 },
    { assignmentTitle: 'Bài tập một số phương pháp chứng minh', submittedCount: 19, totalStudents: 22, submissionRate: 86 },
    { assignmentTitle: 'Bài tập thuật toán và ứng dụng', submittedCount: 15, totalStudents: 18, submissionRate: 83 },
    { assignmentTitle: 'Bài tập kỹ thuật đếm cơ bản, quan hệ truy hồi', submittedCount: 12, totalStudents: 15, submissionRate: 80 }
  ];
}

/**
 * Create a bar chart for student performance
 */
export function createStudentPerformanceChart(canvasId, teacherId) {
  const data = getStudentPerformanceData(teacherId);
  const ctx = document.getElementById(canvasId);
  
  if (!ctx) return null;
  
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.slice(0, 10).map(item => item.studentName), // Top 10 students
      datasets: [{
        label: 'Điểm trung bình',
        data: data.slice(0, 10).map(item => item.averageScore),
        backgroundColor: 'rgba(52, 152, 219, 0.8)',
        borderColor: 'rgba(52, 152, 219, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Điểm số'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Sinh viên'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Top 10 Sinh viên có điểm cao nhất'
        },
        legend: {
          display: false
        }
      }
    }
  });
}

/**
 * Create a doughnut chart for exam results distribution
 */
export function createExamResultsChart(canvasId, teacherId) {
  const data = getExamResultsDistribution(teacherId);
  const ctx = document.getElementById(canvasId);
  
  if (!ctx) return null;
  
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.labels,
      datasets: [{
        data: data.data,
        backgroundColor: [
          'rgba(46, 204, 113, 0.8)',  // A - Green
          'rgba(52, 152, 219, 0.8)',  // B - Blue
          'rgba(241, 196, 15, 0.8)',  // C - Yellow
          'rgba(230, 126, 34, 0.8)',  // D - Orange
          'rgba(231, 76, 60, 0.8)'    // F - Red
        ],
        borderColor: [
          'rgba(46, 204, 113, 1)',
          'rgba(52, 152, 219, 1)',
          'rgba(241, 196, 15, 1)',
          'rgba(230, 126, 34, 1)',
          'rgba(231, 76, 60, 1)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Phân bố kết quả thi'
        },
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

/**
 * Create a horizontal bar chart for course enrollment
 */
export function createCourseEnrollmentChart(canvasId, teacherId) {
  const data = getCourseEnrollmentData(teacherId);
  const ctx = document.getElementById(canvasId);
  
  if (!ctx) return null;
  
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(item => item.courseName),
      datasets: [{
        label: 'Số sinh viên đăng ký',
        data: data.map(item => item.enrollmentCount),
        backgroundColor: 'rgba(155, 89, 182, 0.8)',
        borderColor: 'rgba(155, 89, 182, 1)',
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Số sinh viên'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Số lượng sinh viên đăng ký theo khóa học'
        },
        legend: {
          display: false
        }
      }
    }
  });
}

/**
 * Create a line chart for assignment submission rates
 */
export function createAssignmentSubmissionChart(canvasId, teacherId) {
  const data = getAssignmentSubmissionData(teacherId);
  const ctx = document.getElementById(canvasId);
  
  if (!ctx) return null;
  
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(item => item.assignmentTitle),
      datasets: [{
        label: 'Tỷ lệ nộp bài (%)',
        data: data.map(item => item.submissionRate),
        borderColor: 'rgba(231, 76, 60, 1)',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Tỷ lệ (%)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Bài tập'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Tỷ lệ nộp bài tập'
        },
        legend: {
          display: false
        }
      }
    }
  });
}
