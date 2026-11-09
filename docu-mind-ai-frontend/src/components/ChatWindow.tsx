import { useEffect, useRef, useState } from 'react';
import { Trash2, Sparkles, Database, Zap, Cpu } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useChatActions } from '../hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

interface Props {
  documentId?: string;
  prefillQuestion?: string;
  onPrefillUsed?: () => void;
}

export const ChatWindow = ({ documentId, prefillQuestion, onPrefillUsed }: Props) => {
  const { messages, clearChat, isStreaming, setSelectedDocumentId } = useChat();
  const { sendMessage } = useChatActions();
  const [useStream, setUseStream] = useState<boolean>(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (documentId) setSelectedDocumentId(documentId);
  }, [documentId, setSelectedDocumentId]);

  useEffect(() => {
    if (prefillQuestion) {
      sendMessage(prefillQuestion, useStream);
      onPrefillUsed?.();
    }
  }, [prefillQuestion]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-[#09090d]">
      {/* Session status banner & Mode toggle */}
      <div className="flex items-center justify-between gap-2 px-3 sm:px-6 py-2 border-b border-white/[0.06] bg-[#0d0d15]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-xs text-[#8e8ea6] font-medium truncate">
            {messages.length} msg{messages.length === 1 ? '' : 's'}
          </span>
          {documentId && (
            <span className="text-[10px] sm:text-[11px] text-indigo-400 bg-indigo-500/10 px-1.5 sm:px-2 py-0.5 rounded-md border border-indigo-500/20 truncate max-w-[100px] sm:max-w-none">
              Scoped
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Stream / Standard Mode Switcher */}
          <div className="flex items-center bg-[#13131e] border border-white/[0.08] p-0.5 rounded-xl">
            <button
              onClick={() => setUseStream(true)}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                useStream
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-[#71718a] hover:text-white'
              }`}
              title="Stream word-by-word with Server-Sent Events"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Stream (SSE)</span>
              <span className="sm:hidden">Stream</span>
            </button>
            <button
              onClick={() => setUseStream(false)}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                !useStream
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-[#71718a] hover:text-white'
              }`}
              title="Synchronous Q&A with full citations and response latency"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Standard</span>
            </button>
          </div>

          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="flex items-center gap-1.5 text-xs text-[#71718a] hover:text-rose-400 transition-colors ml-1 p-1"
              title="Clear current conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Context</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto py-12">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-600/30">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#09090d] flex items-center justify-center">
                <Database className="w-2.5 h-2.5 text-white" />
              </div>
            </div>

            <h3 className="text-white font-bold text-lg mb-2">AI Document Assistant</h3>
            <p className="text-[#71718a] text-xs leading-relaxed mb-6">
              Ask questions about your uploaded documents or explore any topic. Get clear, accurate responses backed by verified source citations.
            </p>

            <div className="grid grid-cols-2 gap-3 w-full text-left">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="text-xs font-semibold text-white mb-0.5">Source Citations</div>
                <div className="text-[11px] text-[#71718a]">Direct document references and page numbers.</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="text-xs font-semibold text-white mb-0.5">Flexible Modes</div>
                <div className="text-[11px] text-[#71718a]">Switch anytime between streaming and standard responses.</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {messages.map((m) => (
              <ChatMessage key={m.id} message={m} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <ChatInput
        onSend={(q) => sendMessage(q, useStream)}
        isLoading={isStreaming}
        isStreamMode={useStream}
      />
    </div>
  );
};
