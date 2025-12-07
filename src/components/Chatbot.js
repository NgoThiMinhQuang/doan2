import { stateManager } from '../state.js';

const OPENROUTER_API_KEY = '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

let chatHistory = [];
let isMinimized = false;
let isOpen = false;

export function createChatbotWidget() {
  // Kiểm tra xem chatbot đã tồn tại chưa
  if (document.getElementById('chatbot-widget')) {
    return;
  }

  const chatbotHTML = `
    <div id="chatbot-widget" class="chatbot-widget ${isMinimized ? 'minimized' : ''}" style="display: none;">
      <div class="chatbot-header" id="chatbot-header">
        <div class="chatbot-header-content">
          <div class="chatbot-avatar">
            <div class="robot-head">
              <div class="robot-eyes">
                <div class="eye"></div>
                <div class="eye"></div>
              </div>
              <div class="robot-mouth"></div>
            </div>
          </div>
          <div class="chatbot-title">
            <h3>Chat cùng AI Assistant</h3>
            <p class="chatbot-status">Đang trực tuyến</p>
          </div>
        </div>
        <div class="chatbot-controls">
          <button class="chatbot-btn-minimize" id="chatbot-minimize" title="Thu nhỏ">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 8H12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <button class="chatbot-btn-close" id="chatbot-close" title="Đóng">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="chatbot-body" id="chatbot-body">
        <div class="chatbot-messages" id="chatbot-messages">
          <div class="chatbot-welcome">
            <div class="chatbot-avatar-large">
              <div class="robot-head">
                <div class="robot-eyes">
                  <div class="eye"></div>
                  <div class="eye"></div>
                </div>
                <div class="robot-mouth"></div>
              </div>
            </div>
            <div class="chat-bubble bot-bubble">
              <p>Xin chào! Tôi là AI Assistant. Tôi có thể giúp bạn với:</p>
              <ul>
                <li>Trả lời câu hỏi về học tập</li>
                <li>Giải thích khái niệm</li>
                <li>Hỗ trợ làm bài tập</li>
                <li>Và nhiều hơn nữa!</li>
              </ul>
              <p>Hãy bắt đầu cuộc trò chuyện với tôi nhé! 👋</p>
            </div>
          </div>
        </div>
        
        <div class="chatbot-input-container">
          <div class="chatbot-typing-indicator" id="chatbot-typing" style="display: none;">
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <form id="chatbot-form" class="chatbot-form">
            <input 
              type="text" 
              id="chatbot-input" 
              class="chatbot-input" 
              placeholder="Nhập câu hỏi của bạn..."
              autocomplete="off"
            />
            <button type="submit" class="chatbot-send-btn" id="chatbot-send">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </form>
        </div>
      </div>
      
    </div>
    
    <button class="chatbot-toggle" id="chatbot-toggle">
      <div class="robot-head-small">
        <div class="robot-eyes">
          <div class="eye"></div>
          <div class="eye"></div>
        </div>
        <div class="robot-mouth"></div>
      </div>
      <div class="chat-bubble-icon">
        <div class="bubble-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </button>
  `;

  document.body.insertAdjacentHTML('beforeend', chatbotHTML);
  setupChatbotEventListeners();
}

function setupChatbotEventListeners() {
  const widget = document.getElementById('chatbot-widget');
  const minimizeBtn = document.getElementById('chatbot-minimize');
  const closeBtn = document.getElementById('chatbot-close');
  const toggleBtn = document.getElementById('chatbot-toggle');
  const form = document.getElementById('chatbot-form');
  const input = document.getElementById('chatbot-input');
  const header = document.getElementById('chatbot-header');

  // Minimize
  minimizeBtn?.addEventListener('click', () => {
    isMinimized = true;
    isOpen = false;
    widget.classList.add('minimized');
    widget.style.display = 'none';
    toggleBtn.style.display = 'flex';
  });

  // Close
  closeBtn?.addEventListener('click', () => {
    isOpen = false;
    isMinimized = false;
    widget.style.display = 'none';
    widget.classList.remove('minimized');
    toggleBtn.style.display = 'flex';
  });

  // Toggle button - mở/đóng chatbot
  toggleBtn?.addEventListener('click', () => {
    if (!isOpen) {
      // Mở chatbot
      isOpen = true;
      isMinimized = false;
      widget.style.display = 'flex';
      widget.classList.remove('minimized');
      toggleBtn.style.display = 'none';
      input.focus();
    } else {
      // Đóng chatbot
      isOpen = false;
      widget.style.display = 'none';
      toggleBtn.style.display = 'flex';
    }
  });

  // Drag header để di chuyển widget
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;

  header?.addEventListener('mousedown', (e) => {
    if (e.target.closest('.chatbot-controls')) return;
    isDragging = true;
    initialX = e.clientX - widget.offsetLeft;
    initialY = e.clientY - widget.offsetTop;
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      
      // Giới hạn trong viewport
      const maxX = window.innerWidth - widget.offsetWidth;
      const maxY = window.innerHeight - widget.offsetHeight;
      
      currentX = Math.max(0, Math.min(currentX, maxX));
      currentY = Math.max(0, Math.min(currentY, maxY));
      
      widget.style.left = currentX + 'px';
      widget.style.top = currentY + 'px';
      widget.style.right = 'auto';
      widget.style.bottom = 'auto';
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Form submit
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, 'user');
    input.value = '';
    input.disabled = true;

    // Show typing indicator
    showTypingIndicator();

    try {
      // Call OpenRouter API
      const response = await sendToOpenRouter(message);
      hideTypingIndicator();
      
      // Add bot response
      addMessage(response, 'bot');
    } catch (error) {
      hideTypingIndicator();
      addMessage('Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.', 'bot');
      console.error('Chatbot error:', error);
    } finally {
      input.disabled = false;
      input.focus();
    }
  });

  // Enter key để gửi
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.dispatchEvent(new Event('submit'));
    }
  });
}

async function sendToOpenRouter(message) {
  // Thêm message vào history
  chatHistory.push({
    role: 'user',
    content: message
  });

  // Giới hạn lịch sử để tránh token quá nhiều
  if (chatHistory.length > 20) {
    chatHistory = chatHistory.slice(-20);
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'EduSystem Chatbot'
    },
    body: JSON.stringify({
      model: 'openai/gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Bạn là một AI Assistant thân thiện và hữu ích cho hệ thống giáo dục. Bạn giúp học sinh và giáo viên với các câu hỏi về học tập, giải thích khái niệm, và hỗ trợ làm bài tập. Hãy trả lời bằng tiếng Việt một cách rõ ràng và dễ hiểu.'
        },
        ...chatHistory
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error?.message || 'API request failed');
  }

  const data = await response.json();
  const botMessage = data.choices[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời câu hỏi này.';

  // Thêm bot response vào history
  chatHistory.push({
    role: 'assistant',
    content: botMessage
  });

  return botMessage;
}

function addMessage(content, sender) {
  const messagesContainer = document.getElementById('chatbot-messages');
  if (!messagesContainer) return;

  // Xóa welcome message nếu có
  const welcome = messagesContainer.querySelector('.chatbot-welcome');
  if (welcome && sender === 'user') {
    welcome.remove();
  }

  const messageDiv = document.createElement('div');
  messageDiv.className = `chatbot-message ${sender === 'user' ? 'user-message' : 'bot-message'}`;
  
  if (sender === 'bot') {
    messageDiv.innerHTML = `
      <div class="chatbot-avatar-small">
        <div class="robot-head">
          <div class="robot-eyes">
            <div class="eye"></div>
            <div class="eye"></div>
          </div>
          <div class="robot-mouth"></div>
        </div>
      </div>
      <div class="chat-bubble bot-bubble">
        <p>${formatMessage(content)}</p>
      </div>
    `;
  } else {
    messageDiv.innerHTML = `
      <div class="chat-bubble user-bubble">
        <p>${formatMessage(content)}</p>
      </div>
    `;
  }

  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function formatMessage(text) {
  // Escape HTML và format line breaks
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}

function showTypingIndicator() {
  const typing = document.getElementById('chatbot-typing');
  if (typing) {
    typing.style.display = 'block';
    const messagesContainer = document.getElementById('chatbot-messages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
}

function hideTypingIndicator() {
  const typing = document.getElementById('chatbot-typing');
  if (typing) {
    typing.style.display = 'none';
  }
}

// Export function để khởi tạo từ app.js
export function initChatbot() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createChatbotWidget);
  } else {
    createChatbotWidget();
  }
}

// Function để ẩn/hiện chatbot dựa trên trạng thái làm bài
export function toggleChatbotVisibility(shouldHide) {
  const widget = document.getElementById('chatbot-widget');
  const toggle = document.getElementById('chatbot-toggle');
  
  if (!widget || !toggle) return;
  
  if (shouldHide) {
    // Ẩn cả widget và toggle khi đang làm bài
    widget.style.display = 'none';
    toggle.style.display = 'none';
  } else {
    // Hiện lại toggle khi không làm bài
    if (!isOpen) {
      toggle.style.display = 'flex';
    }
  }
}

// Kiểm tra xem có đang làm bài không
export function checkIfTakingExam() {
  // Kiểm tra class exam-taking-container
  const examContainer = document.querySelector('.exam-taking-container');
  if (examContainer) {
    return true;
  }
  
  // Kiểm tra modal làm bài (nếu có)
  const assignmentModal = document.getElementById('assignment-modal');
  if (assignmentModal && assignmentModal.style.display !== 'none') {
    return true;
  }
  
  // Kiểm tra các modal khác liên quan đến làm bài
  const modals = document.querySelectorAll('.modal');
  for (let modal of modals) {
    if (modal.style.display !== 'none' && 
        (modal.id.includes('exam') || modal.id.includes('quiz') || modal.id.includes('assignment'))) {
      return true;
    }
  }
  
  return false;
}

