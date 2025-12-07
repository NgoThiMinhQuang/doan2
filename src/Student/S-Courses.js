import { stateManager } from '../state.js';
import { navigateTo } from '../routing.js';
import {
  getFromStorage,
  updateInStorage,
  STORAGE_KEYS,
  extractYouTubeId,
  playVideoInModal,
  initializeSampleData,
  showModal
} from '../utils.js';

export function renderStudentCourses() {
    const currentUser = stateManager.getState().user;
    
    // Get courses from storage (không xóa và re-init nữa)
    const courses = getFromStorage(STORAGE_KEYS.COURSES) || [];
    
    // Lọc chỉ các khóa học mà học sinh đã đăng ký
    const myCourses = courses.filter(course => {
      const isValid = course && course.id && course.title;
      const isActive = course.isActive !== false;
      const isEnrolled = course.students?.includes(currentUser.id);
      return isValid && isActive && isEnrolled;
    });
  
    const container = document.createElement('div');
    container.className = 'student-courses';
  
    container.innerHTML = `
      <div class="page-header">
        <h1>📚 Khóa học</h1>
        <div class="courses-stats">
          <div class="stat-item">
            <span class="stat-number">${myCourses.length}</span>
            <span class="stat-label">Khóa học đã đăng ký</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">${myCourses.reduce((total, course) => total + (course.lessons?.length || 0), 0)}</span>
            <span class="stat-label">Tổng bài học</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">${myCourses.filter(course => course.isActive).length}</span>
            <span class="stat-label">Đang hoạt động</span>
          </div>
        </div>
        <div class="courses-tabs">
          <button class="tab-btn active" data-tab="my-courses">
            📖 Khóa học của tôi
          </button>
          <button class="tab-btn" data-tab="browse-courses">
            🔍 Duyệt khóa học
          </button>
        </div>
      </div>

      <!-- Tab: Khóa học của tôi -->
      <div id="my-courses-tab" class="tab-content active">
        ${myCourses.length > 0 ? `
          <div class="courses-filters">
            <div class="filter-group">
              <input type="text" id="my-course-search" placeholder="🔍 Tìm kiếm khóa học..." class="search-input">
              <select id="my-course-sort" class="filter-select">
                <option value="newest">📅 Mới nhất</option>
                <option value="oldest">📅 Cũ nhất</option>
                <option value="name-asc">🔤 Tên A-Z</option>
                <option value="name-desc">🔤 Tên Z-A</option>
                <option value="progress">📈 Tiến độ</option>
              </select>
            </div>
            <div class="view-toggle">
              <button class="view-btn active" data-view="grid" title="Xem dạng lưới">⊞</button>
              <button class="view-btn" data-view="list" title="Xem dạng danh sách">☰</button>
            </div>
          </div>
        ` : ''}
        <div class="courses-grid" id="my-courses-grid">
          ${myCourses.map(course => `
            <div class="course-card" data-course-id="${course.id}">
              <div class="course-header">
                <h3>${course.title}</h3>
                <div class="course-header-actions">
                  <span class="course-status ${course.isActive ? 'active' : 'inactive'}">
                    ${course.isActive ? 'Đang học' : 'Tạm dừng'}
                  </span>
                </div>
              </div>
              <div class="course-info">
                <div class="course-meta-grid">
                  <div class="meta-item">
                    <span class="meta-icon">👨‍🏫</span>
                    <div class="meta-content">
                      <span class="meta-label">Giảng viên</span>
                      <span class="meta-value">${course.teacherName}</span>
                    </div>
                  </div>
                  <div class="meta-item">
                    <span class="meta-icon">📚</span>
                    <div class="meta-content">
                      <span class="meta-label">Bài học</span>
                      <span class="meta-value">${course.lessons?.length || 0} bài</span>
                    </div>
                  </div>
                  <div class="meta-item">
                    <span class="meta-icon">👥</span>
                    <div class="meta-content">
                      <span class="meta-label">Học sinh</span>
                      <span class="meta-value">${course.students?.length || 0} người</span>
                    </div>
                  </div>
                  <div class="meta-item">
                    <span class="meta-icon">📅</span>
                    <div class="meta-content">
                      <span class="meta-label">Tạo ngày</span>
                      <span class="meta-value">${new Date(course.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
                
                <div class="course-description">
                  <p>${course.description.substring(0, 120)}${course.description?.length > 120 ? '...' : ''}</p>
                </div>
                
                ${course.videoUrl ? `
                  <div class="course-video-preview">
                    <div class="video-thumbnail" data-video-url="${course.videoUrl}" data-course-id="${course.id}">
                      <img src="https://img.youtube.com/vi/${extractYouTubeId(course.videoUrl)}/mqdefault.jpg" 
                           alt="Video giới thiệu khóa học" 
                           onerror="this.src='https://via.placeholder.com/320x180?text=Video+Không+Tồn+Tại'">
                      <div class="play-overlay">
                        <div class="play-button">▶️</div>
                      </div>
                      <div class="video-duration">Video giới thiệu</div>
                    </div>
                  </div>
                ` : ''}
                
                <div class="course-progress-bar">
                  <div class="progress-info">
                    <span class="progress-label">Tiến độ học tập</span>
                    <span class="progress-percentage">0%</span>
                  </div>
                  <div class="progress-track">
                    <div class="progress-fill" style="width: 0%"></div>
                  </div>
                </div>
              </div>
              <div class="course-actions">
                <button class="btn btn-sm btn-primary btn-view-lessons" data-course-id="${course.id}">
                  📚 Xem bài học
                </button>
                <button class="btn btn-sm btn-outline btn-view-progress" data-course-id="${course.id}">
                  📈 Tiến độ
                </button>
              </div>
            </div>
          `).join('')}
        </div>
        
        ${myCourses.length === 0 ? `
          <div class="empty-state">
            <div class="empty-animation">
              <div class="empty-icon">📚</div>
              <div class="empty-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
            <h3>Bạn chưa đăng ký khóa học nào</h3>
            <p>Khám phá thế giới kiến thức với các khóa học chất lượng cao từ đội ngũ giảng viên giàu kinh nghiệm!</p>
            
            <div class="empty-suggestions">
              <div class="suggestion-item">
                <span class="suggestion-icon">🎯</span>
                <span>Chọn khóa học phù hợp với mục tiêu của bạn</span>
              </div>
              <div class="suggestion-item">
                <span class="suggestion-icon">⏰</span>
                <span>Học theo tiến độ linh hoạt, phù hợp lịch trình</span>
              </div>
              <div class="suggestion-item">
                <span class="suggestion-icon">🏆</span>
                <span>Nhận chứng chỉ sau khi hoàn thành khóa học</span>
              </div>
            </div>
            
            <button class="btn btn-primary switch-to-browse-tab" style="margin-top: 25px;">
              🔍 Khám phá khóa học ngay
            </button>
          </div>
        ` : ''}
      </div>

      <!-- Tab: Duyệt khóa học -->
      <div id="browse-courses-tab" class="tab-content">
        <!-- Nội dung sẽ được render bởi renderBrowseCourses() -->
      </div>
  
      <div id="course-detail-modal" class="modal" style="display: none;">
        <div class="modal-content large-modal">
          <div class="modal-header">
            <h3 id="course-detail-title">Chi tiết khóa học</h3>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div id="course-lessons"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="course-detail-close">Đóng</button>
          </div>
        </div>
      </div>
    `;
  
    setupStudentCoursesEventListeners(container);
    
    // Render browse courses tab content
    const browseTab = container.querySelector('#browse-courses-tab');
    const browseContent = renderBrowseCourses();
    browseTab.appendChild(browseContent);
    
    return container;
  }
  
  function setupStudentCoursesEventListeners(container) {
    // Tab switching
    const tabButtons = container.querySelectorAll('.tab-btn');
    const tabContents = container.querySelectorAll('.tab-content');
    
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        
        // Update active tab button
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active tab content
        tabContents.forEach(content => content.classList.remove('active'));
        if (targetTab === 'my-courses') {
          container.querySelector('#my-courses-tab').classList.add('active');
        } else if (targetTab === 'browse-courses') {
          container.querySelector('#browse-courses-tab').classList.add('active');
        }
      });
    });
    
    // Switch to browse tab button (trong empty state)
    const switchToBrowseBtn = container.querySelector('.switch-to-browse-tab');
    if (switchToBrowseBtn) {
      switchToBrowseBtn.addEventListener('click', () => {
        const browseTabBtn = container.querySelector('[data-tab="browse-courses"]');
        if (browseTabBtn) {
          browseTabBtn.click();
        }
      });
    }
    
    // Search and filter functionality for my courses
    const mySearchInput = container.querySelector('#my-course-search');
    const mySortSelect = container.querySelector('#my-course-sort');
    const myCoursesGrid = container.querySelector('#my-courses-grid');
    const viewButtons = container.querySelectorAll('.view-btn');
    
    if (mySearchInput && mySortSelect && myCoursesGrid) {
      function filterAndSortMyCourses() {
        const searchTerm = mySearchInput.value.toLowerCase();
        const sortBy = mySortSelect.value;
        const courseCards = Array.from(myCoursesGrid.querySelectorAll('.course-card'));
        
        // Filter courses
        courseCards.forEach(card => {
          const title = card.querySelector('h3').textContent.toLowerCase();
          const teacher = card.querySelector('.meta-value').textContent.toLowerCase();
          const description = card.querySelector('.course-description p').textContent.toLowerCase();
          
          const matchesSearch = title.includes(searchTerm) || 
                               teacher.includes(searchTerm) || 
                               description.includes(searchTerm);
          
          card.style.display = matchesSearch ? 'block' : 'none';
        });
        
        // Sort visible courses
        const visibleCards = courseCards.filter(card => card.style.display !== 'none');
        visibleCards.sort((a, b) => {
          const titleA = a.querySelector('h3').textContent;
          const titleB = b.querySelector('h3').textContent;
          
          switch (sortBy) {
            case 'name-asc':
              return titleA.localeCompare(titleB);
            case 'name-desc':
              return titleB.localeCompare(titleA);
            case 'oldest':
              const dateA = new Date(a.querySelector('.meta-value:last-child').textContent);
              const dateB = new Date(b.querySelector('.meta-value:last-child').textContent);
              return dateA - dateB;
            case 'newest':
            default:
              const dateA2 = new Date(a.querySelector('.meta-value:last-child').textContent);
              const dateB2 = new Date(b.querySelector('.meta-value:last-child').textContent);
              return dateB2 - dateA2;
          }
        });
        
        // Reorder DOM elements
        visibleCards.forEach(card => myCoursesGrid.appendChild(card));
      }
      
      mySearchInput.addEventListener('input', filterAndSortMyCourses);
      mySortSelect.addEventListener('change', filterAndSortMyCourses);
    }
    
    // View toggle functionality
    viewButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        
        // Update active button
        viewButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update grid view
        if (myCoursesGrid) {
          if (view === 'list') {
            myCoursesGrid.classList.add('list-view');
          } else {
            myCoursesGrid.classList.remove('list-view');
          }
        }
      });
    });

    // Action buttons
    container.addEventListener('click', (e) => {
      const target = e.target;
      const courseId = target.dataset.courseId;

      if (target.classList.contains('btn-view-lessons')) {
        navigateTo(`/student/course/${courseId}`);
      } else if (target.classList.contains('btn-view-progress')) {
        navigateTo('/student/progress');
      }
    });
  
    // Video thumbnail clicks
    container.addEventListener('click', (e) => {
      const videoThumbnail = e.target.closest('.video-thumbnail');
      if (videoThumbnail) {
        const videoUrl = videoThumbnail.dataset.videoUrl;
        const courseId = videoThumbnail.dataset.courseId;
        playVideoInModal(videoUrl, courseId);
      }
    });
    
    // Listen for course deletion events to refresh the page
    const courseDeletedListener = (event) => {
      const { courseId, courseTitle } = event.detail;
      
      // Show notification to student
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(255, 107, 107, 0.3);
        z-index: 10000;
        max-width: 350px;
        font-size: 14px;
        font-weight: 500;
      `;
      
      notification.innerHTML = `
        ⚠️ Khóa học "${courseTitle}" đã bị xóa.
        <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; color: white; font-size: 18px; cursor: pointer;">×</button>
      `;
      
      document.body.appendChild(notification);
      
      // Auto remove after 4 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 4000);
      
      // Refresh the student courses page
      setTimeout(() => {
        const currentRoute = stateManager.getState().currentRoute;
        if (currentRoute === '/student/courses') {
          navigateTo('/student/courses');
        }
      }, 1000);
    };
    
    // Add event listener
    window.addEventListener('courseDeleted', courseDeletedListener);
    
    // Listen for general course updates (create, update, delete)
    const coursesUpdatedListener = (event) => {
      const { action, courseId, courseTitle } = event.detail;
      console.log(`Courses updated: ${action} - ${courseTitle}`);
      
      // Refresh student courses page after a short delay
      setTimeout(() => {
        const currentRoute = stateManager.getState().currentRoute;
        if (currentRoute === '/student/courses') {
          // Force refresh by re-rendering
          const mainContent = document.querySelector('.content');
          if (mainContent) {
            const newContent = renderStudentCourses();
            mainContent.innerHTML = '';
            mainContent.appendChild(newContent);
          }
        }
      }, 500);
    };
    
    window.addEventListener('coursesUpdated', coursesUpdatedListener);
    
    // Store listeners for cleanup
    container._eventListeners = {
      courseDeleted: courseDeletedListener,
      coursesUpdated: coursesUpdatedListener
    };
  }
  
  // Browse all available courses for students
  function renderBrowseCourses(includeHeader = false) {
    const currentUser = stateManager.getState().user;
    const courses = getFromStorage(STORAGE_KEYS.COURSES) || [];
    const allCourses = courses.filter(course => course.isActive);
    const myCourses = courses.filter(course => course.students?.includes(currentUser.id));
    const myCoursesIds = myCourses.map(c => c.id);
    
    const container = document.createElement('div');
    container.className = 'browse-courses';
    
    container.innerHTML = `
      ${includeHeader ? `
      <div class="page-header">
        <h1>🔍 Duyệt khóa học</h1>
        <div class="search-filters">
          <input type="text" id="course-search" placeholder="Tìm kiếm khóa học..." class="search-input">
          <select id="teacher-filter" class="filter-select">
            <option value="">Tất cả giảng viên</option>
            ${[...new Set(allCourses.map(c => c.teacherName))].map(teacher => 
              `<option value="${teacher}">${teacher}</option>`
            ).join('')}
          </select>
        </div>
      </div>
      ` : `
      <div class="search-filters" style="margin-bottom: 20px;">
        <input type="text" id="course-search" placeholder="Tìm kiếm khóa học..." class="search-input">
        <select id="teacher-filter" class="filter-select">
          <option value="">Tất cả giảng viên</option>
          ${[...new Set(allCourses.map(c => c.teacherName))].map(teacher => 
            `<option value="${teacher}">${teacher}</option>`
          ).join('')}
        </select>
      </div>
      `}
      
      <div class="courses-stats">
        <div class="stat-item">
          <span class="stat-number">${allCourses.length}</span>
          <span class="stat-label">Tổng khóa học</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">${myCourses.length}</span>
          <span class="stat-label">Đã đăng ký</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">${allCourses.length - myCourses.length}</span>
          <span class="stat-label">Có thể đăng ký</span>
        </div>
      </div>
      
      <div class="courses-grid" id="courses-grid">
        ${allCourses.map(course => {
          const isEnrolled = myCoursesIds.includes(course.id);
          return `
            <div class="course-card ${isEnrolled ? 'enrolled' : ''}" data-course-id="${course.id}" data-teacher="${course.teacherName}">
              <div class="course-header">
                <h3>${course.title}</h3>
                <div class="course-badges">
                  ${isEnrolled ? '<span class="badge enrolled-badge">✓ Đã đăng ký</span>' : '<span class="badge available-badge">Có thể đăng ký</span>'}
                </div>
              </div>
              
              <div class="course-info">
                <p class="course-teacher">👨‍🏫 <strong>Giảng viên:</strong> ${course.teacherName}</p>
                <p class="course-description">${course.description.substring(0, 120)}${course.description?.length > 120 ? '...' : ''}</p>
                
                ${course.videoUrl ? `
                  <div class="course-video-preview">
                    <div class="video-thumbnail" data-video-url="${course.videoUrl}" data-course-id="${course.id}">
                      <img src="https://img.youtube.com/vi/${extractYouTubeId(course.videoUrl)}/mqdefault.jpg" 
                           alt="Video giới thiệu khóa học" 
                           onerror="this.src='https://via.placeholder.com/320x180?text=Video+Không+Tồn+Tại'">
                      <div class="play-overlay">
                        <div class="play-button">▶️</div>
                      </div>
                      <div class="video-duration">Video giới thiệu</div>
                    </div>
                  </div>
                ` : ''}
                
                <div class="course-meta">
                  <span class="meta-item">👥 ${course.students?.length || 0} học sinh</span>
                  <span class="meta-item">📚 ${course.lessons?.length || 0} bài học</span>
                  <span class="meta-item">📅 ${new Date(course.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
              
              <div class="course-actions">
                ${isEnrolled ? `
                  <button class="btn btn-primary btn-view-course" data-course-id="${course.id}">
                    📚 Xem khóa học
                  </button>
                  <button class="btn btn-secondary btn-unenroll" data-course-id="${course.id}">
                    🚫 Hủy đăng ký
                  </button>
                ` : `
                  <button class="btn btn-primary btn-enroll" data-course-id="${course.id}">
                    ➕ Đăng ký ngay
                  </button>
                  <button class="btn btn-outline btn-preview" data-course-id="${course.id}">
                    👁️ Xem trước
                  </button>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
      
      ${allCourses.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">📚</div>
          <h3>Chưa có khóa học nào</h3>
          <p>Hiện tại chưa có khóa học nào được tạo. Hãy quay lại sau!</p>
        </div>
      ` : ''}
    `;
    
    setupBrowseCoursesEventListeners(container);
    return container;
  }
  
  // Setup event listeners for browse courses
  function setupBrowseCoursesEventListeners(container) {
    // Search functionality
    const searchInput = container.querySelector('#course-search');
    const teacherFilter = container.querySelector('#teacher-filter');
    const coursesGrid = container.querySelector('#courses-grid');
    
    function filterCourses() {
      const searchTerm = searchInput.value.toLowerCase();
      const selectedTeacher = teacherFilter.value;
      const courseCards = coursesGrid.querySelectorAll('.course-card');
      
      courseCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('.course-description').textContent.toLowerCase();
        const teacher = card.dataset.teacher;
        
        const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
        const matchesTeacher = !selectedTeacher || teacher === selectedTeacher;
        
        if (matchesSearch && matchesTeacher) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    }
    
    searchInput.addEventListener('input', filterCourses);
    teacherFilter.addEventListener('change', filterCourses);
    
    // Course action buttons
    container.addEventListener('click', (e) => {
      const target = e.target;
      const courseId = target.dataset.courseId;
      
      if (target.classList.contains('btn-enroll')) {
        enrollInCourse(courseId, container);
      } else if (target.classList.contains('btn-unenroll')) {
        unenrollFromCourse(courseId, container);
      } else if (target.classList.contains('btn-view-course')) {
        navigateTo(`/student/course/${courseId}`);
      } else if (target.classList.contains('btn-preview')) {
        previewCourse(courseId);
      }
    });
    
    // Video thumbnail clicks
    container.addEventListener('click', (e) => {
      const videoThumbnail = e.target.closest('.video-thumbnail');
      if (videoThumbnail) {
        const videoUrl = videoThumbnail.dataset.videoUrl;
        const courseId = videoThumbnail.dataset.courseId;
        playVideoInModal(videoUrl, courseId);
      }
    });
  }
  
  // Enroll in course
  function enrollInCourse(courseId, container) {
    const currentUser = stateManager.getState().user;
    const courses = getFromStorage(STORAGE_KEYS.COURSES) || [];
    const course = courses.find(c => c.id === courseId);
    
    if (!course) {
      alert('Không tìm thấy khóa học!');
      return;
    }
    
    if (course.students?.includes(currentUser.id)) {
      alert('Bạn đã đăng ký khóa học này rồi!');
      return;
    }
    
    const confirmMessage = `Bạn có chắc chắn muốn đăng ký khóa học "${course.title}"?\n\nGiảng viên: ${course.teacherName}\nSố bài học: ${course.lessons?.length || 0}`;
    
    if (confirm(confirmMessage)) {
      // Add student to course
      const updatedStudents = [...(course.students || []), currentUser.id];
      updateInStorage(STORAGE_KEYS.COURSES, courseId, { students: updatedStudents });
      
      alert(`✅ Đăng ký thành công!\n\nBạn đã đăng ký khóa học "${course.title}".`);
      
      // Refresh the page and switch to "My Courses" tab
      const currentRoute = stateManager.getState().currentRoute;
      navigateTo(currentRoute);
      
      // After navigation, switch to my-courses tab
      setTimeout(() => {
        const studentCoursesContainer = document.querySelector('.student-courses');
        if (studentCoursesContainer) {
          const myCoursesTabBtn = studentCoursesContainer.querySelector('[data-tab="my-courses"]');
          if (myCoursesTabBtn) {
            myCoursesTabBtn.click();
          }
        }
      }, 100);
    }
  }
  
  // Unenroll from course
  function unenrollFromCourse(courseId, container) {
    const currentUser = stateManager.getState().user;
    const courses = getFromStorage(STORAGE_KEYS.COURSES);
    const course = courses.find(c => c.id === courseId);
    
    if (!course) {
      alert('Không tìm thấy khóa học!');
      return;
    }
    
    const confirmMessage = `Bạn có chắc chắn muốn hủy đăng ký khóa học "${course.title}"?\n\n⚠️ Lưu ý: Bạn sẽ mất quyền truy cập vào tất cả nội dung của khóa học này!`;
    
    if (confirm(confirmMessage)) {
      // Remove student from course
      const updatedStudents = (course.students || []).filter(id => id !== currentUser.id);
      updateInStorage(STORAGE_KEYS.COURSES, courseId, { students: updatedStudents });
      
      alert(`✅ Hủy đăng ký thành công!\n\nBạn đã hủy đăng ký khóa học "${course.title}".`);
      
      // Refresh the page
      const currentRoute = stateManager.getState().currentRoute;
      navigateTo(currentRoute);
    }
  }
  
  // Preview course
  function previewCourse(courseId) {
    const courses = getFromStorage(STORAGE_KEYS.COURSES);
    const course = courses.find(c => c.id === courseId);
    
    if (!course) {
      alert('Không tìm thấy khóa học!');
      return;
    }
    
    // Create preview modal
    const modal = document.createElement('div');
    modal.className = 'modal course-preview-modal';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
      <div class="modal-content course-preview-content">
        <div class="modal-header">
          <h3>👁️ Xem trước khóa học</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="course-preview-info">
            <h2>${course.title}</h2>
            <p class="course-teacher">👨‍🏫 <strong>Giảng viên:</strong> ${course.teacherName}</p>
            <p class="course-description">${course.description}</p>
            
            <div class="course-stats">
              <div class="stat">
                <span class="stat-icon">👥</span>
                <span class="stat-text">${course.students?.length || 0} học sinh đã đăng ký</span>
              </div>
              <div class="stat">
                <span class="stat-icon">📚</span>
                <span class="stat-text">${course.lessons?.length || 0} bài học</span>
              </div>
              <div class="stat">
                <span class="stat-icon">📅</span>
                <span class="stat-text">Tạo ngày ${new Date(course.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
            
            ${course.lessons && course.lessons.length > 0 ? `
              <div class="lessons-preview">
                <h4>📚 Danh sách bài học</h4>
                <ul class="lessons-list">
                  ${course.lessons.slice(0, 5).map(lesson => `
                    <li class="lesson-item">
                      <span class="lesson-title">${lesson.title}</span>
                      <span class="lesson-duration">${lesson.duration} phút</span>
                    </li>
                  `).join('')}
                  ${course.lessons.length > 5 ? `<li class="more-lessons">... và ${course.lessons.length - 5} bài học khác</li>` : ''}
                </ul>
              </div>
            ` : ''}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary btn-enroll-now" data-course-id="${course.id}">
            ➕ Đăng ký ngay
          </button>
          <button class="btn btn-secondary modal-close-btn">Đóng</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    document.body.classList.add('modal-open');
    
    // Close modal events
    const closeButtons = modal.querySelectorAll('.modal-close, .modal-close-btn');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        document.body.removeChild(modal);
      });
    });
    
    // Enroll button in modal
    const enrollBtn = modal.querySelector('.btn-enroll-now');
    enrollBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
      document.body.removeChild(modal);
      enrollInCourse(courseId);
    });
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        document.body.removeChild(modal);
      }
    });
  }
  
  function viewCourseLessons(container, courseId) {
    const courses = getFromStorage(STORAGE_KEYS.COURSES);
    const course = courses.find(c => c.id === courseId);
  
    if (course && course.lessons) {
      const modal = container.querySelector('#course-detail-modal');
      const title = container.querySelector('#course-detail-title');
      const lessonsDiv = container.querySelector('#course-lessons');
  
      title.textContent = course.title;
      lessonsDiv.innerHTML = `
        <div class="lessons-list">
          ${course.lessons.map(lesson => `
            <div class="lesson-item" data-lesson-id="${lesson.id}">
              <div class="lesson-info">
                <h4>${lesson.title}</h4>
                <p>${lesson.description}</p>
                <p><strong>Thời lượng:</strong> ${lesson.duration} phút</p>
              </div>
              <div class="lesson-actions">
                <button class="btn btn-sm btn-watch" data-lesson-id="${lesson.id}">Xem bài học</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
  
      showModal(modal);
  
      // Modal event listeners
      const closeBtn = modal.querySelector('.modal-close');
      const closeButton = modal.querySelector('#course-detail-close');
  
      const closeModal = () => {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
      };
  
      closeBtn.addEventListener('click', closeModal);
      closeButton.addEventListener('click', closeModal);
  
      // Lesson watch buttons
      lessonsDiv.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-watch')) {
          const lessonId = e.target.dataset.lessonId;
          watchLesson(lessonId);
        }
      });
    }
  }
  
  function watchLesson(lessonId) {
    const courses = getFromStorage(STORAGE_KEYS.COURSES);
    let lesson = null;
  
    for (const course of courses) {
      if (course.lessons) {
        lesson = course.lessons.find(l => l.id === lessonId);
        if (lesson) break;
      }
    }
  
    if (lesson) {
      // Mark lesson as completed
      const currentUser = stateManager.getState().user;
      const progressKey = `${currentUser.id}_${lessonId}`;
  
      // For demo purposes, just show an alert
      alert(`Đang xem bài học: ${lesson.title}\n\nNội dung: ${lesson.description}\n\nVideo: ${lesson.videoUrl || 'Không có video'}`);
  
      // In a real app, you'd update progress here
    }
  }