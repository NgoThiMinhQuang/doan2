
import { stateManager } from './state.js';
import { getFromStorage, STORAGE_KEYS } from './utils.js';

const DEMO_USERS = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@school.com',
      fullName: 'Administrator',
      role: 'admin',
      avatar: '',
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
  
export  function login(username, password) {
    // First check from localStorage (updated data)
    const users = getFromStorage(STORAGE_KEYS.USERS);
    const foundUser = users.find(u => u.username === username);
    
    // If not found in storage, check DEMO_USERS (for first time)
    const userToCheck = foundUser || DEMO_USERS.find(u => u.username === username);
  
    if (userToCheck && password === '123456') {
      // Check if user account is active
      if (!userToCheck.isActive) {
        return false; // Account is deactivated
      }
      stateManager.setState({ user: userToCheck });
      localStorage.setItem('currentUser', JSON.stringify(userToCheck));
      return true;
    }
    return false;
  }
  
export  function logout() {
    stateManager.setState({ user: null });
    localStorage.removeItem('currentUser');
  }
  
export  function isAuthenticated() {
    return !!stateManager.getState().user;
  }
  
  // Initialize auth state from localStorage
export  function initAuth() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      // Check if the user is still active by getting from localStorage
      const users = getFromStorage(STORAGE_KEYS.USERS);
      const currentUser = users.find(u => u.id === user.id);
      
      if (currentUser && currentUser.isActive) {
        stateManager.setState({ user: currentUser });
      } else {
        // User is deactivated or not found
        localStorage.removeItem('currentUser');
      }
    }
  }