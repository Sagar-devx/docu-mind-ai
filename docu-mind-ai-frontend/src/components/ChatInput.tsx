import { useRef, type KeyboardEvent } from 'react';
import { Send, Square } from 'lucide-react';

interface Props { onSend: (q: string) => void; isLoading: boolean; placeholder?: string; }

export const ChatInput = ({ onSend, isLoading, placeholder = 'Ask anything about your documents...' }: Props) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const val = ref.current?.value.trim();
    if (!val || isLoading) return;
    onSend(val);
    if (ref.current) ref.current.value = '';
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  return (
    <div className="p-4 border-t border-[#2a2a3a] bg-[#13131a]">
      <div className="flex gap-3 items-end bg-[#1a1a24] border border-[#2a2a3a] focus-within:border-[rgba(99,102,241,0.5)] rounded-2xl p-3 transition-colors">
        <textarea
          ref={ref}
          onKeyDown={onKey}
          placeholder={placeholder}
          rows={1}
          disabled={isLoading}
          className="flex-1 bg-transparent resize-none outline-none text-[#f1f1f5] text-sm placeholder:text-[#6b6b84] leading-relaxed max-h-32 disabled:opacity-50"
          style={{ minHeight: '24px' }}
          onInput={(e) => {
            const t = e.currentTarget;
            t.style.height = 'auto';
            t.style.height = Math.min(t.scrollHeight, 128) + 'px';
          }}
        />
        <button
          onClick={submit}
          disabled={isLoading}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#6366f1] hover:bg-[#5254cc] disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors shrink-0"
        >
          {isLoading ? <Square className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
        </button>
      </div>
      <p className="text-[#6b6b84] text-xs mt-2 text-center">Enter to send · Shift+Enter for new line</p>
    </div>
  );
};
