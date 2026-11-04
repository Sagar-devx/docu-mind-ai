import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ChatMessage, CitationDto } from '../types';

interface ChatContextType {
  messages: ChatMessage[];
  conversationId: string | undefined;
  selectedDocumentId: string | undefined;
  setSelectedDocumentId: (id: string | undefined) => void;
  addUserMessage: (content: string) => string;
  addAssistantMessage: (id: string, content: string, citations?: CitationDto[], responseTimeMs?: number) => void;
  updateStreamingMessage: (id: string, content: string) => void;
  finalizeStreamingMessage: (id: string, citations?: CitationDto[]) => void;
  setConversationId: (id: string) => void;
  clearChat: () => void;
  isStreaming: boolean;
  setIsStreaming: (v: boolean) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | undefined>();
  const [isStreaming, setIsStreaming] = useState(false);

  const addUserMessage = useCallback((content: string) => {
    const id = uuidv4();
    setMessages((prev) => [...prev, { id, role: 'user', content, timestamp: new Date() }]);
    return id;
  }, []);

  const addAssistantMessage = useCallback((id: string, content: string, citations?: CitationDto[], responseTimeMs?: number) => {
    setMessages((prev) => [...prev, { id, role: 'assistant', content, citations, responseTimeMs, timestamp: new Date() }]);
  }, []);

  const updateStreamingMessage = useCallback((id: string, content: string) => {
    setMessages((prev) => {
      const existing = prev.find((m) => m.id === id);
      if (existing) return prev.map((m) => m.id === id ? { ...m, content, isStreaming: true } : m);
      return [...prev, { id, role: 'assistant', content, isStreaming: true, timestamp: new Date() }];
    });
  }, []);

  const finalizeStreamingMessage = useCallback((id: string, citations?: CitationDto[]) => {
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, isStreaming: false, citations } : m));
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationId(undefined);
  }, []);

  return (
    <ChatContext.Provider value={{
      messages, conversationId, selectedDocumentId, setSelectedDocumentId,
      addUserMessage, addAssistantMessage, updateStreamingMessage, finalizeStreamingMessage,
      setConversationId, clearChat, isStreaming, setIsStreaming,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
};
