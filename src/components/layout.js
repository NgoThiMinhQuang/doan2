import { renderSidebar } from './sidebar.js';
import { renderHeader } from './header.js';

export function renderLayout(content) {
  const container = document.createElement('div');
  container.className = 'layout';

  const sidebar = renderSidebar();
  const header = renderHeader();
  const mainContent = document.createElement('div');
  mainContent.className = 'main-content';

  const main = document.createElement('main');
  main.className = 'content';
  main.appendChild(content);

  mainContent.appendChild(header);
  mainContent.appendChild(main);

  container.appendChild(sidebar);
  container.appendChild(mainContent);

  return container;
}
