import { stateManager } from './state.js';
import { navigateTo } from './routing.js';
import { getFromStorage, STORAGE_KEYS, extractYouTubeId } from './utils.js';

// Course Details Function
export function renderCourseDetails(courseId, userType) {
  const courses = getFromStorage(STORAGE_KEYS.COURSES);
  const course = courses.find(c => c.id === courseId);

  if (!course) {
    const container = document.createElement('div');
    container.className = 'page-content';
    container.innerHTML = `
      <div class="error-message">
        <h2>Không tìm thấy khóa học</h2>
        <p>Khóa học bạn đang tìm kiếm không tồn tại.</p>
        <button class="btn btn-primary back-btn">Quay lại</button>
      </div>
    `;
    
    container.querySelector('.back-btn').addEventListener('click', () => {
      navigateTo(userType === 'teacher' ? '/teacher/courses' : '/student/courses');
    });
    
    return container;
  }

  const container = document.createElement('div');
  container.className = 'course-details';

  container.innerHTML = `
    <div class="course-header">
      <button class="btn btn-secondary back-btn">
        <span>←</span> Quay lại
      </button>
      <div class="course-title-section">
        <h1 class="course-title">${course.title}</h1>
        <p class="course-description">${course.description}</p>
        <div class="course-meta">
          <span class="meta-item">👨‍🏫 Giảng viên: ${course.teacherName}</span>
          <span class="meta-item">📚 ${course.lessons?.length || 0} bài học</span>
          <span class="meta-item">👥 ${course.students?.length || 0} học sinh</span>
        </div>
      </div>
    </div>
    
    <div class="course-content">
      <div class="lessons-section">
        <h2>📚 Danh sách bài học</h2>
        <div class="lessons-grid" id="lessons-grid">
          ${course.lessons && course.lessons.length > 0 ? course.lessons.map((lesson, index) => `
            <div class="lesson-card" data-lesson-id="${lesson.id}">
              <div class="lesson-header">
                <div class="lesson-number">Bài ${index + 1}</div>
                <h3 class="lesson-title">${lesson.title}</h3>
                <span class="lesson-duration">⏱️ ${lesson.duration || 30} phút</span>
              </div>
              <div class="lesson-content">
                <p class="lesson-description">${lesson.description || 'Không có mô tả'}</p>
                ${lesson.videoUrl ? `
                  <div class="video-section">
                    <div class="video-container" id="video-${lesson.id}">
                      <div class="video-placeholder" data-lesson-id="${lesson.id}" data-video-id="${extractYouTubeId(lesson.videoUrl)}">
                        <div class="play-button">
                          <span>▶️</span>
                          <p>Nhấn để xem video</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ` : '<p class="no-video">📹 Chưa có video bài học</p>'}
              </div>
              <div class="lesson-actions">
                <button class="btn btn-sm btn-primary btn-watch" data-lesson-id="${lesson.id}">
                  👁️ Xem bài học
                </button>
              </div>
            </div>
          `).join('') : '<p class="no-lessons">Chưa có bài học nào trong khóa học này.</p>'}
        </div>
      </div>
    </div>
  `;

  // Setup event listeners
  setupCourseDetailsEventListeners(container, userType);
  
  return container;
}

// Setup event listeners for course details
function setupCourseDetailsEventListeners(container, userType) {
  // Back button
  const backBtn = container.querySelector('.back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      navigateTo(userType === 'teacher' ? '/teacher/courses' : '/student/courses');
    });
  }

  // Video play buttons
  container.addEventListener('click', (e) => {
    const videoPlaceholder = e.target.closest('.video-placeholder');
    if (videoPlaceholder) {
      const lessonId = videoPlaceholder.dataset.lessonId;
      const videoId = videoPlaceholder.dataset.videoId;
      loadVideo(lessonId, videoId);
    }
  });

  // Watch lesson buttons
  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-watch')) {
      const lessonId = e.target.dataset.lessonId;
      watchCourseLesson(lessonId);
    }
  });
}

// Function to load YouTube video
function loadVideo(lessonId, videoId) {
  if (!videoId) {
    alert('URL video không hợp lệ!');
    return;
  }

  const videoContainer = document.getElementById(`video-${lessonId}`);
  if (videoContainer) {
    videoContainer.innerHTML = `
      <iframe 
        width="100%" 
        height="400" 
        src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" 
        title="Video bài học" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        allowfullscreen>
      </iframe>
    `;
  }
}

// Function to handle lesson watching in course details
function watchCourseLesson(lessonId) {
  const currentUser = stateManager.getState().user;
  
  // Track progress (could be expanded later)
  console.log(`User ${currentUser.fullName} is watching lesson: ${lessonId}`);
  
  // Could save to localStorage for progress tracking
  const progress = getFromStorage(STORAGE_KEYS.LESSON_PROGRESS) || [];
  const existingProgress = progress.find(p => 
    p.userId === currentUser.id && p.lessonId === lessonId
  );
  
  if (!existingProgress) {
    progress.push({
      userId: currentUser.id,
      lessonId: lessonId,
      startedAt: new Date().toISOString(),
      completed: false
    });
    localStorage.setItem(STORAGE_KEYS.LESSON_PROGRESS, JSON.stringify(progress));
  }
  
  alert('Đã bắt đầu học bài này! Tiến độ của bạn đã được lưu lại.');
}

