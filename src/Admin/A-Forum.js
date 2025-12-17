import { stateManager } from '../state.js';
import { navigateTo } from '../routing.js';
import {
  getFromStorage,
  addToStorage,
  updateInStorage,
  saveToStorage,
  generateId,
  STORAGE_KEYS
} from '../utils.js';

// Danh sách từ không chuẩn mực
const BAD_WORDS = [
  'địt', 'đụ', 'đéo', 'dm', 'dmm', 'dcm', 'clgt', 'clmm', 'cl', 'vl', 'vcl',
  'fuck', 'shit', 'damn', 'bitch', 'asshole', 'cunt', 'dick', 'piss', 'bastard',
  'đồ ngu', 'ngu si', 'đần', 'ngu dốt', 'đồ khùng', 'điên', 'thần kinh',
  'chết tiệt', 'đồ chó', 'đồ súc vật', 'đồ thú vật'
];

// Hàm kiểm tra từ không chuẩn mực
function containsBadWords(text) {
  const lowerText = text.toLowerCase();
  return BAD_WORDS.some(word => lowerText.includes(word.toLowerCase()));
}

// Load tin nhắn của khóa học
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
        
        // Admin luôn thấy tin nhắn gốc
        const displayContent = msg.content;

        messagesHTML += `
          <div class="message ${messageClass}">
            <div class="message-content">
              ${!isOwnMessage ? `
                <div class="message-sender">
                  <div class="sender-avatar">${sender ? sender.fullName.charAt(0).toUpperCase() : '?'}</div>
                  <span class="sender-name">${sender ? sender.fullName : 'Unknown'}</span>
                  ${sender ? `<span class="sender-role">${sender.role === 'student' ? 'Học sinh' : sender.role === 'teacher' ? 'Giảng viên' : 'Admin'}</span>` : ''}
                </div>
              ` : ''}
              <div class="message-bubble">
                <p>${displayContent}</p>
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

function sendMessage(courseId, content) {
  const currentUser = stateManager.getState().user;
  const courses = getFromStorage(STORAGE_KEYS.COURSES);
  const course = courses.find(c => c.id === courseId);

  // Admin không bị kiểm tra từ không chuẩn mực
  const newMessage = {
    id: generateId(),
    content: content,
    senderId: currentUser.id,
    senderName: currentUser.fullName,
    courseId: courseId,
    courseName: course ? course.title : '',
    timestamp: new Date().toISOString(),
    type: 'text',
    isInappropriate: false
  };

  addToStorage(STORAGE_KEYS.CHAT_MESSAGES, newMessage);

  window.dispatchEvent(new CustomEvent('chatMessageAdded', {
    detail: { courseId, message: newMessage }
  }));
}

// Hàm hiển thị thông báo khi có tin nhắn không chuẩn mực mới (cho admin)
function showInappropriateMessageNotification(message) {
  // Tạo thông báo popup
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
    color: white;
    padding: 20px 25px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(255, 107, 107, 0.4);
    z-index: 10000;
    max-width: 400px;
    animation: slideInRight 0.3s ease-out;
    font-size: 14px;
    font-weight: 500;
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: flex-start; gap: 12px;">
      <div style="font-size: 24px; flex-shrink: 0;">⚠️</div>
      <div style="flex: 1;">
        <div style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">
          Tin nhắn không chuẩn mực mới!
        </div>
        <div style="opacity: 0.95; line-height: 1.5; margin-bottom: 10px;">
          Học sinh <strong>${message.senderName}</strong> đã gửi tin nhắn chứa từ ngữ không phù hợp trong khóa học <strong>${message.courseName}</strong>.
        </div>
        <div style="font-size: 12px; opacity: 0.9; margin-top: 8px;">
          Vui lòng kiểm tra phần "Tin nhắn không chuẩn mực" để xử lý.
        </div>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">×</button>
    </div>
  `;
  
  // Thêm animation CSS nếu chưa có
  if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(notification);
  
  // Tự động xóa sau 8 giây
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideInRight 0.3s ease-out reverse';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  }, 8000);
}

// Hàm load và hiển thị tin nhắn không chuẩn mực cho admin
function loadInappropriateMessages(container) {
  const messages = getFromStorage(STORAGE_KEYS.CHAT_MESSAGES) || [];
  const users = getFromStorage(STORAGE_KEYS.USERS) || [];
  const courses = getFromStorage(STORAGE_KEYS.COURSES) || [];
  const violations = getFromStorage(STORAGE_KEYS.STUDENT_VIOLATIONS) || [];
  
  // Lấy tất cả tin nhắn không chuẩn mực từ học sinh
  const inappropriateMessages = messages
    .filter(msg => msg.isInappropriate)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sắp xếp mới nhất trước
  
  // Chia thành 2 nhóm: đã xử lý và chưa xử lý
  const unprocessedMessages = [];
  const processedMessages = [];
  
  inappropriateMessages.forEach(msg => {
    const hasViolation = violations.some(v => v.messageId === msg.id);
    if (hasViolation) {
      processedMessages.push(msg);
    } else {
      unprocessedMessages.push(msg);
    }
  });
  
  // Render phần chưa xử lý
  renderUnprocessedMessages(container, unprocessedMessages, users, courses, violations);
  
  // Render phần đã xử lý
  renderProcessedMessages(container, processedMessages, users, courses, violations);
}

// Render tin nhắn chưa xử lý
function renderUnprocessedMessages(container, messages, users, courses, violations) {
  const unprocessedList = container.querySelector('#unprocessed-messages-list');
  if (!unprocessedList) return;
  
  if (messages.length === 0) {
    unprocessedList.innerHTML = '<p style="color: #856404; margin: 0; padding: 10px; background: white; border-radius: 4px;">✅ Không có tin nhắn chưa xử lý nào.</p>';
  } else {
    let html = '';
    messages.forEach(msg => {
      const sender = users.find(u => u.id === msg.senderId);
      const course = courses.find(c => c.id === msg.courseId);
      const isEnrolled = course && course.students && course.students.includes(msg.senderId);
      html += `
        <div class="inappropriate-message-card" style="background: white; border: 1px solid #ff9800; border-radius: 8px; padding: 15px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); cursor: pointer;" data-message-id="${msg.id}" data-student-id="${msg.senderId}" data-course-id="${msg.courseId}">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <strong style="color: #d32f2f; font-size: 16px;">👤 ${sender ? sender.fullName : 'Unknown'}</strong>
              <span style="background: #ffebee; color: #c62828; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">Học sinh</span>
            </div>
            <span style="color: #666; font-size: 0.9em;">${new Date(msg.timestamp).toLocaleString('vi-VN')}</span>
          </div>
          <div style="color: #333; margin-bottom: 10px; font-weight: 500;">📚 Khóa học: ${course ? course.title : 'N/A'}</div>
          <div style="background: #ffebee; padding: 12px; border-radius: 6px; color: #c62828; font-weight: bold; border-left: 4px solid #f44336; margin-bottom: 10px;">
            "${msg.content}"
          </div>
          ${isEnrolled ? `
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px;">
              <select class="penalty-select-admin" data-student-id="${msg.senderId}" data-course-id="${msg.courseId}" data-message-id="${msg.id}" style="padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; flex: 1; min-width: 200px;" onclick="event.stopPropagation();">
                <option value="">-- Chọn hình phạt --</option>
                <option value="warning">⚠️ Cảnh báo</option>
                <option value="ban_1day">🚫 Cấm chat 1 ngày</option>
                <option value="ban_3days">🚫 Cấm chat 3 ngày</option>
                <option value="ban_7days">🚫 Cấm chat 7 ngày</option>
                <option value="ban_permanent">🚫 Cấm chat vĩnh viễn</option>
                <option value="kick">🚫 Đuổi khỏi lớp học</option>
              </select>
              <button class="btn-apply-penalty-admin" data-student-id="${msg.senderId}" data-course-id="${msg.courseId}" data-student-name="${sender ? sender.fullName : 'Unknown'}" data-course-name="${course ? course.title : 'N/A'}" data-message-id="${msg.id}" style="background: #f44336; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 14px; transition: background 0.3s;" onclick="event.stopPropagation();">
                Áp dụng
              </button>
            </div>
          ` : `
            <span style="color: #666; font-size: 0.9em; font-style: italic; padding: 10px; background: #f5f5f5; border-radius: 4px; display: inline-block;">(Đã bị đuổi khỏi lớp học)</span>
          `}
        </div>
      `;
    });
    unprocessedList.innerHTML = html;
    
    // Thêm event listener cho click vào card để mở modal
    unprocessedList.querySelectorAll('.inappropriate-message-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('penalty-select-admin') || e.target.classList.contains('btn-apply-penalty-admin')) {
          return; // Không mở modal nếu click vào select hoặc button
        }
        const messageId = card.dataset.messageId;
        const studentId = card.dataset.studentId;
        showMessageDetailModal(container, messageId, studentId);
      });
    });
    
    // Thêm event listener cho nút áp dụng hình phạt
    unprocessedList.querySelectorAll('.btn-apply-penalty-admin').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const studentId = e.target.dataset.studentId;
        const courseId = e.target.dataset.courseId;
        const studentName = e.target.dataset.studentName;
        const courseName = e.target.dataset.courseName;
        const messageId = e.target.dataset.messageId;
        
        const select = e.target.parentElement.querySelector('.penalty-select-admin');
        const penaltyType = select.value;
        
        if (!penaltyType) {
          alert('⚠️ Vui lòng chọn hình phạt!');
          return;
        }
        
        applyPenalty(penaltyType, studentId, courseId, studentName, courseName, messageId);
        loadInappropriateMessages(container); // Reload danh sách
      });
    });
  }
}

// Render tin nhắn đã xử lý
function renderProcessedMessages(container, messages, users, courses, violations) {
  const processedList = container.querySelector('#processed-messages-list');
  if (!processedList) return;
  
  if (messages.length === 0) {
    processedList.innerHTML = '<p style="color: #856404; margin: 0; padding: 10px; background: white; border-radius: 4px;">✅ Không có tin nhắn đã xử lý nào.</p>';
  } else {
    let html = '';
    messages.forEach(msg => {
      const sender = users.find(u => u.id === msg.senderId);
      const course = courses.find(c => c.id === msg.courseId);
      const messageViolations = violations.filter(v => v.messageId === msg.id);
      const latestViolation = messageViolations.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))[0];
      
      html += `
        <div class="inappropriate-message-card processed" style="background: white; border: 1px solid #4caf50; border-radius: 8px; padding: 15px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); cursor: pointer;" data-message-id="${msg.id}" data-student-id="${msg.senderId}" data-course-id="${msg.courseId}">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <strong style="color: #d32f2f; font-size: 16px;">👤 ${sender ? sender.fullName : 'Unknown'}</strong>
              <span style="background: #ffebee; color: #c62828; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">Học sinh</span>
              <span style="background: #c8e6c9; color: #2e7d32; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">✓ Đã xử lý</span>
            </div>
            <span style="color: #666; font-size: 0.9em;">${new Date(msg.timestamp).toLocaleString('vi-VN')}</span>
          </div>
          <div style="color: #333; margin-bottom: 10px; font-weight: 500;">📚 Khóa học: ${course ? course.title : 'N/A'}</div>
          <div style="background: #ffebee; padding: 12px; border-radius: 6px; color: #c62828; font-weight: bold; border-left: 4px solid #f44336; margin-bottom: 10px;">
            "${msg.content}"
          </div>
          ${latestViolation ? `
            <div style="background: #e8f5e9; padding: 10px; border-radius: 6px; margin-top: 10px; border-left: 4px solid #4caf50;">
              <strong style="color: #2e7d32;">Hình phạt đã áp dụng:</strong> ${latestViolation.penaltyName}
              <div style="color: #666; font-size: 0.9em; margin-top: 5px;">Thời gian: ${new Date(latestViolation.appliedAt).toLocaleString('vi-VN')}</div>
            </div>
          ` : ''}
        </div>
      `;
    });
    processedList.innerHTML = html;
    
    // Thêm event listener cho click vào card để mở modal
    processedList.querySelectorAll('.inappropriate-message-card').forEach(card => {
      card.addEventListener('click', () => {
        const messageId = card.dataset.messageId;
        const studentId = card.dataset.studentId;
        showMessageDetailModal(container, messageId, studentId);
      });
    });
  }
}

// Hiển thị modal chi tiết tin nhắn
function showMessageDetailModal(container, messageId, studentId) {
  const messages = getFromStorage(STORAGE_KEYS.CHAT_MESSAGES) || [];
  const users = getFromStorage(STORAGE_KEYS.USERS) || [];
  const courses = getFromStorage(STORAGE_KEYS.COURSES) || [];
  const violations = getFromStorage(STORAGE_KEYS.STUDENT_VIOLATIONS) || [];
  
  const message = messages.find(m => m.id === messageId);
  if (!message) return;
  
  const sender = users.find(u => u.id === message.senderId);
  const course = courses.find(c => c.id === message.courseId);
  const studentViolations = violations.filter(v => v.studentId === studentId).sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
  
  // Tạo modal nếu chưa có
  let modal = container.querySelector('#message-detail-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'message-detail-modal';
    modal.className = 'modal';
    modal.style.display = 'none';
    container.appendChild(modal);
  }
  
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 900px; width: 90%; max-height: 90vh; overflow-y: auto;">
      <div class="modal-header">
        <h3>Chi tiết tin nhắn không chuẩn mực</h3>
        <button class="modal-close" style="background: none; border: none; font-size: 28px; cursor: pointer; color: #666;">&times;</button>
      </div>
      <div class="modal-body" style="display: flex; gap: 20px; padding: 20px;">
        <!-- Cột trái: Thông tin tin nhắn -->
        <div style="flex: 1;">
          <h4 style="margin-top: 0; color: #d32f2f; border-bottom: 2px solid #f44336; padding-bottom: 10px;">⚠️ Tin nhắn không chuẩn mực</h4>
          <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
            <div style="margin-bottom: 10px;">
              <strong>👤 Người gửi:</strong> ${sender ? sender.fullName : 'Unknown'}
            </div>
            <div style="margin-bottom: 10px;">
              <strong>📚 Khóa học:</strong> ${course ? course.title : 'N/A'}
            </div>
            <div style="margin-bottom: 10px;">
              <strong>🕐 Thời gian:</strong> ${new Date(message.timestamp).toLocaleString('vi-VN')}
            </div>
            <div style="background: #ffebee; padding: 15px; border-radius: 6px; border-left: 4px solid #f44336; margin-top: 15px;">
              <strong style="color: #c62828;">Nội dung tin nhắn:</strong>
              <p style="margin: 10px 0 0 0; color: #c62828; font-weight: bold; font-size: 16px;">"${message.content}"</p>
            </div>
          </div>
        </div>
        
        <!-- Cột phải: Lịch sử kỷ luật -->
        <div style="flex: 1;">
          <h4 style="margin-top: 0; color: #2e7d32; border-bottom: 2px solid #4caf50; padding-bottom: 10px;">📋 Lịch sử kỷ luật của sinh viên</h4>
          <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 15px; max-height: 400px; overflow-y: auto;">
            ${studentViolations.length === 0 ? `
              <p style="text-align: center; color: #666; padding: 20px;">Chưa có kỷ luật nào được áp dụng cho sinh viên này.</p>
            ` : `
              ${studentViolations.map(v => {
                const appliedByUser = users.find(u => u.id === v.appliedBy);
                const violationCourse = courses.find(c => c.id === v.courseId);
                return `
                  <div style="background: #f5f5f5; border-left: 4px solid #4caf50; padding: 12px; margin-bottom: 10px; border-radius: 4px;">
                    <div style="font-weight: bold; color: #2e7d32; margin-bottom: 5px;">${v.penaltyName}</div>
                    <div style="font-size: 0.9em; color: #666; margin-bottom: 3px;">📚 Khóa học: ${violationCourse ? violationCourse.title : 'N/A'}</div>
                    <div style="font-size: 0.9em; color: #666; margin-bottom: 3px;">👤 Áp dụng bởi: ${appliedByUser ? appliedByUser.fullName : 'Admin'}</div>
                    <div style="font-size: 0.9em; color: #666;">🕐 Thời gian: ${new Date(v.appliedAt).toLocaleString('vi-VN')}</div>
                  </div>
                `;
              }).join('')}
            `}
          </div>
        </div>
      </div>
      <div class="modal-footer" style="padding: 15px; border-top: 1px solid #ddd; text-align: right;">
        <button class="btn btn-secondary" id="close-modal-btn" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;">Đóng</button>
      </div>
    </div>
  `;
  
  // Event listeners
  const closeBtn = modal.querySelector('.modal-close');
  const closeModalBtn = modal.querySelector('#close-modal-btn');
  
  const closeModal = () => {
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
  };
  
  closeBtn.addEventListener('click', closeModal);
  closeModalBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Hiển thị modal
  modal.style.display = 'flex';
  document.body.classList.add('modal-open');
}

// Hàm áp dụng hình phạt (cho admin)
function applyPenalty(penaltyType, studentId, courseId, studentName, courseName, messageId) {
  const currentUser = stateManager.getState().user;
  let confirmMessage = '';
  let penaltyName = '';
  
  switch(penaltyType) {
    case 'warning':
      confirmMessage = `⚠️ Bạn có chắc chắn muốn cảnh báo học sinh "${studentName}"?\n\nHọc sinh sẽ nhận được cảnh báo về hành vi không phù hợp.`;
      penaltyName = 'Cảnh báo';
      break;
    case 'ban_1day':
      confirmMessage = `🚫 Bạn có chắc chắn muốn cấm chat học sinh "${studentName}" trong 1 ngày?\n\nHọc sinh sẽ không thể gửi tin nhắn trong khóa học "${courseName}" trong 24 giờ.`;
      penaltyName = 'Cấm chat 1 ngày';
      break;
    case 'ban_3days':
      confirmMessage = `🚫 Bạn có chắc chắn muốn cấm chat học sinh "${studentName}" trong 3 ngày?\n\nHọc sinh sẽ không thể gửi tin nhắn trong khóa học "${courseName}" trong 3 ngày.`;
      penaltyName = 'Cấm chat 3 ngày';
      break;
    case 'ban_7days':
      confirmMessage = `🚫 Bạn có chắc chắn muốn cấm chat học sinh "${studentName}" trong 7 ngày?\n\nHọc sinh sẽ không thể gửi tin nhắn trong khóa học "${courseName}" trong 7 ngày.`;
      penaltyName = 'Cấm chat 7 ngày';
      break;
    case 'ban_permanent':
      confirmMessage = `🚫 Bạn có chắc chắn muốn cấm chat vĩnh viễn học sinh "${studentName}"?\n\nHọc sinh sẽ không thể gửi tin nhắn trong khóa học "${courseName}" vĩnh viễn.`;
      penaltyName = 'Cấm chat vĩnh viễn';
      break;
    case 'kick':
      confirmMessage = `⚠️ Bạn có chắc chắn muốn đuổi học sinh "${studentName}" khỏi khóa học "${courseName}"?\n\nHọc sinh này sẽ mất quyền truy cập vào khóa học và không thể tham gia chat nhóm.`;
      penaltyName = 'Đuổi khỏi lớp học';
      break;
  }
  
  if (!confirm(confirmMessage)) {
    return;
  }
  
  // Lưu vi phạm
  const violations = getFromStorage(STORAGE_KEYS.STUDENT_VIOLATIONS) || [];
  const violation = {
    id: generateId(),
    studentId: studentId,
    courseId: courseId,
    messageId: messageId,
    penaltyType: penaltyType,
    penaltyName: penaltyName,
    appliedBy: currentUser.id,
    appliedByName: currentUser.fullName,
    appliedAt: new Date().toISOString(),
    status: 'active'
  };
  violations.push(violation);
  saveToStorage(STORAGE_KEYS.STUDENT_VIOLATIONS, violations);
  
  // Dispatch event để học sinh nhận cảnh báo ngay lập tức
  if (penaltyType === 'warning') {
    window.dispatchEvent(new CustomEvent('studentWarningAdded', {
      detail: { violation, studentId }
    }));
  }
  
  // Xử lý hình phạt
  if (penaltyType === 'kick') {
    kickStudentFromCourse(courseId, studentId);
  } else if (penaltyType.startsWith('ban_')) {
    const chatBans = getFromStorage(STORAGE_KEYS.CHAT_BANS) || [];
    let banUntil = null;
    
    if (penaltyType === 'ban_1day') {
      banUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    } else if (penaltyType === 'ban_3days') {
      banUntil = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    } else if (penaltyType === 'ban_7days') {
      banUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (penaltyType === 'ban_permanent') {
      banUntil = null; // Vĩnh viễn
    }
    
    const existingBan = chatBans.find(ban => ban.studentId === studentId && ban.courseId === courseId);
    if (existingBan) {
      existingBan.banUntil = banUntil;
      existingBan.updatedAt = new Date().toISOString();
      existingBan.violationId = violation.id;
      updateInStorage(STORAGE_KEYS.CHAT_BANS, existingBan.id, existingBan);
    } else {
      const chatBan = {
        id: generateId(),
        studentId: studentId,
        courseId: courseId,
        banUntil: banUntil,
        violationId: violation.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      chatBans.push(chatBan);
      saveToStorage(STORAGE_KEYS.CHAT_BANS, chatBans);
    }
  }
  
  alert(`✅ Đã áp dụng hình phạt "${penaltyName}" cho học sinh "${studentName}" thành công!`);
}

// Hàm đuổi học sinh khỏi lớp học (cho admin)
function kickStudentFromCourse(courseId, studentId) {
  const courses = getFromStorage(STORAGE_KEYS.COURSES);
  const course = courses.find(c => c.id === courseId);
  
  if (course && course.students) {
    course.students = course.students.filter(id => id !== studentId);
    updateInStorage(STORAGE_KEYS.COURSES, courseId, course);
    
    // Broadcast course update event
    window.dispatchEvent(new CustomEvent('coursesUpdated', {
      detail: { action: 'student_removed', courseId, courseTitle: course.title }
    }));
  }
}

export function renderAdminForum() {
    // Kiểm tra quyền truy cập
    const currentUser = stateManager.getState().user;
    if (!currentUser || currentUser.role !== 'admin') {
      navigateTo('/dashboard');
      return document.createElement('div');
    }
    
    const courses = getFromStorage(STORAGE_KEYS.COURSES);
  
  // Admin có thể xem tất cả khóa học
  const allCourses = courses || [];

  const container = document.createElement('div');
  container.className = 'admin-chat';

  container.innerHTML = `
    <div class="page-header">
      <h1>Quản lý tin nhắn hệ thống</h1>
    </div>

    <div class="chat-header">
      <div class="chat-title">
        <h2>💬 Chat nhóm lớp</h2>
        <p>Quản lý và tham gia chat của toàn bộ hệ thống</p>
      </div>
      <div class="course-selector">
        <select id="course-select" class="course-select">
          <option value="">Chọn lớp học...</option>
          ${allCourses.map(course => `<option value="${course.id}">${course.title}</option>`).join('')}
        </select>
      </div>
    </div>

    <div style="display: flex; gap: 20px; margin-top: 20px; height: calc(100vh - 300px); min-height: 500px;">
      <!-- Cột trái: Quản lý tin nhắn không chuẩn mực -->
      <div id="inappropriate-messages-section" style="flex: 0 0 400px; overflow-y: auto; padding-right: 10px;">
        <div style="padding: 20px; background: #fff3cd; border: 2px solid #ffc107; border-radius: 12px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 20px 0; color: #856404; display: flex; align-items: center; gap: 10px;">
            <span>⚠️</span>
            <span>Tin nhắn không chuẩn mực</span>
          </h3>
          
          <!-- Tabs -->
          <div style="display: flex; gap: 10px; margin-bottom: 15px; border-bottom: 2px solid #ffc107;">
            <button class="inappropriate-tab active" data-tab="unprocessed" style="flex: 1; padding: 10px; background: #ff9800; color: white; border: none; border-radius: 8px 8px 0 0; cursor: pointer; font-weight: bold; font-size: 14px;">
              Chưa xử lý
            </button>
            <button class="inappropriate-tab" data-tab="processed" style="flex: 1; padding: 10px; background: #ffc107; color: #856404; border: none; border-radius: 8px 8px 0 0; cursor: pointer; font-weight: bold; font-size: 14px;">
              Đã xử lý
            </button>
          </div>
          
          <!-- Tab content: Chưa xử lý -->
          <div id="unprocessed-tab-content" style="display: block;">
            <div id="unprocessed-messages-list" style="max-height: calc(100vh - 450px); overflow-y: auto;">
              <!-- Danh sách tin nhắn chưa xử lý sẽ được load ở đây -->
            </div>
          </div>
          
          <!-- Tab content: Đã xử lý -->
          <div id="processed-tab-content" style="display: none;">
            <div id="processed-messages-list" style="max-height: calc(100vh - 450px); overflow-y: auto;">
              <!-- Danh sách tin nhắn đã xử lý sẽ được load ở đây -->
            </div>
          </div>
        </div>
      </div>
      
      <!-- Cột phải: Chat nhóm -->
      <div class="chat-container" id="chat-container" style="flex: 1; display: flex; flex-direction: column; min-width: 0;">
        <div class="no-course-selected" id="no-course-selected" style="flex: 1; display: flex; align-items: center; justify-content: center;">
          <div class="empty-state">
            <div class="empty-icon">📚</div>
            <h3>Chọn lớp học để xem chat</h3>
            <p>Hãy chọn một lớp học từ danh sách trên để xem và tham gia chat nhóm.</p>
          </div>
        </div>
        
        <div class="chat-messages" id="chat-messages" style="display: none; flex: 1; overflow-y: auto; padding: 15px;">
          <!-- Messages will be loaded here -->
        </div>
        
        <div class="chat-input-form" id="chat-input-form" style="display: none; padding: 15px; border-top: 1px solid #e0e0e0; background: #fff;">
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

  setupAdminChatEventListeners(container);
  
  // Setup tab switching
  setupInappropriateTabs(container);
  
  // Load tin nhắn không chuẩn mực
  setTimeout(() => {
    loadInappropriateMessages(container);
  }, 100);
  
  // Lắng nghe sự kiện khi có tin nhắn mới
  window.addEventListener('chatMessageAdded', (e) => {
    // Nếu tin nhắn không chuẩn mực, reload danh sách và hiển thị thông báo
    if (e.detail && e.detail.isInappropriate) {
      loadInappropriateMessages(container);
      showInappropriateMessageNotification(e.detail.message);
    }
  });

  // Lắng nghe sự kiện riêng cho tin nhắn không chuẩn mực
  window.addEventListener('inappropriateMessageDetected', (e) => {
    if (e.detail) {
      loadInappropriateMessages(container);
      showInappropriateMessageNotification(e.detail.message);
    }
  });

  // Lắng nghe storage changes để cập nhật real-time
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEYS.CHAT_MESSAGES) {
      loadInappropriateMessages(container);
    }
  });
  
  return container;
}

// Setup tab switching cho phần tin nhắn không chuẩn mực
function setupInappropriateTabs(container) {
  const tabs = container.querySelectorAll('.inappropriate-tab');
  const unprocessedContent = container.querySelector('#unprocessed-tab-content');
  const processedContent = container.querySelector('#processed-tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabType = tab.dataset.tab;
      
      // Update active state
      tabs.forEach(t => {
        t.classList.remove('active');
        if (t.dataset.tab === 'unprocessed') {
          t.style.background = '#ffc107';
          t.style.color = '#856404';
        } else {
          t.style.background = '#ffc107';
          t.style.color = '#856404';
        }
      });
      
      tab.classList.add('active');
      if (tabType === 'unprocessed') {
        tab.style.background = '#ff9800';
        tab.style.color = 'white';
        unprocessedContent.style.display = 'block';
        processedContent.style.display = 'none';
      } else {
        tab.style.background = '#4caf50';
        tab.style.color = 'white';
        unprocessedContent.style.display = 'none';
        processedContent.style.display = 'block';
      }
    });
  });
}

function setupAdminChatEventListeners(container) {
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
  
  messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();

    if (message && selectedCourseId) {
      sendMessage(selectedCourseId, message);
      messageInput.value = '';
      messageInput.focus();
    }
  });
}
