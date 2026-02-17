import { useState } from 'react';
import Header from './Header';
import ChatWindow from './ChatWindow';

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <div className="tmj-widget-overlay">
          <div className="tmj-widget-container">
            <div className="tmj-widget-header-wrap">
              <Header />
              <button
                className="tmj-widget-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <ChatWindow />
          </div>
        </div>
      )}

      <button
        className={`tmj-widget-bubble ${isOpen ? 'tmj-widget-bubble--hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open TMJ Health Chat"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </>
  );
}

export default ChatWidget;
