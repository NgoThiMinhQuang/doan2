import { stateManager } from './state.js';

export function navigateTo(path) {
  window.history.pushState(null, '', path);
  stateManager.setState({ currentRoute: path });
  // The renderApp function will be called from the main app
  if (window.renderApp) {
    window.renderApp();
  }
}

export function handlePopState() {
  stateManager.setState({ currentRoute: window.location.pathname });
  // The renderApp function will be called from the main app
  if (window.renderApp) {
    window.renderApp();
  }
}
