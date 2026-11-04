import { useState } from 'react';
import { Copy, Check, Zap, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import type { ChatMessage as ChatMessageType } from '../types';
import { VectorChunkCard } from './VectorChunkCard';
import { formatMs } from '../utils/formatters';

interface Props { message: ChatMessageType; }

export const ChatMessage = ({ message }: Props) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[80%] bg-[#6366f1] text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-start gap-3 mb-2">
        <div className="w-8 h-8 bg-[rgba(99,102,241,0.15)] border border-[rgba(99,102,241,0.3)] rounded-xl flex items-center justify-center shrink-0 mt-0.5">
          <Zap className="w-4 h-4 text-[#6366f1]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-semibold text-[#6366f1]">DocuMind AI</span>
            <span className="text-xs text-[#6b6b84] bg-[rgba(99,102,241,0.08)] border border-[rgba(99,102,241,0.15)] px-2 py-0.5 rounded-full">
              ⚡ RAG Grounded
            </span>
            {message.responseTimeMs != null && (
              <span className="text-xs text-[#6b6b84] flex items-center gap-1">
                <Clock className="w-3 h-3" /> {formatMs(message.responseTimeMs)}
              </span>
            )}
          </div>
          <div className={`bg-[#1a1a24] border border-[#2a2a3a] rounded-2xl rounded-tl-sm p-4 ${message.isStreaming ? 'stream-cursor' : ''}`}>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
          {!message.isStreaming && (
            <div className="flex items-center gap-2 mt-2">
              <button onClick={copy} className="flex items-center gap-1.5 text-xs text-[#6b6b84] hover:text-[#f1f1f5] transition-colors">
                {copied
                  ? <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Copied</span></>
                  : <><Copy className="w-3 h-3" /> Copy</>
                }
              </button>
            </div>
          )}
        </div>
      </div>
      {message.citations && message.citations.length > 0 && !message.isStreaming && (
        <div className="ml-11">
          <p className="text-xs text-[#6b6b84] font-medium mb-2">Sources ({message.citations.length})</p>
          <div className="space-y-2">
            {message.citations.map((c, i) => <VectorChunkCard key={i} citation={c} index={i} />)}
          </div>
        </div>
      )}
    </div>
  );
};
