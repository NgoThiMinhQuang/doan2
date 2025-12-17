// Generic localStorage functions
export const getFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    return [];
  }
};

export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

export const addToStorage = (key, item) => {
  const items = getFromStorage(key);
  items.push(item);
  saveToStorage(key, items);
};

export const updateInStorage = (key, id, updatedItem) => {
  const items = getFromStorage(key);
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updatedItem };
    saveToStorage(key, items);
  }
};

export const deleteFromStorage = (key, id) => {
  const items = getFromStorage(key);
  const filteredItems = items.filter(item => item.id !== id);
  saveToStorage(key, filteredItems);
};

// Specific storage keys
export const STORAGE_KEYS = {
  USERS: 'school_users',
  COURSES: 'school_courses',
  ASSIGNMENTS: 'school_assignments',
  EXAMS: 'school_exams',
  EXAM_RESULTS: 'school_exam_results',
  FORUM_POSTS: 'school_forum_posts',
  CHAT_MESSAGES: 'school_chat_messages',
  SUBMISSIONS: 'school_submissions',
  STUDENT_VIOLATIONS: 'school_student_violations',
  CHAT_BANS: 'school_chat_bans',
  LESSONS: 'school_lessons',
  LESSON_PROGRESS: 'school_lesson_progress',
  COURSE_COMPLETIONS: 'school_course_completions',
  CHAT_LAST_VIEWED: 'school_chat_last_viewed',
  ENROLLMENTS: 'school_enrollments'
};

// Initialize sample data
export const initializeSampleData = () => {
  if (getFromStorage(STORAGE_KEYS.USERS).length === 0) {
    const sampleUsers = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@school.com',
        fullName: 'System Administrator',
        role: 'admin',
        createdAt: '2024-01-01',
        isActive: true
      },
      {
        id: '2',
        username: 'teacher1',
        email: 'teacher1@school.com',
        fullName: 'Nguyễn Văn Giáo',
        role: 'teacher',
        createdAt: '2024-01-01',
        isActive: true
      },
      {
        id: '3',
        username: 'teacher2',
        email: 'teacher2@school.com',
        fullName: 'Lê Thị Dạy',
        role: 'teacher',
        createdAt: '2024-01-01',
        isActive: true
      },
      {
        id: '4',
        username: 'student1',
        email: 'student1@school.com',
        fullName: 'Ngô Thị Minh Quang',
        role: 'student',
        createdAt: '2024-01-01',
        isActive: true
      },
      {
        id: '5',
        username: 'student2',
        email: 'student2@school.com',
        fullName: 'Phạm Văn Hiểu',
        role: 'student',
        createdAt: '2024-01-01',
        isActive: true
      },
      {
        id: '6',
        username: 'student3',
        email: 'student3@school.com',
        fullName: 'Nguyễn Văn Minh',
        role: 'student',
        createdAt: '2024-01-01',
        isActive: true
      },
      {
        id: '7',
        username: 'student4',
        email: 'student4@school.com',
        fullName: 'Lê Thị Lan',
        role: 'student',
        createdAt: '2024-01-01',
        isActive: true
      },
      {
        id: '8',
        username: 'student5',
        email: 'student5@school.com',
        fullName: 'Trần Văn Đức',
        role: 'student',
        createdAt: '2024-01-01',
        isActive: true
      }
    ];
    saveToStorage(STORAGE_KEYS.USERS, sampleUsers);
  }

  // Sample courses
  if (getFromStorage(STORAGE_KEYS.COURSES).length === 0) {
    const sampleCourses = [
      {
        id: '1',
        title: 'Tổng quan & Logic mệnh đề',
        description: 'Logic cơ bản, suy luận, luật suy diễn và các phương pháp chứng minh.',
        teacherId: '1',
        teacherName: 'Bùi Thế Anh',
        students: ['4', '5'],
        lessons: [
          {
            id: '1',
            title: 'Mệnh đề, Tính đúng–sai',
            description: 'Khái niệm mệnh đề, phủ định, kéo theo, tương đương.',
            videoUrl: 'https://youtu.be/itaL_d9P1c4?si=5Pu5iIZC-apOtMC3',
            duration: 30,
            order: 1,
            createdAt: '2024-01-01',
            isActive: true
          },
          {
            id: '2',
            title: 'Phép toán logic & thứ tự ưu tiên',
            description: 'Phủ định, hội, tuyển, kéo theo, tương đương; quy ước ngoặc, thứ tự ưu tiên toán tử.',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            duration: 45,
            order: 2,
            createdAt: '2024-01-01',
            isActive: true
          }
        ],
        createdAt: '2024-01-01',
        isActive: true
      },
      {
        id: '2',
        title: 'Bài 2. Logic vị từ & ứng dụng',
        description: 'Vị từ, miền giá trị, lượng từ ∀, ∃',
        teacherId: '3',
        teacherName: 'Lê Thị Dạy',
        students: ['4', '5', '6', '8'],
        lessons: [
          {
            id: '3',
            title: 'Vị từ, miền giá trị, lượng từ ∀, ∃',
            description: 'Vị từ/hàm mệnh đề; miền giá trị; ngữ nghĩa lượng từ; ví dụ chuyển câu tự nhiên → công thức',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            duration: 40,
            order: 1,
            createdAt: '2024-01-01',
            isActive: true
          }
        ],
        createdAt: '2024-01-01',
        isActive: true
      },
      {
        id: '3',
        title: 'Bài 1: Logic mệnh đề',
        description: 'Hàng đợi/ngăn xếp, thứ tự thăm, truy vết đường đi.',
        teacherId: '2',
        teacherName: 'Nguyễn Văn Giáo',
        students: ['4', '5', '6', '7'],
        lessons: [
          {
            id: '4',
            title: 'Bài 1: Logic mệnh đề',
            description: 'Logic mệnh đề',
            videoUrl: 'https://youtu.be/IdHOTe8Ojeo?si=aee8uKVoj9Y1MRVV',
            duration: 50,
            order: 1,
            createdAt: '2024-01-01',
            isActive: true
          },
          {
            id: '5',
            title: 'Bài 2: Mệnh đề tương đương',
            description: 'Chiến lược phủ định kết luận; tìm phản ví dụ tối giản; lỗi lập luận thường gặp.',
            videoUrl: 'https://youtu.be/HL8y6wIjl7I?si=7kYyysJkeRpt5Wlo',
            duration: 60,
            order: 2,
            createdAt: '2024-01-01',
            isActive: true
          }
        ],
        createdAt: '2024-01-01',
        isActive: true
      },
      {
        id: '4',
        title: 'Số Học Đồng Dư & Mật Mã: Caesar → RSA',
        description: 'Từ đồng dư, CRT, Fermat/Euler đến mã hoá Caesar và RSA có ví dụ từng bước.',
        teacherId: '3',
        teacherName: 'Lê Thị Dạy',
        students: ['3', '4'],
        lessons: [
          {
            id: '6',
            title: 'Ước Chung Lớn Nhất & Euclid Mở Rộng',
            description: 'Tìm gcd, nghịch đảo modulo – nền tảng cho RSA.',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            duration: 45,
            order: 1,
            createdAt: '2024-01-01',
            isActive: true
          }
        ],
        createdAt: '2024-01-01',
        isActive: true
      },
      {
        id: '5',
        title: 'Kỹ thuật đếm & Quan hệ truy hồi',
        description: 'Khóa học Lý thuyết Đồ thị - Cơ bản đến ứng dụng',
        teacherId: '3',
        teacherName: 'Trần Phương Uyên',
        students: ['6', '7', '8'],
        lessons: [
          {
            id: '7',
            title: 'Nguyên lý cộng/nhân – P, A, C – Nhị thức Newton',
            description: 'Hoán vị, chỉnh hợp, tổ hợp; tam giác Pascal; công thức nhị thức và áp dụng.',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            duration: 55,
            order: 1,
            createdAt: '2024-01-01',
            isActive: true
          }
        ],
        createdAt: '2024-01-01',
        isActive: true
      }
    ];
    saveToStorage(STORAGE_KEYS.COURSES, sampleCourses);
  }

  // Sample enrollments - tạo từ students array trong courses
  if (getFromStorage(STORAGE_KEYS.ENROLLMENTS).length === 0) {
    const sampleEnrollments = [];
    const courses = getFromStorage(STORAGE_KEYS.COURSES);
    
    courses.forEach((course, courseIndex) => {
      if (course.students && Array.isArray(course.students)) {
        course.students.forEach((studentId, studentIndex) => {
          sampleEnrollments.push({
            id: `enroll_${course.id}_${studentId}`,
            studentId: studentId,
            courseId: course.id,
            teacherId: course.teacherId,
            enrolledAt: course.createdAt || new Date().toISOString()
          });
        });
      }
    });
    
    saveToStorage(STORAGE_KEYS.ENROLLMENTS, sampleEnrollments);
  }

  // Sample assignments
  if (getFromStorage(STORAGE_KEYS.ASSIGNMENTS).length === 0) {
    const sampleAssignments = [
      {
        id: '1',
        title: 'BT1: Logic mệnh đề & Bảng chân trị',
        description: 'Phân loại câu là/không là mệnh đề; viết công thức với ¬, ∧, ∨, →, ↔; lập bảng chân trị và xác định hằng đúng/hằng sai.',
        courseId: '1',
        courseName: 'Toán Rời Rạc - Logic mệnh đề',
        teacherId: '2',
        dueDate: '2024-12-31',
        maxScore: 100,
        createdAt: '2024-01-01',
        isActive: true,
        submissions: [
          { studentId: '4', score: 85, submittedAt: '2024-12-20T10:00:00' },
          { studentId: '5', score: 92, submittedAt: '2024-12-19T15:30:00' },
          { studentId: '6', score: 78, submittedAt: '2024-12-21T09:15:00' },
          { studentId: '7', score: 88, submittedAt: '2024-12-20T14:45:00' }
        ]
      },
      {
        id: '2',
        title: 'BT2: Logic vị từ – Lượng từ ∀, ∃',
        description: 'Chuyển câu tự nhiên sang công thức vị từ; phạm vi lượng từ; phủ định ∀/∃; phân biệt biến tự do/bị chặn.',
        courseId: '2',
        courseName: 'Cơ sở dữ liệu',
        teacherId: '3',
        dueDate: '2024-12-25',
        maxScore: 100,
        createdAt: '2024-01-01',
        isActive: true,
        submissions: [
          { studentId: '4', score: 90, submittedAt: '2024-12-22T11:00:00' },
          { studentId: '5', score: 87, submittedAt: '2024-12-23T16:20:00' },
          { studentId: '8', score: 82, submittedAt: '2024-12-24T10:30:00' }
        ]
      },
      {
        id: '3',
        title: 'BT3: Phương pháp chứng minh – Quy nạp',
        description: 'Bài tập chứng minh trực tiếp, phản chứng; quy nạp toán học (bước cơ sở/bước quy nạp)',
        courseId: '1',
        courseName: 'Toán Rời Rạc - Các phương pháp chứng minh',
        teacherId: '2',
        dueDate: '2024-12-28',
        maxScore: 100,
        createdAt: '2024-01-05',
        isActive: true,
        submissions: [
          { studentId: '4', score: 95, submittedAt: '2024-12-26T14:00:00' },
          { studentId: '5', score: 89, submittedAt: '2024-12-27T10:15:00' },
          { studentId: '7', score: 91, submittedAt: '2024-12-26T16:30:00' }
        ]
      },
      {
        id: '4',
        title: 'BT4: Kỹ thuật đếm & Dirichlet',
        description: 'Áp dụng nguyên lý cộng/nhân, hoán vị–chỉnh hợp–tổ hợp; nhị thức Newton; bài toán hộp bồ câu (Dirichlet).',
        courseId: '3',
        courseName: 'Toán rời rạc - Kỹ thuật đếm',
        teacherId: '2',
        dueDate: '2024-12-30',
        maxScore: 100,
        createdAt: '2024-01-10',
        isActive: true,
        submissions: [
          { studentId: '4', score: 88, submittedAt: '2024-12-28T13:00:00' },
          { studentId: '5', score: 94, submittedAt: '2024-12-29T09:45:00' },
          { studentId: '6', score: 86, submittedAt: '2024-12-28T17:20:00' },
          { studentId: '7', score: 90, submittedAt: '2024-12-29T11:30:00' }
        ]
      },
      {
        id: '5',
        title: 'BT5: Quan hệ truy hồi – Fibonacci',
        description: 'Lập mô hình truy hồi tuyến tính bậc 1–2; nghiệm tổng quát; áp dụng vào bài toán đếm; dãy Fibonacci.',
        courseId: '4',
        courseName: 'Toán rời rạc - Quan hẹ truy hồi ',
        teacherId: '2',
        dueDate: '2025-01-05',
        maxScore: 100,
        createdAt: '2024-01-15',
        isActive: true,
        submissions: [
          { studentId: '3', score: 87, submittedAt: '2025-01-03T10:00:00' },
          { studentId: '4', score: 93, submittedAt: '2025-01-02T15:30:00' }
        ]
      }
    ];
    saveToStorage(STORAGE_KEYS.ASSIGNMENTS, sampleAssignments);
  }

  // Sample exams
  if (getFromStorage(STORAGE_KEYS.EXAMS).length === 0) {
    const sampleExams = [
      {
        id: '1',
        title: 'Kiểm tra Logic mệnh đề',
        description: 'Kiểm tra kiến thức về logic mệnh đề',
        courseId: '1',
        courseName: 'Toán Rời Rạc - Logic mệnh đề',
        teacherId: '2',
        startTime: '2024-12-20T09:00:00',
        endTime: '2024-12-20T11:00:00',
        duration: 120,
        totalPoints: 100,
        questions: [
          {
            id: '1',
            question: 'Chỉ ra câu không phải là mệnh đề?',
            type: 'multiple-choice',
            options: ['Paris là thủ đô của nước Pháp', 'A là học sinh giỏi đạt học bổng', 'Cuốn sách này giá bao nhiêu tiền?', 'Tất cả hầu hết có gắng đạt điểm cao trong kỳ thi KTHP!'],
            correctAnswer: 'Cuốn sách này giá bao nhiêu tiền?',
            points: 25
          },
          {
            id: '2',
            question: 'Chỉ ra câu là vị từ',
            type: 'multiple-choice',
            options: ['Paris là thủ đô của nước Pháp', 'A là học sinh giỏi đạt học bổng', 'Cuốn sách này giá bao nhiêu tiền?', 'Tất cả hầu hết có gắng đạt điểm cao trong kỳ thi KTHP!'],
            correctAnswer: 'A là học sinh giỏi đạt học bổng',
            points: 25
          },
          {
            id: '3',
            question: 'Chỉ ra câu là mệnh đề nhân giá trị chân lý đúng',
            type: 'multiple-choice',
            options: ['Paris là thủ đô của nước Pháp', 'A là học sinh giỏi đạt học bổng', 'Tồn tại học sinh trong lớp đạt học bổng cuối năm (biết lớp có 2 xuất học bổng)', 'Tất cả học sinh trong lớp đều đạt học bổng cuối năm (biết lớp 50 sinh viên thì có 2 xuất học bổng)'],
            correctAnswer: 'Tồn tại học sinh trong lớp đạt học bổng cuối năm (biết lớp có 2 xuất học bổng)',
            points: 25
          },
          {
            id: '4',
            question: 'Chỉ ra câu là mệnh đề nhân giá trị chân lý sai',
            type: 'multiple-choice',
            options: ['A là học sinh giỏi đạt học bổng', 'Tồn tại học sinh trong lớp đạt học bổng cuối năm (biết lớp có 2 xuất học bổng)', 'Cuốn sách này giá bao nhiêu tiền?', 'Tất cả học sinh trong lớp đều đạt học bổng cuối năm (biết lớp 50 sinh viên thì có 2 xuất học bổng)'],
            correctAnswer: 'Tất cả học sinh trong lớp đều đạt học bổng cuối năm (biết lớp 50 sinh viên thì có 2 xuất học bổng)',
            points: 25
          }
        ],
        results: [
          { studentId: '4', score: 85, completedAt: '2024-12-20T10:30:00' },
          { studentId: '5', score: 95, completedAt: '2024-12-20T10:15:00' },
          { studentId: '6', score: 72, completedAt: '2024-12-20T10:45:00' },
          { studentId: '7', score: 88, completedAt: '2024-12-20T10:25:00' }
        ],
        createdAt: '2024-01-01',
        isActive: true
      },
      {
        id: '2',
        title: 'Kiểm tra Thuật toán',
        description: 'Kiểm tra kiến thức về Thuật toán',
        courseId: '2',
        courseName: 'Toán rời rạc ',
        teacherId: '3',
        startTime: '2024-12-22T14:00:00',
        endTime: '2024-12-22T16:00:00',
        duration: 120,
        totalPoints: 100,
        questions: [
          {
            id: '5',
            question: 'Dùng hàm giải mã f(p) = (p-5) mod 26 để giải mã xâu sau: "MZSLDIS"',
            type: 'multiple-choice',
            options: ['LANMAIN', 'LANMAIN', 'HUNGYEN', 'SEUTEFU'],
            correctAnswer: 'LANMAIN',
            points: 50
          },
          {
            id: '6',
            question: 'Dùng hàm giải mã f(p) = (p-9) mod 26 để giải mã xâu sau: "QDWPHNW"',
            type: 'multiple-choice',
            options: ['HUNGYEN', 'SEUTEFU', 'SEFITHY', 'LANMAIN'],
            correctAnswer: 'SEUTEFU',
            points: 50
          }
        ],
        results: [
          { studentId: '4', score: 92, completedAt: '2024-12-22T15:20:00' },
          { studentId: '5', score: 88, completedAt: '2024-12-22T15:35:00' },
          { studentId: '6', score: 78, completedAt: '2024-12-22T15:50:00' },
          { studentId: '8', score: 85, completedAt: '2024-12-22T15:25:00' }
        ],
        createdAt: '2024-01-05',
        isActive: true
      },
      {
        id: '3',
        title: 'Kỹ thuật đếm',
        description: 'Kiểm tra kiến thức Kỹ thuật đếm cơ bản',
        courseId: '3',
        courseName: 'Toán rời rạc',
        teacherId: '2',
        startTime: '2024-12-25T10:00:00',
        endTime: '2024-12-25T12:00:00',
        duration: 120,
        totalPoints: 100,
        questions: [
          {
            id: '7',
            question: 'Chúng ta cần chọn một sinh viên toàn năm thứ 3 hay năm thứ 4 đi dự một hội nghị. Hội có bao nhiêu cách chọn lựa một sinh viên nếu biết rằng có 200 sinh viên toàn học năm thứ 3 và 100 sinh viên toàn học năm thứ tư?',
            type: 'multiple-choice',
            options: ['100', '200', '300', '2000'],
            correctAnswer: '300',
            points: 33.33
          },
          {
            id: '8',
            question: 'Một sinh viên có thể chọn một đề tài từ một trong 3 danh sách các đề tài. Biết đề tài trong 3 danh sách thuộc 3 lĩnh vực khác nhau không thông giống nhau, số đề tài trong các danh sách đề tài lần lượt là 23, 15, 19. Hỏi sinh viên có bao nhiêu cách chọn một đề tài?',
            type: 'multiple-choice',
            options: ['23*15*19', '23+15+19', '1', '0'],
            correctAnswer: '23+15+19',
            points: 33.33
          },
          {
            id: '9',
            question: 'Hàm nào dùng để in ra màn hình?',
            type: 'multiple-choice',
            options: ['echo', 'print', 'console.log', 'printf'],
            correctAnswer: 'print',
            points: 33.34
          }
        ],
        results: [
          { studentId: '4', score: 89, completedAt: '2024-12-25T11:15:00' },
          { studentId: '5', score: 96, completedAt: '2024-12-25T11:05:00' },
          { studentId: '6', score: 83, completedAt: '2024-12-25T11:30:00' },
          { studentId: '7', score: 91, completedAt: '2024-12-25T11:20:00' }
        ],
        createdAt: '2024-01-10',
        isActive: true
      },
      {
        id: '4',
        title: 'Kiểm tra Lý thuyết Đồ thị',
        description: 'Kiểm tra kiến thức về Lý thuyết Đồ thị',
        courseId: '4',
        courseName: 'Toán rời rạc',
        teacherId: '2',
        startTime: '2025-01-02T09:00:00',
        endTime: '2025-01-02T10:30:00',
        duration: 90,
        totalPoints: 100,
        questions: [
          {
            id: '10',
            question: 'Trong lý thuyết đồ thị, bậc của một đỉnh là gì?',
            type: 'multiple-choice',
            options: ['Số cạnh kết nối tới đỉnh đó', 'Độ dài của đồ thị', 'Màu của đỉnh', 'Trọng số của đỉnh'],
            correctAnswer: 'Số cạnh kết nối tới đỉnh đó',
            points: 50
          },
          {
            id: '11',
            question: 'Đồ thị Hamiltonian là đồ thị có đặc điểm gì?',
            type: 'multiple-choice',
            options: ['Có chu trình đi qua mỗi cạnh đúng một lần', 'Có chu trình đi qua mỗi đỉnh đúng một lần', 'Có đường đi Euler', 'Là đồ thị liên thông'],
            correctAnswer: 'Có chu trình đi qua mỗi đỉnh đúng một lần',
            points: 50
          }
        ],
        results: [
          { studentId: '3', score: 87, completedAt: '2025-01-02T09:45:00' },
          { studentId: '4', score: 94, completedAt: '2025-01-02T09:35:00' },
          { studentId: '5', score: 90, completedAt: '2025-01-02T09:50:00' }
        ],
        createdAt: '2024-01-15',
        isActive: true
      }
    ];
    saveToStorage(STORAGE_KEYS.EXAMS, sampleExams);
  }

  // Sample chat messages
  if (getFromStorage(STORAGE_KEYS.CHAT_MESSAGES).length === 0) {
    const sampleMessages = [
      {
        id: '1',
        content: 'Chào mọi người! Hôm nay chúng ta sẽ học về Logic mệnh đề',
        senderId: '2',
        senderName: 'Nguyễn Văn Giáo',
        courseId: '1',
        courseName: 'Logic ệnh đề- bảng chân trị',
        timestamp: '2024-01-01T09:00:00',
        type: 'text'
      },
      {
        id: '2',
        content: 'Chào thầy! Em đã chuẩn bị sẵn sàng.',
        senderId: '3',
        senderName: 'Ngô Thị Minh Quang',
        courseId: '1',
        courseName: '',
        timestamp: '2024-01-01T09:05:00',
        type: 'text'
      }
    ];
    saveToStorage(STORAGE_KEYS.CHAT_MESSAGES, sampleMessages);
  }

  // Sample submissions
  if (getFromStorage(STORAGE_KEYS.SUBMISSIONS).length === 0) {
    const sampleSubmissions = [
      {
        id: '1',
        assignmentId: '1',
        studentId: '4',
        studentName: 'Ngô Thị Minh Quang',
        content: 'Bảng chân trị cho mệnh đề (P ∨ Q) ∧ ¬R:\nP | Q | R | P∨Q | ¬R | (P∨Q)∧¬R\nT | T | T |  T  | F  |   F\nT | T | F |  T  | T  |   T\nT | F | T |  T  | F  |   F\nT | F | F |  T  | T  |   T\nF | T | T |  T  | F  |   F\nF | T | F |  T  | T  |   T\nF | F | T |  F  | F  |   F\nF | F | F |  F  | T  |   F',
        submittedAt: '2024-01-05T10:30:00',
        grade: null,
        feedback: null,
        gradedAt: null,
        gradedBy: null
      },
      {
        id: '2',
        assignmentId: '1',
        studentId: '3',
        studentName: 'Học sinh khác',
        content: 'Tôi làm bài như sau:\n(P ∨ Q) ∧ ¬R là đúng khi cả hai điều kiện thỏa: P∨Q đúng và ¬R đúng (tức R sai)',
        submittedAt: '2024-01-05T11:15:00',
        grade: 8.5,
        feedback: 'Bài làm tốt, nhưng cần chi tiết hóa bảng chân trị hơn',
        gradedAt: '2024-01-05T14:00:00',
        gradedBy: '2'
      },
      {
        id: '3',
        assignmentId: '2',
        studentId: '4',
        studentName: 'Ngô Thị Minh Quang',
        content: 'Phủ định của mệnh đề "Tất cả sinh viên đều đạt học bổng" là "Tồn tại sinh viên không đạt học bổng"',
        submittedAt: '2024-01-06T09:45:00',
        grade: null,
        feedback: null,
        gradedAt: null,
        gradedBy: null
      }
    ];
    saveToStorage(STORAGE_KEYS.SUBMISSIONS, sampleSubmissions);
  }
};

// Generate unique ID
export const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Reset sample data (useful for development)
export const resetSampleData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  initializeSampleData();
};

// Helper functions for UI
export const showModal = (modal) => {
  modal.style.display = 'block';
  document.body.classList.add('modal-open');
};

export const closeAllModals = () => {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.style.display = 'none';
  });
  document.body.classList.remove('modal-open');
};

// YouTube helper functions
export const extractYouTubeId = (url) => {
  if (!url) return null;
  
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtu\.be\/([^?&]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

export const playVideoInModal = (videoUrl, courseId = null) => {
  const videoId = extractYouTubeId(videoUrl);
  
  if (!videoId) {
    alert('URL video không hợp lệ!');
    return;
  }
  
  // Close any existing video modals
  const existingVideoModal = document.getElementById('video-player-modal');
  if (existingVideoModal) {
    document.body.removeChild(existingVideoModal);
  }
  
  // Create video modal
  const modal = document.createElement('div');
  modal.id = 'video-player-modal';
  modal.className = 'modal video-modal';
  modal.style.display = 'block';
  
  modal.innerHTML = `
    <div class="modal-content video-modal-content">
      <div class="modal-header">
        <h3>Video giới thiệu khóa học</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body video-modal-body">
        <div class="video-container">
          <iframe 
            width="560" 
            height="315" 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  document.body.classList.add('modal-open');
  
  // Close modal handlers
  const closeModal = () => {
    document.body.removeChild(modal);
    document.body.classList.remove('modal-open');
  };
  
  modal.querySelector('.modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
};