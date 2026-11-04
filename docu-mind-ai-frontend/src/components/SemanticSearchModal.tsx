import { useState } from 'react';
import { X, Search, Loader2, SearchX } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { chatService } from '../services/chatService';
import { VectorChunkCard } from './VectorChunkCard';
import type { SearchResultDto } from '../types';

interface Props { onClose: () => void; }

export const SemanticSearchModal = ({ onClose }: Props) => {
  const [query, setQuery] = useState('');
  const [topK, setTopK] = useState(5);
  const [result, setResult] = useState<SearchResultDto | null>(null);

  const search = useMutation({
    mutationFn: () => chatService.searchSimilar({ query, topK }),
    onSuccess: setResult,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) search.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-2xl w-full max-w-2xl shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-[#2a2a3a] shrink-0">
          <div>
            <h2 className="text-[#f1f1f5] font-semibold text-lg">Semantic Vector Search</h2>
            <p className="text-[#6b6b84] text-sm">Search concepts and facts across all indexed documents</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#2a2a3a] text-[#6b6b84] hover:text-[#f1f1f5] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 shrink-0">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b84]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search concepts, clauses, technical terms..."
                className="w-full bg-[#13131a] border border-[#2a2a3a] focus:border-[rgba(99,102,241,0.5)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#f1f1f5] placeholder:text-[#6b6b84] outline-none transition-colors"
              />
            </div>
            <select
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="bg-[#13131a] border border-[#2a2a3a] rounded-xl px-3 py-2.5 text-sm text-[#f1f1f5] outline-none"
            >
              {[3, 5, 10, 20].map((n) => <option key={n} value={n}>Top {n}</option>)}
            </select>
            <button
              type="submit"
              disabled={!query.trim() || search.isPending}
              className="px-5 py-2.5 bg-[#6366f1] hover:bg-[#5254cc] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2 shrink-0"
            >
              {search.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {result ? (
            result.matches.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[#f1f1f5] text-sm font-medium">
                    {result.totalMatches} matches for <span className="text-[#6366f1]">"{result.query}"</span>
                  </p>
                </div>
                <div className="space-y-3">
                  {result.matches.map((c, i) => (
                    <VectorChunkCard key={i} citation={c} index={i} highlight={result.query} />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <SearchX className="w-10 h-10 text-[#6b6b84] mb-3" />
                <p className="text-[#f1f1f5] font-medium">No matches found</p>
                <p className="text-[#6b6b84] text-sm mt-1">Try different keywords or a broader query</p>
              </div>
            )
          ) : !search.isPending && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="w-10 h-10 text-[#6b6b84] mb-3" />
              <p className="text-[#f1f1f5] font-medium">Search your documents semantically</p>
              <p className="text-[#6b6b84] text-sm mt-1">Enter a query above to find relevant chunks</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
