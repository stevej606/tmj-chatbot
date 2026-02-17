import './Message.css';

function Message({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`message ${isUser ? 'message--user' : 'message--assistant'}`}>
      {!isUser && (
        <div className="message-avatar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
      )}
      <div className={`message-bubble ${isUser ? 'message-bubble--user' : 'message-bubble--assistant'}`}>
        <p className="message-text">{message.content}</p>
      </div>
    </div>
  );
}

export default Message;
