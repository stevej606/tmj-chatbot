import React from 'react';
import { createRoot } from 'react-dom/client';
import { setBaseUrl } from './utils/api';
import ChatWidget from './components/ChatWidget';

// Collect all CSS into a string at build time via ?inline imports
import indexCss from './index.css?inline';
import appCss from './App.css?inline';
import headerCss from './components/Header.css?inline';
import chatWindowCss from './components/ChatWindow.css?inline';
import messageListCss from './components/MessageList.css?inline';
import messageCss from './components/Message.css?inline';
import messageInputCss from './components/MessageInput.css?inline';
import typingIndicatorCss from './components/TypingIndicator.css?inline';
import chatWidgetCss from './components/ChatWidget.css?inline';

const allCss = [
  indexCss,
  appCss,
  headerCss,
  chatWindowCss,
  messageListCss,
  messageCss,
  messageInputCss,
  typingIndicatorCss,
  chatWidgetCss,
].join('\n');

function init() {
  // Read config from the script tag
  const scriptTag = document.currentScript || document.querySelector('script[data-tmj-server]');
  const serverUrl = scriptTag?.getAttribute('data-tmj-server') || '';

  if (serverUrl) {
    setBaseUrl(serverUrl);
  }

  // Create host element
  const host = document.createElement('div');
  host.id = 'tmj-chat-widget';
  document.body.appendChild(host);

  // Use shadow DOM to isolate styles
  const shadow = host.attachShadow({ mode: 'open' });

  // Inject styles
  const style = document.createElement('style');
  style.textContent = allCss;
  shadow.appendChild(style);

  // Also load Inter font in the main document
  if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=Inter"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }

  // Mount React
  const mountPoint = document.createElement('div');
  shadow.appendChild(mountPoint);

  const root = createRoot(mountPoint);
  root.render(
    <React.StrictMode>
      <ChatWidget />
    </React.StrictMode>
  );
}

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
