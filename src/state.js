// Simple state management
class StateManager {
    constructor() {
      this.state = {
        user: null,
        currentRoute: window.location.pathname
      };
      this.listeners = [];
    }
  
    getState() {
      return { ...this.state };
    }
  
    setState(newState) {
      this.state = { ...this.state, ...newState };
      this.notifyListeners();
    }
  
    subscribe(listener) {
      this.listeners.push(listener);
      return () => {
        this.listeners = this.listeners.filter(l => l !== listener);
      };
    }
  
    notifyListeners() {
      this.listeners.forEach(listener => listener(this.state));
    }
  }
  
  export const stateManager = new StateManager();
  