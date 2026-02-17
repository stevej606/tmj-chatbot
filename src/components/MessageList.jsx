import { useEffect, useRef } from 'react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import './MessageList.css';

function MessageList({ messages, isStreaming }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Show typing indicator only when streaming and the last assistant message is still empty
  const lastMessage = messages[messages.length - 1];
  const showTyping = isStreaming && lastMessage?.role === 'assistant' && !lastMessage.content;

  return (
    <div className="message-list">
      <div className="message-list-inner">
        {messages.map((message) => {
          // Don't render empty assistant messages (typing state)
          if (message.role === 'assistant' && !message.content) return null;
          return <Message key={message.id} message={message} />;
        })}
        {showTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

export default MessageList;
