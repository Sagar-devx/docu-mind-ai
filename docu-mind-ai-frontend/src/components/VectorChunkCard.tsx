import type { CitationDto } from '../types';
import { Layers, FileText } from 'lucide-react';

interface Props {
  citation: CitationDto;
  index: number;
  highlight?: string;
}

export const VectorChunkCard = ({ citation, index, highlight }: Props) => {
  const renderSnippet = () => {
    if (!highlight?.trim()) {
      return <p className="text-[#a0a0b8] text-xs leading-relaxed font-sans">{citation.snippet}</p>;
    }
    const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = citation.snippet.split(new RegExp(`(${escaped})`, 'gi'));
    return (
      <p className="text-[#a0a0b8] text-xs leading-relaxed font-sans">
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-indigo-500/30 text-indigo-300 font-medium rounded px-1 py-0.5">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </p>
    );
  };

  const getScoreBadge = (score?: number) => {
    if (score == null) return null;
    const pct = Math.round(score * 100);
    let colorCls = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (pct < 50) colorCls = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    if (pct < 30) colorCls = 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';

    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${colorCls}`}>
        {pct}% Match
      </span>
    );
  };

  return (
    <div className="bg-[#12121b]/80 border border-white/[0.06] hover:border-indigo-500/30 rounded-xl p-3.5 transition-all duration-200">
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0 max-w-full sm:max-w-[60%]">
          <span className="w-5 h-5 rounded-md bg-indigo-500/15 text-indigo-400 text-[11px] font-bold flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <div className="flex items-center gap-1.5 text-white text-xs font-semibold truncate">
            <FileText className="w-3.5 h-3.5 text-[#71718a] shrink-0" />
            <span className="truncate">{citation.fileName}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
          {citation.pageNumber != null && (
            <span className="text-[10px] text-[#71718a] bg-white/[0.04] px-1.5 py-0.5 rounded-md border border-white/[0.04]">
              Page {citation.pageNumber}
            </span>
          )}
          {citation.chunkIndex != null && (
            <span className="text-[10px] text-[#71718a] bg-white/[0.04] px-1.5 py-0.5 rounded-md border border-white/[0.04] flex items-center gap-1">
              <Layers className="w-2.5 h-2.5" />
              #{citation.chunkIndex}
            </span>
          )}
          {getScoreBadge(citation.similarityScore)}
        </div>
      </div>

      <div className="bg-[#0b0b10] rounded-lg p-2.5 border border-white/[0.03]">
        {renderSnippet()}
      </div>
    </div>
  );
};
