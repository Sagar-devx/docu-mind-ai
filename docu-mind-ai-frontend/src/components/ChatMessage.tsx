import { useState } from 'react';
import { Copy, Check, Sparkles, Clock, Layers, FileText, ChevronDown, ChevronUp, Brain, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import type { ChatMessage as ChatMessageType } from '../types';
import { VectorChunkCard } from './VectorChunkCard';
import { formatMs } from '../utils/formatters';
import { useDocuments } from '../hooks/useDocuments';

interface Props {
  message: ChatMessageType;
}

// Custom Pre / Code block with header and dedicated Copy button
const CodePreBlock = ({ children }: any) => {
  const [copied, setCopied] = useState(false);

  const codeElement = children?.props;
  const className = codeElement?.className || '';
  const match = /language-(\w+)/.exec(className);
  const language = match ? match[1] : '';

  const extractText = (node: any): string => {
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(extractText).join('');
    if (node?.props?.children) return extractText(node.props.children);
    return '';
  };

  const codeString = extractText(children);

  const handleCopy = async () => {
    if (!codeString) return;
    await navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0c0c14] shadow-xl">
      <div className="flex items-center justify-between px-4 py-2 bg-white/[0.03] border-b border-white/[0.06] text-xs">
        <span className="font-mono text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">
          {language || 'Code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] text-[#8e8ea6] hover:text-white transition-colors py-0.5 px-2 rounded-md hover:bg-white/[0.05]"
          title="Copy snippet"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <pre className="!m-0 !p-0 !border-none !bg-transparent">{children}</pre>
    </div>
  );
};

export const ChatMessage = ({ message }: Props) => {
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(true);
  const { data: docs } = useDocuments();

  const copy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-6 animate-in fade-in duration-200">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-5 py-3.5 text-sm leading-relaxed shadow-lg shadow-indigo-600/20 font-medium">
          {message.content}
        </div>
      </div>
    );
  }

  // Thinking State
  if (!message.content) {
    return (
      <div className="mb-6 animate-in fade-in duration-300">
        <div className="flex items-start gap-3.5">
          <div className="relative mt-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-4 h-4 text-white animate-spin [animation-duration:4s]" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-indigo-400 rounded-full animate-ping" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-white tracking-tight">DocuMind AI</span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                <Brain className="w-3 h-3 text-indigo-400 animate-pulse" />
                <span>Thinking</span>
              </span>
            </div>

            <div className="rounded-2xl rounded-tl-sm bg-[#12121b]/90 border border-indigo-500/30 p-4 shadow-xl max-w-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent animate-pulse" />

              <div className="relative flex items-center gap-3">
                <div className="flex gap-1.5 items-center">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                </div>
                <div className="text-xs text-[#8e8ea6] font-medium tracking-wide">
                  Formulating response...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Intelligent Context-Aware Classification
  const isRagGrounded = (() => {
    if (!message.content) return false;
    const text = message.content.toLowerCase();

    // 1. Explicit document grounding phrases
    const groundingPhrases = [
      'based on the resume',
      'based on the document',
      'based on your document',
      'based on the provided',
      'according to the document',
      'according to the resume',
      'according to the provided',
      'in the uploaded document',
      'in the provided document',
      'from the document',
      'from your resume',
      'in your resume',
      'in your profile',
      'in the file',
      '[source:',
      'sagar sharma',
    ];
    if (groundingPhrases.some((phrase) => text.includes(phrase))) {
      return true;
    }

    // 2. Check if content explicitly references any uploaded document's name
    if (docs && docs.length > 0) {
      const mentionsDoc = docs.some((d) => {
        const baseName = d.fileName.toLowerCase().replace(/\.[^/.]+$/, '');
        return baseName.length > 3 && text.includes(baseName);
      });
      if (mentionsDoc) return true;
    }

    // 3. Clear general programming, algorithm, math or conversational queries
    const generalIndicators = [
      'here is a clean',
      'here is a simple',
      'here is a java',
      'here is a python',
      'public class primechecker',
      'is a prime number',
      'time complexity',
      'space complexity',
      'public static boolean',
      'def is_prime',
    ];
    if (generalIndicators.some((ind) => text.includes(ind))) {
      return false;
    }

    // 4. If citations exist with high similarity and not a generic query
    if (message.citations && message.citations.length > 0) {
      const highestScore = Math.max(...message.citations.map((c) => c.similarityScore ?? 0));
      return highestScore >= 0.65;
    }

    return false;
  })();

  const hasCitations = isRagGrounded && message.citations && message.citations.length > 0;

  return (
    <div className="mb-8 animate-in fade-in duration-300">
      <div className="flex items-start gap-3.5 mb-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20 mt-1">
          <Sparkles className="w-4 h-4 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header Metadata */}
          <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
            <span className="text-xs font-bold text-white tracking-tight">DocuMind AI</span>

            {/* Context-Aware Badge */}
            {isRagGrounded ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>RAG Grounded</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>General AI</span>
              </span>
            )}

            {message.responseTimeMs != null && (
              <span className="text-[11px] text-[#71718a] flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-[#525266]" />
                {formatMs(message.responseTimeMs)}
              </span>
            )}
          </div>

          {/* AI Response Bubble */}
          <div
            className={`rounded-2xl rounded-tl-sm bg-[#12121b]/90 border border-white/[0.07] p-5 shadow-xl ${
              message.isStreaming ? 'stream-cursor' : ''
            }`}
          >
            <div className="prose text-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeHighlight, rehypeKatex]}
                components={{
                  pre: CodePreBlock,
                  h2: ({ children }) => (
                    <h2 className="text-lg font-bold text-white mt-6 mb-3 flex items-center gap-2 border-b border-white/[0.08] pb-2">
                      <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500 shrink-0" />
                      <span>{children}</span>
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-bold text-white mt-5 mb-2.5 flex items-center gap-2 border-b border-white/[0.06] pb-1.5">
                      <span className="w-1.5 h-4 rounded-full bg-indigo-500 shrink-0" />
                      <span>{children}</span>
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-sm font-semibold text-indigo-300 mt-4 mb-2 flex items-center gap-1.5">
                      <span className="w-1 h-3 rounded-full bg-indigo-400 shrink-0" />
                      <span>{children}</span>
                    </h4>
                  ),
                  hr: () => (
                    <div className="my-6 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
                  ),
                  blockquote: ({ children }) => (
                    <div className="my-4 rounded-2xl border-l-4 border-indigo-500 bg-indigo-500/10 p-4 text-sm text-[#e0e0f0] shadow-lg backdrop-blur-sm">
                      {children}
                    </div>
                  ),
                  a: ({ href, children }) => {
                    const isExternal = href?.startsWith('http') || href?.startsWith('//');
                    return (
                      <a
                        href={href}
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                        className="inline-flex items-center gap-1 text-indigo-300 hover:text-white bg-indigo-500/15 hover:bg-indigo-500/25 px-2 py-0.5 rounded-md border border-indigo-500/30 transition-all text-xs font-medium no-underline"
                      >
                        <span>{children}</span>
                        {isExternal && <ExternalLink className="w-3 h-3 opacity-70" />}
                      </a>
                    );
                  },
                  table: ({ children }) => (
                    <div className="my-4 w-full overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0c0c14] shadow-lg">
                      <table className="w-full text-left border-collapse text-xs">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-white/[0.04] border-b border-white/[0.08] text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">
                      {children}
                    </thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className="divide-y divide-white/[0.04]">{children}</tbody>
                  ),
                  tr: ({ children }) => (
                    <tr className="hover:bg-white/[0.02] transition-colors">{children}</tr>
                  ),
                  th: ({ children }) => (
                    <th className="py-3 px-4 text-left font-semibold whitespace-nowrap">{children}</th>
                  ),
                  td: ({ children }) => (
                    <td className="py-3 px-4 text-[#dcdceb] leading-relaxed align-top">{children}</td>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Action Row */}
          {!message.isStreaming && (
            <div className="flex items-center justify-between gap-3 mt-2 px-1">
              <button
                onClick={copy}
                className="flex items-center gap-1.5 text-xs text-[#71718a] hover:text-white transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copied to clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Answer</span>
                  </>
                )}
              </button>

              {hasCitations && (
                <button
                  onClick={() => setShowSources(!showSources)}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>
                    {showSources ? 'Hide Sources' : 'Show Sources'} ({message.citations!.length})
                  </span>
                  {showSources ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sources Accordion */}
      {hasCitations && !message.isStreaming && showSources && (
        <div className="ml-11 mt-3 space-y-2 border-l-2 border-indigo-500/30 pl-4">
          <div className="text-[11px] font-semibold text-[#71718a] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <FileText className="w-3 h-3 text-indigo-400" />
            Verified Ingestion Citations ({message.citations!.length})
          </div>
          {message.citations!.map((c, i) => (
            <VectorChunkCard key={i} citation={c} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};
