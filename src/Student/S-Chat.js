import { stateManager } from '../state.js';
import { navigateTo } from '../routing.js';
import {
  getFromStorage,
  addToStorage,
  saveToStorage,
  generateId,
  STORAGE_KEYS
} from '../utils.js';

// Danh sách từ không chuẩn mực
const BAD_WORDS = [
  'địt', 'đụ', 'đéo', 'đm', 'đmm', 'đcm', 'clgt', 'clmm', 'cl', 'vl', 'vcl',
  'fuck', 'shit', 'damn', 'bitch', 'asshole', 'cunt', 'dick', 'piss', 'bastard',
  'đồ ngu', 'ngu si', 'đần', 'ngu dốt', 'đồ khùng', 'điên', 'thần kinh',
  'chết tiệt', 'đồ chó', 'đồ súc vật', 'đồ thú vật'
];

// Hàm kiểm tra từ không chuẩn mực
function containsBadWords(text) {
  const lowerText = text.toLowerCase();
  return BAD_WORDS.some(word => lowerText.includes(word.toLowerCase()));
}

// Hàm che từ không chuẩn mực bằng dấu *
function censorBadWords(text) {
  let censoredText = text;
  const lowerText = text.toLowerCase();
  
  BAD_WORDS.forEach(word => {
    const regex = new RegExp(word, 'gi');
    censoredText = censoredText.replace(regex, (match) => {
      return '*'.repeat(match.length);
    });
  });
  
  return censoredText;
}

// These functions are also defined in T-Chat.js - using shared implementation
function loadCourseMessages(container, courseId) {
  const courses = getFromStorage(STORAGE_KEYS.COURSES);
  const messages = getFromStorage(STORAGE_KEYS.CHAT_MESSAGES);
  const users = getFromStorage(STORAGE_KEYS.USERS);
  const currentUser = stateManager.getState().user;

  const course = courses.find(c => c.id === courseId);
  const courseMessages = messages.filter(msg => msg.courseId === courseId);

  markCourseChatAsViewed(courseId);

  const messagesContainer = container.querySelector('#chat-messages');

  if (courseMessages?.length === 0) {
    messagesContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">💬</div>
        <h3>Chưa có tin nhắn</h3>
        <p>Hãy bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn đầu tiên!</p>
      </div>
    `;
  } else {
    const sortedMessages = courseMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const messagesByDate = {};
    sortedMessages.forEach(msg => {
      const date = new Date(msg.timestamp).toDateString();
      if (!messagesByDate[date]) {
        messagesByDate[date] = [];
      }
      messagesByDate[date].push(msg);
    });

    let messagesHTML = '';
    Object.entries(messagesByDate).forEach(([date, dayMessages]) => {
      messagesHTML += `
        <div class="date-separator">
          <div class="date-label">${new Date(date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
      `;

      dayMessages.forEach(msg => {
        const sender = users.find(u => u.id === msg.senderId);
        const isOwnMessage = msg.senderId === currentUser.id;
        const messageClass = isOwnMessage ? 'my-message' : 'other-message';
        
        // Xác định nội dung tin nhắn để hiển thị
        let displayContent = msg.content;
        let showRedDot = false;
        
        // Nếu là sinh viên
        if (currentUser.role === 'student') {
          const isInappropriate = msg.isInappropriate || containsBadWords(msg.content);
          
          if (isOwnMessage) {
            // Tin nhắn của chính mình: che từ không chuẩn mực bằng dấu * và thêm chấm đỏ
            if (isInappropriate) {
              showRedDot = true;
              displayContent = censorBadWords(msg.content);
            } else {
              displayContent = msg.content;
            }
          } else {
            // Tin nhắn của người khác
            if (sender && sender.role === 'student' && isInappropriate) {
              // Nếu là sinh viên khác và tin nhắn không chuẩn mực: che bằng dấu *
              displayContent = censorBadWords(msg.content);
            } else {
              // Nếu là giáo viên/admin hoặc tin nhắn chuẩn mực: hiển thị nguyên bản
              displayContent = msg.content;
            }
          }
        } else {
          // Nếu là giáo viên hoặc admin: luôn hiển thị nguyên bản
          displayContent = msg.content;
        }

        messagesHTML += `
          <div class="message ${messageClass}">
            <div class="message-content">
              ${!isOwnMessage ? `
                <div class="message-sender">
                  <div class="sender-avatar">${sender ? sender.fullName.charAt(0).toUpperCase() : '?'}</div>
                  <span class="sender-name">${sender ? sender.fullName : 'Unknown'}</span>
                </div>
              ` : ''}
              <div class="message-bubble" style="position: relative;">
                <p style="margin: 0 0 4px 0; word-wrap: break-word; display: flex; align-items: center; gap: 8px;">
                  ${showRedDot ? '<span style="display: inline-block; width: 10px; height: 10px; background-color: #f44336; border-radius: 50%; flex-shrink: 0; box-shadow: 0 0 4px rgba(244, 67, 54, 0.5);" title="Tin nhắn chứa từ ngữ không chuẩn mực"></span>' : ''}
                  <span style="flex: 1;">${displayContent}</span>
                </p>
                <div class="message-time">${new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          </div>
        `;
      });
    });

    messagesContainer.innerHTML = messagesHTML;
  }

  setTimeout(() => {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, 100);
}

function setupChatRealTimeSync(container, courseId) {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEYS.CHAT_MESSAGES) {
      loadCourseMessages(container, courseId);
    }
  });

  window.addEventListener('chatMessageAdded', (e) => {
    if (e.detail && e.detail.courseId === courseId) {
      loadCourseMessages(container, courseId);
    }
  });
}

function markCourseChatAsViewed(courseId) {
  const currentUser = stateManager.getState().user;
  const lastViewed = getFromStorage(STORAGE_KEYS.CHAT_LAST_VIEWED) || {};
  lastViewed[`${currentUser.id}_${courseId}`] = new Date().toISOString();
  saveToStorage(STORAGE_KEYS.CHAT_LAST_VIEWED, lastViewed);
}

// Hàm load và hiển thị cảnh báo cho học sinh
function loadStudentWarnings(container) {
  const currentUser = stateManager.getState().user;
  const violations = getFromStorage(STORAGE_KEYS.STUDENT_VIOLATIONS) || [];
  const courses = getFromStorage(STORAGE_KEYS.COURSES);
  const users = getFromStorage(STORAGE_KEYS.USERS);
  
  // Lọc các cảnh báo (warnings) của học sinh hiện tại
  const myWarnings = violations.filter(v => 
    v.studentId === currentUser.id && 
    v.penaltyType === 'warning' &&
    v.status === 'active'
  );
  
  const warningsSection = container.querySelector('#warnings-section');
  
  if (myWarnings.length === 0) {
    warningsSection.style.display = 'none';
    return;
  }
  
  // Sắp xếp theo thời gian mới nhất
  myWarnings.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
  
  let warningsHTML = `
    <div style="background: #fff; border: 2px solid #ffc107; border-radius: 8px; padding: 16px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h3 style="margin: 0 0 16px 0; color: #856404; display: flex; align-items: center; gap: 8px; font-size: 18px;">
        <span>⚠️</span>
        <span>Cảnh báo của tôi</span>
      </h3>
  `;
  
  myWarnings.forEach(warning => {
    const course = courses.find(c => c.id === warning.courseId);
    const appliedBy = users.find(u => u.id === warning.appliedBy);
    const warningDate = new Date(warning.appliedAt);
    
    warningsHTML += `
      <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 12px; margin-bottom: 12px;">
        <div style="display: flex; align-items: flex-start; gap: 10px;">
          <div style="font-size: 20px; flex-shrink: 0;">⚠️</div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: bold; color: #856404; margin-bottom: 6px; font-size: 14px;">
              Cảnh báo về hành vi không phù hợp
            </div>
            <div style="color: #856404; font-size: 12px; line-height: 1.5;">
              <div style="margin-bottom: 4px; word-wrap: break-word;">
                <strong>📚 Khóa học:</strong> ${course ? course.title : 'N/A'}
              </div>
              <div style="margin-bottom: 4px;">
                <strong>👤 Cảnh báo bởi:</strong> ${appliedBy ? appliedBy.fullName : 'Giảng viên'}
              </div>
              <div style="margin-bottom: 6px;">
                <strong>📅 Thời gian:</strong> ${warningDate.toLocaleString('vi-VN', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              <div style="margin-top: 8px; padding: 8px; background: rgba(255,255,255,0.7); border-radius: 4px; font-style: italic; font-size: 11px;">
                Bạn đã nhận được cảnh báo về việc sử dụng ngôn ngữ không phù hợp trong chat. Vui lòng tuân thủ quy tắc ứng xử của lớp học.
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  warningsHTML += `</div>`;
  warningsSection.innerHTML = warningsHTML;
  warningsSection.style.display = 'block';
}

function sendMessage(courseId, content) {
  const currentUser = stateManager.getState().user;
  const courses = getFromStorage(STORAGE_KEYS.COURSES);
  const course = courses.find(c => c.id === courseId);
  
  // Kiểm tra xem học sinh có bị cấm chat không
  if (currentUser.role === 'student') {
    const chatBans = getFromStorage(STORAGE_KEYS.CHAT_BANS) || [];
    const activeBan = chatBans.find(ban => 
      ban.studentId === currentUser.id && 
      ban.courseId === courseId &&
      (ban.banUntil === null || new Date(ban.banUntil) > new Date())
    );
    
    if (activeBan) {
      let banMessage = '🚫 Bạn đã bị cấm chat trong khóa học này';
      if (activeBan.banUntil) {
        const banUntilDate = new Date(activeBan.banUntil);
        banMessage += ` đến ${banUntilDate.toLocaleString('vi-VN')}`;
      } else {
        banMessage += ' vĩnh viễn';
      }
      alert(banMessage);
      return;
    }
  }
  
  // Kiểm tra từ không chuẩn mực (chỉ cho học sinh)
  const isInappropriate = currentUser.role === 'student' && containsBadWords(content);

  const newMessage = {
    id: generateId(),
    content: content,
    senderId: currentUser.id,
    senderName: currentUser.fullName,
    courseId: courseId,
    courseName: course ? course.title : '',
    timestamp: new Date().toISOString(),
    type: 'text',
    isInappropriate: isInappropriate || false
  };

  addToStorage(STORAGE_KEYS.CHAT_MESSAGES, newMessage);

  // Dispatch event với thông tin đầy đủ, bao gồm isInappropriate để giáo viên/admin nhận biết
  window.dispatchEvent(new CustomEvent('chatMessageAdded', {
    detail: { 
      courseId, 
      message: newMessage,
      isInappropriate: isInappropriate
    }
  }));

  // Nếu là tin nhắn không chuẩn mực, dispatch event riêng để giáo viên/admin nhận thông báo ngay
  if (isInappropriate) {
    window.dispatchEvent(new CustomEvent('inappropriateMessageDetected', {
      detail: {
        message: newMessage,
        courseId: courseId,
        studentId: currentUser.id,
        studentName: currentUser.fullName
      }
    }));
  }
}

export function renderStudentChat() {
    const currentUser = stateManager.getState().user;
    const courses = getFromStorage(STORAGE_KEYS.COURSES);
    const messages = getFromStorage(STORAGE_KEYS.CHAT_MESSAGES);
    const users = getFromStorage(STORAGE_KEYS.USERS);
  
    // Get courses the student is enrolled in
    const myCourses = courses.filter(course => course.students?.includes(currentUser.id));
  
    const container = document.createElement('div');
    container.className = 'student-chat';
  
    container.innerHTML = `
      <div class="chat-header">
        <div class="chat-title">
          <h1>💬 Chat nhóm lớp</h1>
          <p>Tham gia thảo luận với giảng viên và bạn học</p>
        </div>
        <div class="course-selector">
          <select id="course-select" class="course-select">
            <option value="">Chọn lớp học...</option>
            ${myCourses.map(course => `<option value="${course.id}">${course.title}</option>`).join('')}
          </select>
        </div>
      </div>
  
      <div style="display: flex; gap: 20px; margin-top: 20px; height: calc(100vh - 250px); min-height: 500px;">
        <!-- Cột trái: Cảnh báo -->
        <div id="warnings-section" style="flex: 0 0 350px; display: none; overflow-y: auto; padding-right: 10px;">
          <!-- Cảnh báo sẽ được hiển thị ở đây -->
        </div>
        
        <!-- Cột phải: Chat nhóm -->
        <div class="chat-container" id="chat-container" style="flex: 1; display: flex; flex-direction: column; min-width: 0;">
          <div class="no-course-selected" id="no-course-selected" style="flex: 1; display: flex; align-items: center; justify-content: center;">
            <div class="empty-state">
              <div class="empty-icon">📚</div>
              <h3>Chọn lớp học để tham gia</h3>
              <p>Hãy chọn một lớp học từ danh sách trên để tham gia thảo luận với giảng viên và các bạn cùng lớp.</p>
            </div>
          </div>
          
          <div class="chat-messages" id="chat-messages" style="display: none; flex: 1; overflow-y: auto; padding: 15px;">
            <!-- Messages will be loaded here -->
          </div>
          
          <div class="chat-input-form" id="chat-input-form" style="display: none; padding: 15px; border-top: 1px solid #e0e0e0; background: #fff;">
            <div id="bad-word-warning" style="display: none; background: #ffebee; border: 2px solid #f44336; border-radius: 4px; padding: 10px; margin-bottom: 10px; color: #c62828; font-weight: bold;">
              ⚠️ Cảnh báo: Tin nhắn của bạn chứa từ ngữ không chuẩn mực. Vui lòng sửa lại!
            </div>
            <form id="message-form">
              <div class="chat-input-container">
                <input type="text" id="message-input" class="chat-input" placeholder="Nhập tin nhắn..." required>
                <button type="submit" class="send-button">
                  <span>📤</span>
                  Gửi
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  
    setupStudentChatEventListeners(container);
    
    // Load và hiển thị cảnh báo
    loadStudentWarnings(container);
    
    // Lắng nghe sự kiện khi có cảnh báo mới
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEYS.STUDENT_VIOLATIONS) {
        loadStudentWarnings(container);
      }
    });
    
    // Lắng nghe custom event khi giảng viên gửi cảnh báo
    window.addEventListener('studentWarningAdded', (e) => {
      const currentUser = stateManager.getState().user;
      if (e.detail && e.detail.studentId === currentUser.id) {
        loadStudentWarnings(container);
      }
    });
    
    return container;
  }
  
  function setupStudentChatEventListeners(container) {
    const courseSelect = container.querySelector('#course-select');
    const chatContainer = container.querySelector('#chat-container');
    const noCourseSelected = container.querySelector('#no-course-selected');
    const chatMessages = container.querySelector('#chat-messages');
    const chatInputForm = container.querySelector('#chat-input-form');
    let selectedCourseId = courseSelect.value;
  
    // Course selection
    courseSelect.addEventListener('change', (e) => {
      selectedCourseId = e.target.value;
  
      if (selectedCourseId) {
        // Show chat interface
        noCourseSelected.style.display = 'none';
        chatMessages.style.display = 'flex';
        chatInputForm.style.display = 'block';
  
        // Load messages and setup sync
        loadCourseMessages(container, selectedCourseId);
        setupChatRealTimeSync(container, selectedCourseId);
      } else {
        // Show empty state
        noCourseSelected.style.display = 'flex';
        chatMessages.style.display = 'none';
        chatInputForm.style.display = 'none';
      }
    });
  
    // Message form
    const messageForm = container.querySelector('#message-form');
    const messageInput = container.querySelector('#message-input');
    const badWordWarning = container.querySelector('#bad-word-warning');
    
    // Kiểm tra từ không chuẩn mực khi gõ
    messageInput.addEventListener('input', (e) => {
      const message = e.target.value.trim();
      if (message && containsBadWords(message)) {
        badWordWarning.style.display = 'block';
        messageInput.style.border = '2px solid #f44336';
        messageInput.style.backgroundColor = '#ffebee';
      } else {
        badWordWarning.style.display = 'none';
        messageInput.style.border = '';
        messageInput.style.backgroundColor = '';
      }
    });
    
    messageForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const message = messageInput.value.trim();

      if (message && selectedCourseId) {
        // Vẫn cho phép gửi nhưng đánh dấu là không chuẩn mực
        sendMessage(selectedCourseId, message);
        messageInput.value = '';
        badWordWarning.style.display = 'none';
        messageInput.style.border = '';
        messageInput.style.backgroundColor = '';
        // Focus back to input
        messageInput.focus();
      }
    });
  }
  