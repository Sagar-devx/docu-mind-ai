import { useRef, type KeyboardEvent } from 'react';
import { Send, Square, Sparkles, Zap, Cpu } from 'lucide-react';

interface Props {
  onSend: (q: string) => void;
  isLoading: boolean;
  isStreamMode?: boolean;
  placeholder?: string;
}

const SUGGESTIONS = [
  'Summarize the core points of the document',
  'What are the key terms and requirements mentioned?',
  'List all action items or next steps',
];

export const ChatInput = ({
  onSend,
  isLoading,
  isStreamMode = true,
  placeholder = 'Ask anything about your documents...',
}: Props) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const val = ref.current?.value.trim();
    if (!val || isLoading) return;
    onSend(val);
    if (ref.current) {
      ref.current.value = '';
      ref.current.style.height = 'auto';
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    if (isLoading) return;
    onSend(prompt);
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="p-3 sm:p-4 border-t border-white/[0.06] bg-[#0c0c13]/90 backdrop-blur-xl">
      {/* Quick Suggestions Chips */}
      <div className="flex items-center gap-2 mb-2.5 sm:mb-3 overflow-x-auto no-scrollbar pb-1">
        <span className="text-[11px] font-semibold text-[#525266] uppercase flex items-center gap-1 shrink-0">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          Suggestions:
        </span>
        {SUGGESTIONS.map((text, i) => (
          <button
            key={i}
            onClick={() => handleSuggestionClick(text)}
            disabled={isLoading}
            className="text-xs text-[#8e8ea6] hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] rounded-full px-3 py-1 whitespace-nowrap transition-all duration-200"
          >
            {text}
          </button>
        ))}
      </div>

      {/* Input container */}
      <div className="relative flex items-end gap-2 sm:gap-3 bg-[#13131d] border border-white/[0.09] focus-within:border-indigo-500/60 rounded-2xl p-2.5 sm:p-3 transition-all shadow-inner">
        <textarea
          ref={ref}
          onKeyDown={onKey}
          placeholder={placeholder}
          rows={1}
          disabled={isLoading}
          className="flex-1 bg-transparent resize-none outline-none text-white text-xs sm:text-sm placeholder:text-[#525266] leading-relaxed max-h-36 disabled:opacity-50 py-1"
          style={{ minHeight: '24px' }}
          onInput={(e) => {
            const t = e.currentTarget;
            t.style.height = 'auto';
            t.style.height = `${Math.min(t.scrollHeight, 140)}px`;
          }}
        />

        <button
          onClick={submit}
          disabled={isLoading}
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg shadow-indigo-600/20 transition-all shrink-0"
          title="Send query"
        >
          {isLoading ? <Square className="w-4 h-4 fill-white" /> : <Send className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#525266] mt-2 px-1">
        <span className="flex items-center gap-1.5 font-medium">
          {isStreamMode ? (
            <>
              <Zap className="w-3 h-3 text-indigo-400" />
              <span>Streaming active</span>
            </>
          ) : (
            <>
              <Cpu className="w-3 h-3 text-indigo-400" />
              <span>Standard response active</span>
            </>
          )}
        </span>
        <span className="hidden sm:inline">Enter ↵ to send • Shift + Enter for new line</span>
      </div>
    </div>
  );
};
