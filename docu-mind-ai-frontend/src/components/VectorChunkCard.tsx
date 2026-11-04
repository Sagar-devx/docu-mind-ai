import type { CitationDto } from '../types';

interface Props { citation: CitationDto; index: number; highlight?: string; }

export const VectorChunkCard = ({ citation, index, highlight }: Props) => {
  const renderSnippet = () => {
    if (!highlight?.trim()) return <p className="text-[#a0a0b8] text-sm leading-relaxed">{citation.snippet}</p>;
    const parts = citation.snippet.split(
      new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    );
    return (
      <p className="text-[#a0a0b8] text-sm leading-relaxed">
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase()
            ? <mark key={i} className="bg-[rgba(99,102,241,0.3)] text-[#6366f1] rounded px-0.5 not-italic">{part}</mark>
            : <span key={i}>{part}</span>
        )}
      </p>
    );
  };

  return (
    <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-xl p-4 hover:border-[rgba(99,102,241,0.3)] transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-[rgba(99,102,241,0.15)] text-[#6366f1] text-xs font-bold rounded-lg flex items-center justify-center">
            #{index + 1}
          </span>
          <span className="text-[#f1f1f5] text-sm font-medium truncate max-w-[200px]">{citation.fileName}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {citation.pageNumber != null && (
            <span className="text-xs text-[#6b6b84] bg-[#13131a] px-2 py-0.5 rounded-lg">p.{citation.pageNumber}</span>
          )}
          {citation.chunkIndex != null && (
            <span className="text-xs text-[#6b6b84] bg-[#13131a] px-2 py-0.5 rounded-lg">chunk #{citation.chunkIndex}</span>
          )}
          {citation.similarityScore != null && (
            <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${
              citation.similarityScore >= 0.7
                ? 'bg-emerald-500/15 text-emerald-400'
                : citation.similarityScore >= 0.4
                ? 'bg-amber-500/15 text-amber-400'
                : 'bg-[#13131a] text-[#6b6b84]'
            }`}>
              {(citation.similarityScore * 100).toFixed(0)}%
            </span>
          )}
        </div>
      </div>
      {renderSnippet()}
    </div>
  );
};
