import { useEffect, useRef } from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useChatActions } from '../hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

interface Props { documentId?: string; prefillQuestion?: string; onPrefillUsed?: () => void; }

export const ChatWindow = ({ documentId, prefillQuestion, onPrefillUsed }: Props) => {
  const { messages, clearChat, isStreaming, setSelectedDocumentId } = useChat();
  const { sendMessage } = useChatActions();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (documentId) setSelectedDocumentId(documentId); }, [documentId, setSelectedDocumentId]);

  useEffect(() => {
    if (prefillQuestion) { sendMessage(prefillQuestion); onPrefillUsed?.(); }
  }, [prefillQuestion]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#2a2a3a]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-[#6b6b84]">{messages.length} messages</span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 text-xs text-[#6b6b84] hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-[rgba(99,102,241,0.12)] rounded-2xl flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-[#6366f1]" />
            </div>
            <h3 className="text-[#f1f1f5] font-semibold mb-2">Start a conversation</h3>
            <p className="text-[#6b6b84] text-sm max-w-sm">
              Ask questions about your indexed documents. Responses are grounded in your document content.
            </p>
          </div>
        ) : (
          messages.map((m) => <ChatMessage key={m.id} message={m} />)
        )}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={(q) => sendMessage(q, true)} isLoading={isStreaming} />
    </div>
  );
};
