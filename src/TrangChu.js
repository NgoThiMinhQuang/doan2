import { navigateTo } from './routing.js';
import { playVideoInModal } from './utils.js';

// Main render function for landing page
export function renderTrangChu() {
  // Add class to body for styling
  document.body.classList.add('showing-home-page');
  document.body.style.background = '#fff';
  document.body.style.backgroundImage = 'none';
  
  const container = document.createElement('div');
  container.className = 'home-page';

  container.innerHTML = `
    <header class="lp-header">
      <div class="lp-container lp-header-inner">
        <a class="lp-brand" href="#" id="lp-logo-link">
          <svg class="lp-logo" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="8" fill="url(#logo-gradient)"/>
            <!-- Graduation cap icon -->
            <path d="M20 10L8 16L20 22L32 16L20 10Z" fill="white"/>
            <path d="M20 22L14 19V25C14 27 16.5 29 20 29C23.5 29 26 27 26 25V19L20 22Z" fill="white" opacity="0.9"/>
            <circle cx="30" cy="18" r="2" fill="#FF9500"/>
            <defs>
              <linearGradient id="logo-gradient" x1="0" y1="0" x2="40" y2="40">
                <stop offset="0%" stop-color="#667eea"/>
                <stop offset="100%" stop-color="#764ba2"/>
              </linearGradient>
            </defs>
          </svg>
          <div class="lp-brand-text">
            <span class="lp-brand-title">EduSystem</span>
          </div>
        </a>

        <nav class="lp-nav">
          <a href="#" class="lp-nav-link" id="nav-home">TRANG CHỦ ▾</a>
          <a href="#about" class="lp-nav-link">VỀ CHÚNG TÔI ▾</a>
          <a href="#courses" class="lp-nav-link">KHÓA HỌC ▾</a>
          <a href="#lp-testimonials" class="lp-nav-link">CẢM NHẬN ▾</a>
          <a href="#lp-contact" class="lp-nav-link">LIÊN HỆ ▾</a>
        </nav>

        <div class="lp-actions">
          <button class="lp-btn lp-btn-primary" id="btn-login">ĐĂNG NHẬP</button>
        </div>
      </div>
    </header>

    <main>
      <section class="lp-hero">
        <div class="lp-container">
          
          <h1 class="lp-hero-title">Nắm Vững Toán Rời Rạc – Chìa Khóa Cho Lập Trình & AI</h1>
          <p class="lp-hero-sub">Khóa học chuyên sâu, toàn diện và ứng dụng thực tiễn nhất về Logic, Tập hợp, Đồ thị, Tổ hợp và Thuật toán.</p>
          <div class="lp-search-wrap">
            <div class="lp-search">
              <input id="lp-search-input" class="lp-search-input" placeholder="Bạn muốn học gì hôm nay?" />
              <button class="lp-search-btn" id="lp-search-btn">TÌM KIẾM</button>
            </div>
          </div>

          <div class="lp-hero-illustration">
            <img src="/img/hero_greens_to_pastel.png" alt="Học tập trực tuyến" onerror="this.src='https://illustrations.popsy.co/amber/remote-work.svg'" />
          </div>
        </div>
      </section>

      <section class="lp-section" id="features">
        <div class="lp-container">
          <div class="lp-features">
            <div class="lp-feature-card">
              <div class="lp-feature-icon" style="--bg:#fff3e6">🎓</div>
              <div class="lp-feature-content">
                <h3>Học từ Chuyên Gia</h3>
                <p>Nắm vững kiến thức Toán Rời Rạc từ căn bản đến nâng cao: Logic mệnh đề, Logic vị từ, Tập hợp, Hàm, Quan hệ, Đại số Boolean, Lý thuyết đồ thị và Tổ hợp.
                 Chương trình được thiết kế theo lộ trình thực tế, giúp bạn áp dụng ngay vào phát triển thuật toán và khoa học máy tính.</p>
              </div>
            </div>
            
            <div class="lp-feature-card">
              <div class="lp-feature-icon" style="--bg:#e6f0ff">📘</div>
              <div class="lp-feature-content">
                <h3>Thư Viện & Bài tập</h3>
                <p>Truy cập kho tài liệu số khổng lồ, bao gồm Ebook, Slide bài giảng, và Ngân hàng Bài tập có lời giải chi tiết. 
                Tự luyện tập với các bài toán mô phỏng đề thi và tình huống thực tế để củng cố kiến thức một cách vững chắc nhất.</p>
              </div>
            </div>
            
            <div class="lp-feature-card">
              <div class="lp-feature-icon" style="--bg:#ffe6ee">🏫</div>
              <div class="lp-feature-content">
                <h3>Giáo Dục Trực Tuyến & Hỗ trợ 24/7</h3>
                <p>Học mọi lúc, mọi nơi với lộ trình cá nhân hóa và hỗ trợ 24/7. Hỏi đáp, giải đáp thắc mắc ngay lập tức, giúp bạn tiếp thu kiến thức một cách hiệu quả nhất.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="lp-section" id="welcome" style="background: linear-gradient(180deg, #f3f0ff 0%, #faf8ff 100%);">
        <div class="lp-container lp-welcome">
          <div class="lp-welcome-illustration">
            <img alt="Giảng viên" src="/img/giang_vien.jpg"/>
          </div>
          <div class="lp-welcome-content">
            <p class="lp-eyebrow">Chào mừng đến</p>
            <h2>EduSystem</h2>
            <p>Toán Rời Rạc là nền tảng tư duy logic không thể thiếu trong lĩnh vực Lập trình, Khoa học Dữ liệu và Trí tuệ Nhân tạo. EduSystem được xây dựng bởi đội ngũ chuyên gia, cung cấp các khóa học được hệ thống hóa,
             kèm theo bài tập ứng dụng thực tế, giúp bạn nắm vững kiến thức cốt lõi và tự tin áp dụng vào các dự án CNTT.</p>
            <div style="display: flex; gap: 16px; margin-top: 24px;">
              <button class="lp-btn lp-btn-outline" id="btn-view-all">XEM TẤT CẢ -></button>
              <button class="lp-btn lp-btn-primary" id="btn-free-trial">HỌC THỬ MIỄN PHÍ</button>
            </div>
          </div>
        </div>
      </section>

      <!-- Learning Path Section -->
      <section class="lp-section lp-learning-path" style="background: #ffffff;">
        <div class="lp-container">
          <div class="lp-section-head">
            <h2>Nắm vững Toán Rời Rạc</h2>
          </div>
          
          <div class="lp-path-steps">
            <!-- Step 1 -->
            <div class="lp-path-step">
              <div class="lp-step-number">Bài 1</div>
              <h3 class="lp-step-title">Logic & Mệnh đề</h3>
              <p class="lp-step-desc">Nền tảng suy luận và chứng minh toán học</p>
            </div>

            <!-- Step 2 -->
            <div class="lp-path-step">
              <div class="lp-step-number">Bài 2</div>
              <h3 class="lp-step-title">Tập hợp – Quan hệ – Hàm</h3>
              <p class="lp-step-desc">Quan hệ tương đương, thứ tự, bao đóng; kỹ thuật đếm cơ bản</p>
            </div>

            <!-- Step 3 -->
            <div class="lp-path-step">
              <div class="lp-step-number">Bài 3</div>
              <h3 class="lp-step-title">Tổ hợp & Xác suất rời rạc</h3>
              <p class="lp-step-desc">Quy tắc cộng/nhân, hoán vị/chỉnh hợp/tổ hợp, nhị thức Newton</p>
            </div>

            <!-- Step 4 -->
            <div class="lp-path-step">
              <div class="lp-step-number">Bài 4</div>
              <h3 class="lp-step-title">Đồ thị</h3>
              <p class="lp-step-desc">Khái niệm, bậc đỉnh, đường đi/chu trình, cây; ma trận kề & danh sách kề</p>
            </div>

            <!-- Step 5 -->
            <div class="lp-path-step">
              <div class="lp-step-number">Bài 5</div>
              <h3 class="lp-step-title">Thuật toán trên đồ thị</h3>
              <p class="lp-step-desc">BFS/DFS, Dijkstra, Kruskal/Prim; độ phức tạp thời gian</p>
            </div>

            <!-- Step 6 -->
            <div class="lp-path-step">
              <div class="lp-step-number">Bài 6</div>
              <h3 class="lp-step-title">Số học & Mật mã</h3>
              <p class="lp-step-desc">Đồng dư, CRT, Euler/Fermat; Caesar & RSA từng bước</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section: Giá trị khác biệt -->
      <section class="lp-section lp-features-detailed" id="about" style="background: linear-gradient(180deg, #f3f0ff 0%, #faf8ff 100%);">
        <div class="lp-container">
          <!-- Main Title -->
          <div class="lp-section-head">
            <h2>Giá trị khác biệt</h2>
          </div>

          <!-- Sub-section 1: Đội ngũ giảng dạy -->
          <div class="lp-features-grid">
            <div class="lp-feature-image">
              <img src="/img/giang_vien.jpg" alt="Đội ngũ giảng dạy" />
            </div>
            <div class="lp-feature-content-detail">
              <h3>Đội ngũ giảng dạy chất lượng cao</h3>
              <div class="lp-feature-list">
                <ul>
                    <li>100% giáo viên đạt giải Toán Rời Rạc/ Tin học cấp quốc gia, quốc tế</li>
                    <li>Hệ thống Website chấm bài tự động 24/24 với 600-800 bài tập thực hành từ dễ đến siêu khó</li>
                    <li>Website tích hợp AI hỗ trợ giải đáp từng bài tập, sửa từng lỗi sai</li>
                    <li>Phân chia nhóm nhỏ có cố vấn hỗ trợ giải đáp</li>
                  </ul>
              </div>
            </div>
          </div>

          <!-- Sub-section 2: 40-60 buổi học -->
          <div class="lp-features-grid lp-features-reverse" style="margin-top: 80px;">
            <div class="lp-feature-content-detail">
              <h3>Lộ Trình Học Tập Chặt Chẽ</h3>
              <div class="lp-feature-list">
                <p style="font-weight: 600; margin-bottom: 16px;">Quy trình học tập gồm 6 bước:</p>
                <ul>
                  <li>Đăng ký khóa học và thanh toán học phí</li>
                  <li>Tham gia nhóm hỗ trợ/khai giảng và nhận tài liệu chuyên đề Toán Rời rạc.</li>
                  <li>Phân nhóm 8-10 người theo năng lực sau 3 buổi học để tăng hiệu quả.</li>
                  <li>Được kèm cặp bởi cố vấn chuyên môn trong suốt khóa học</li>
                  <li>Thi định kỳ kỹ năng tư duy/giải thuật hàng tuần/tháng để đánh giá.</li>
                  <li>Hoàn thành dự án ứng dụng Toán Rời rạc và nhận chứng chỉ.</li>
                 
                </ul>
              </div>
            </div>
            <div class="lp-feature-image">
              <img src="/img/lo_trinh_hoc.png" alt="Học tập" />
            </div>
          </div>

          <!-- Sub-section 3: Khóa học cho mọi người -->
          <div class="lp-features-grid" style="margin-top: 80px;">
            <div class="lp-feature-image">
              <img src="/img/lo_trinh_hoc.jpg" alt="Khóa học cho mọi người" />
            </div>
            <div class="lp-feature-content-detail">
              <h3>Toán Rời Rạc Dễ Tiếp Cận Cho Mọi Trình Độ</h3>
              <div class="lp-feature-list">
                <p style="margin-bottom: 16px;">Dù bạn là người mới bắt đầu hay là người có kinh nghiệm, EduSystem đều có khóa học phù hợp với bạn</p>
                <ul>
                  <li>Đừng lo lắng vì bạn bị mất gốc - chúng tôi sẽ giúp bạn xây dựng nền tảng vững chắc từ đầu</li>
                  <li>Phù hợp cho người bắt đầu từ con số 0 hoặc muốn nâng cao kiến thức Toán Rời Rạc</li>
                  <li>Bài tập và lý thuyết được hướng dẫn từ cơ bản đến nâng cao, có lời giải chi tiết</li>
                  <li>Phương pháp giảng dạy "Áp dụng Lý thuyết vào Code" - học đi đôi với hành</li>
                  <li>Cam kết giúp bạn làm chủ tư duy logic cốt lõi để tiến xa trong ngành CNTT và AI</li>
                 
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="lp-section" id="courses" style="background: #ffffff;">
        <div class="lp-container">
          <div class="lp-section-head">
            <h2>Bài Học Nổi Bật</h2>
            <p>Tuyển chọn các chuyên đề quan trọng nhất của Toán Rời Rạc, được hệ thống hóa từ cơ bản đến ứng dụng, phục vụ trực tiếp cho ngành Công nghệ thông tin.</p>
          </div>
          <div class="lp-courses-grid">
            ${getSampleCourses().map(courseCard).join('')}
          </div>
        </div>
      </section>

      <!-- Testimonials Section -->
      <section class="lp-section lp-testimonials" id="lp-testimonials" style="background: linear-gradient(180deg, #f3f0ff 0%, #faf8ff 100%);">
        <div class="lp-container">
          <div class="lp-section-head">
            <h2>Học viên nói gì về chúng tôi</h2>
          </div>
          
          <div class="lp-testimonials-grid">
            <!-- Testimonial 1 -->
            <div class="lp-testimonial-card">
              <div class="lp-testimonial-quote">"</div>
              <div class="lp-testimonial-avatar">
                <img src="https://i.pravatar.cc/150?img=5" alt="Trần Thị Bình" />
              </div>
              <div class="lp-testimonial-stars">
                ⭐⭐⭐⭐⭐
              </div>
              <p class="lp-testimonial-content">
                Giảng viên rất nhiệt tình và kiên thức được truyền đạt một cách dễ hiểu. Tôi đã có thể áp dụng ngay những gì học được vào công việc.
              </p>
              <div class="lp-testimonial-author">
                <h4>Trần Thị Bình</h4>
                <p>Sinh viên năm 3</p>
              </div>
            </div>

            <!-- Testimonial 2 -->
            <div class="lp-testimonial-card">
              <div class="lp-testimonial-quote">"</div>
              <div class="lp-testimonial-avatar">
                <img src="https://i.pravatar.cc/150?img=12" alt="Nguyễn Văn Anh" />
              </div>
              <div class="lp-testimonial-stars">
                ⭐⭐⭐⭐⭐
              </div>
              <p class="lp-testimonial-content">
                Khóa học này thực sự tuyệt vời! Tôi đã học được rất nhiều về Toán Rời Rạc và cảm thấy tự tin hơn trong công việc lập trình của mình. EduSystem đã giúp tôi tự tin hơn rất nhiều!
              </p>
              <div class="lp-testimonial-author">
                <h4>Nguyễn Văn Anh</h4>
                <p>Sinh viên năm 4</p>
              </div>
            </div>

            <!-- Testimonial 3 -->
            <div class="lp-testimonial-card">
              <div class="lp-testimonial-quote">"</div>
              <div class="lp-testimonial-avatar">
                <img src="https://i.pravatar.cc/150?img=33" alt="Lê Văn Cường" />
              </div>
              <div class="lp-testimonial-stars">
                ⭐⭐⭐⭐⭐
              </div>
              <p class="lp-testimonial-content">
                Đây là một trong những khóa học online tốt nhất mà tôi từng tham gia. Nội dung phong phú và cập nhật với xu hướng công nghệ hiện tại.
              </p>
              <div class="lp-testimonial-author">
                <h4>Lê Văn Cường</h4>
                <p>Developer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="lp-stats-section">
        <div class="lp-container">
          <div class="lp-stats-grid">
            <!-- Stat 1 -->
            <div class="lp-stat-item">
              <div class="lp-stat-timeline-dot"></div>
              <div class="lp-stat-icon">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="38" fill="#EEF2FF" stroke="#3B82F6" stroke-width="2"/>
                  <path d="M40 20C36 20 32 22 32 25V28H35V25C35 24 37 23 40 23C43 23 45 24 45 25V28H48V25C48 22 44 20 40 20Z" fill="#3B82F6"/>
                  <rect x="28" y="30" width="24" height="3" rx="1.5" fill="#3B82F6"/>
                  <path d="M30 35H50L48 55C48 57 46 58 44 58H36C34 58 32 57 32 55L30 35Z" fill="#60A5FA"/>
                  <rect x="35" y="40" width="10" height="2" rx="1" fill="#3B82F6"/>
                  <rect x="33" y="45" width="14" height="2" rx="1" fill="#3B82F6"/>
                </svg>
              </div>
              <h3 class="lp-stat-number">5,000+</h3>
              <p class="lp-stat-label">Học viên toàn quốc</p>
            </div>

            <!-- Stat 2 -->
            <div class="lp-stat-item">
              <div class="lp-stat-timeline-dot"></div>
              <div class="lp-stat-icon">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="38" fill="#FEF3C7" stroke="#F59E0B" stroke-width="2"/>
                  <rect x="25" y="28" width="30" height="24" rx="2" fill="#FCD34D"/>
                  <path d="M32 28V25C32 23.5 33 22 35 22H45C47 22 48 23.5 48 25V28" stroke="#F59E0B" stroke-width="2"/>
                  <circle cx="32" cy="38" r="2" fill="#F59E0B"/>
                  <circle cx="40" cy="38" r="2" fill="#F59E0B"/>
                  <circle cx="48" cy="38" r="2" fill="#F59E0B"/>
                  <path d="M40 40L35 48H45L40 40Z" fill="#F59E0B"/>
                </svg>
              </div>
              <h3 class="lp-stat-number">60+</h3>
              <p class="lp-stat-label">Khóa học đã diễn ra</p>
            </div>

            <!-- Stat 3 -->
            <div class="lp-stat-item">
              <div class="lp-stat-timeline-dot"></div>
              <div class="lp-stat-icon">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="38" fill="#FEF3C7" stroke="#F59E0B" stroke-width="2"/>
                  <circle cx="40" cy="32" r="10" fill="#FCD34D"/>
                  <path d="M40 42L35 50L37 50L40 45L43 50L45 50L40 42Z" fill="#FCD34D"/>
                  <path d="M32 52H48C49 52 50 53 50 54V56H30V54C30 53 31 52 32 52Z" fill="#F59E0B"/>
                  <path d="M40 25L42 30L47 31L43.5 34.5L44.5 39.5L40 37L35.5 39.5L36.5 34.5L33 31L38 30L40 25Z" fill="#F59E0B"/>
                </svg>
              </div>
              <h3 class="lp-stat-number">300+</h3>
              <p class="lp-stat-label">Đánh giá tốt về khóa học</p>
            </div>

            <!-- Stat 4 -->
            <div class="lp-stat-item">
              <div class="lp-stat-timeline-dot"></div>
              <div class="lp-stat-icon">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="38" fill="#DBEAFE" stroke="#3B82F6" stroke-width="2"/>
                  <circle cx="32" cy="35" r="5" fill="#60A5FA"/>
                  <circle cx="48" cy="35" r="5" fill="#60A5FA"/>
                  <circle cx="40" cy="28" r="5" fill="#3B82F6"/>
                  <path d="M25 50C25 45 28 42 32 42H48C52 42 55 45 55 50V55H25V50Z" fill="#60A5FA"/>
                  <circle cx="40" cy="48" r="6" fill="#3B82F6"/>
                  <circle cx="28" cy="45" r="4" fill="#93C5FD"/>
                  <circle cx="52" cy="45" r="4" fill="#93C5FD"/>
                </svg>
              </div>
              <h3 class="lp-stat-number">80,000+</h3>
              <p class="lp-stat-label">Cộng đồng EduSystem</p>
            </div>
          </div>
        </div>
      </section>
    </main>
    
    <!-- CTA Section -->
    <section class="lp-cta-section" id="lp-contact">
      <div class="lp-container">
        <div class="lp-cta-content">
          <h2 class="lp-cta-title">Gửi yêu cầu tư vấn miễn phí</h2>
          <p class="lp-cta-desc">Vui lòng để lại số điện thoại, chúng tôi sẽ liên hệ tư vấn bạn trong thời gian sớm nhất.</p>
          <div class="lp-cta-form">
            <input type="tel" placeholder="Số điện thoại..." class="lp-cta-input" />
            <button class="lp-cta-btn" id="btn-register-consult">
              Đăng Ký
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>

    <footer class="lp-footer">
      <div class="lp-container">
        <div class="lp-footer-main">
          <!-- Column 1: Brand Info -->
          <div class="lp-footer-col lp-footer-brand">
            <h3 class="lp-footer-title">EduSystem - Become A Better Developer</h3>
            <div class="lp-footer-info">
              <p class="lp-footer-info-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                TP. Hồ Chí Minh
              </p>
              <p class="lp-footer-info-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                edusystem.work@gmail.com
              </p>
            </div>
          </div>

          <!-- Column 2: About -->
          <div class="lp-footer-col">
            <h4 class="lp-footer-heading">Về EduSystem</h4>
            <ul class="lp-footer-links">
              <li><a href="#about">Về chúng tôi</a></li>
              <li><a href="#terms">Điều khoản dịch vụ</a></li>
              <li><a href="#privacy">Chính sách bảo mật</a></li>
              <li><a href="#payment">Hướng dẫn thanh toán</a></li>
            </ul>
          </div>

          <!-- Column 3: Information -->
          <div class="lp-footer-col">
            <h4 class="lp-footer-heading">Thông Tin EduSystem</h4>
            <ul class="lp-footer-links">
              <li><a href="#register-teacher">Đăng ký giảng viên</a></li>
              <li><a href="#courses">Danh sách khóa học</a></li>
              <li><a href="#faq">Câu hỏi thường gặp</a></li>
              <li><a href="#blog">Góc chia sẻ</a></li>
            </ul>
          </div>

          <!-- Column 4: Fanpage Facebook -->
          <div class="lp-footer-col lp-footer-fanpage">
            <h4 class="lp-footer-heading">Fanpage Facebook</h4>
            <div class="lp-footer-fb-widget">
              <div class="lp-fb-placeholder">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="#1877f2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <div class="lp-fb-info">
                  <h5>EduSystem</h5>
                  <p>66.738 người theo dõi</p>
                  <div class="lp-fb-actions">
                    <button class="lp-fb-like">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                      </svg>
                      Đã theo dõi
                    </button>
                    <button class="lp-fb-share">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="18" cy="5" r="3"></circle>
                        <circle cx="6" cy="12" r="3"></circle>
                        <circle cx="18" cy="19" r="3"></circle>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                      </svg>
                      Chia sẻ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `;

  // Event Listeners
  container.querySelector('#btn-login')?.addEventListener('click', () => {
    navigateTo('/login');
  });
  
  container.querySelector('#lp-search-btn')?.addEventListener('click', () => {
    navigateTo('/login');
  });
  
  container.querySelector('#btn-view-all')?.addEventListener('click', () => {
    navigateTo('/login');
  });

  container.querySelector('#btn-free-trial')?.addEventListener('click', () => {
    playVideoInModal('https://youtu.be/IdHOTe8Ojeo?si=Pq23dAhxhZjiXt85');
  });

  container.querySelector('#btn-register-consult')?.addEventListener('click', () => {
    const phoneInput = container.querySelector('.lp-cta-input');
    const phone = phoneInput?.value;
    if (phone) {
      alert(`Cảm ơn bạn! Chúng tôi sẽ liên hệ với bạn qua số: ${phone}`);
      phoneInput.value = '';
    } else {
      alert('Vui lòng nhập số điện thoại!');
    }
  });

  // Home navigation link - navigate to home page
  container.querySelector('#nav-home')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('/');
  });

  // Smooth scrolling for other navigation links
  const navLinks = container.querySelectorAll('.lp-nav-link:not(#nav-home)');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      const section = container.querySelector(href);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Logo click - reload page to show home page
  container.querySelector('#lp-logo-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('/');
  });

  // Counter Animation for Stats
  const observerOptions = {
    threshold: 0.3,
    rootMargin: '0px'
  };

  const animateCounter = (element, target) => {
    const duration = 2000;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const updateCounter = () => {
      current += increment;
      if (current < target) {
        element.textContent = Math.ceil(current).toLocaleString() + '+';
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target.toLocaleString() + '+';
      }
    };

    updateCounter();
  };

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
        entry.target.classList.add('animated');
        const numbers = entry.target.querySelectorAll('.lp-stat-number');
        const targets = [5000, 60, 300, 80000];
        
        numbers.forEach((num, index) => {
          animateCounter(num, targets[index]);
        });
      }
    });
  }, observerOptions);

  const statsSection = container.querySelector('.lp-stats-section');
  if (statsSection) {
    statsObserver.observe(statsSection);
  }

  return container;
}

// Sample data for demo courses
function getSampleCourses() {
  return [
    { 
      title: 'Tổng quan môn học - Logic mệnh đề', 
      image: '/img/logic_menh_de.png', 
      price: 'Miễn phí', 
      category: 'Logic' 
    },
    { 
      title: 'Logic vị từ và ứng dụng của logic', 
      image: '/img/logic_vi_tu.png', 
      price: 'Miễn phí', 
      category: 'Logic' 
    },
    { 
      title: 'Một số phương pháp chứng minh', 
      image: '/img/chung_minh.png', 
      price: '500.000₫', 
      category: 'Chứng minh' 
    },
    { 
      title: 'Thuật toán và ứng dụng', 
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop', 
      price: 'Miễn phí', 
      category: 'Thuật toán' 
    },
    { 
      title: 'Kỹ thuật đếm cơ bản và quan hệ truy hồi', 
      image: '/img/truy_hoi.png', 
      price: 'Miễn phí', 
      category: 'Tổ hợp' 
    },
    { 
      title: 'Lý thuyết đồ thị', 
      image: '/img/do_thi.png', 
      price: '350.000₫', 
      category: 'Đồ thị' 
    }
  ];
}

// Course card template
function courseCard(c) {
  return `
    <article class="lp-course">
      <div class="lp-course-media">
        <img alt="${escapeHtml(c.title)}" src="${c.image}"/>
        <span class="lp-course-badge">${c.category}</span>
      </div>
      <div class="lp-course-body">
        <h3 class="lp-course-title">${escapeHtml(c.title)}</h3>
        <div class="lp-course-meta">
          <div class="lp-stars">★★★★★</div>
          <span class="lp-reviews">0 (0)</span>
          <span class="lp-price">${c.price}</span>
        </div>
      </div>
    </article>
  `;
}

// Utility function to escape HTML
function escapeHtml(str) {
  const entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  };
  return str.replace(/[&<>"]/g, (s) => entityMap[s]);
}
