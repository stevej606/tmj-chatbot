import { useState, useCallback, useRef } from 'react';
import { streamChat } from '../utils/api';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hello! I'm your TMJ Health Assistant. I can help you understand temporomandibular joint disorders, their symptoms, causes, and management options.\n\nFeel free to ask me about jaw pain, clicking or popping sounds, headaches related to TMJ, exercises, or when to seek professional help.\n\nHow can I help you today?",
};

export function useChat() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);

  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim() || isStreaming) return;

      setError(null);

      const userMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: text.trim(),
      };

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);

      // Build conversation history for the API (exclude welcome message)
      const history = [...messages.filter((m) => m.id !== 'welcome'), userMessage].map(
        ({ role, content }) => ({ role, content })
      );

      const controller = await streamChat(
        history,
        (chunk) => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            updated[updated.length - 1] = { ...last, content: last.content + chunk };
            return updated;
          });
        },
        () => {
          setIsStreaming(false);
        },
        (errorMsg) => {
          setError(errorMsg);
          setIsStreaming(false);
          // Remove empty assistant message on error
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last.role === 'assistant' && !last.content) {
              return prev.slice(0, -1);
            }
            return prev;
          });
        }
      );

      controllerRef.current = controller;
    },
    [messages, isStreaming]
  );

  const clearError = useCallback(() => setError(null), []);

  return { messages, isStreaming, error, sendMessage, clearError };
}
