import { useChat } from '../hooks/useChat';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import './ChatWindow.css';

function ChatWindow() {
  const { messages, isStreaming, error, sendMessage, clearError } = useChat();

  return (
    <div className="chat-window">
      <MessageList messages={messages} isStreaming={isStreaming} />
      {error && (
        <div className="chat-error">
          <span>{error}</span>
          <button onClick={clearError} className="chat-error-dismiss">&times;</button>
        </div>
      )}
      <MessageInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
}

export default ChatWindow;
