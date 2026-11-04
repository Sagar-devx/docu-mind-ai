import { useState } from 'react';
import { Search as SearchIcon, Zap } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { chatService } from '../services/chatService';
import { Navbar } from '../components/Navbar';
import { VectorChunkCard } from '../components/VectorChunkCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { SearchResultDto } from '../types';

export const Search = () => {
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
    <div className="flex flex-col h-full overflow-hidden">
      <Navbar title="Semantic Search" subtitle="Search vector embeddings across all indexed documents" />

      <div className="flex-1 overflow-y-auto p-6">
        {/* Search Box */}
        <div className="max-w-3xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b84]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for concepts, facts, clauses, technical terms..."
                className="w-full bg-[#1a1a24] border border-[#2a2a3a] focus:border-[rgba(99,102,241,0.5)] rounded-2xl pl-12 pr-4 py-3.5 text-sm text-[#f1f1f5] placeholder:text-[#6b6b84] outline-none transition-colors"
              />
            </div>
            <select
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="bg-[#1a1a24] border border-[#2a2a3a] rounded-2xl px-4 py-3.5 text-sm text-[#f1f1f5] outline-none"
            >
              {[3, 5, 10, 20].map((n) => <option key={n} value={n}>Top {n}</option>)}
            </select>
            <button
              type="submit"
              disabled={!query.trim() || search.isPending}
              className="px-6 py-3.5 bg-[#6366f1] hover:bg-[#5254cc] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-2xl transition-colors flex items-center gap-2 shrink-0"
            >
              {search.isPending
                ? <LoadingSpinner size="sm" />
                : <SearchIcon className="w-4 h-4" />
              }
              Search
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="max-w-3xl mx-auto">
          {search.isPending ? (
            <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
          ) : result ? (
            <>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-[rgba(99,102,241,0.15)] rounded-xl flex items-center justify-center">
                  <Zap className="w-4 h-4 text-[#6366f1]" />
                </div>
                <div>
                  <span className="text-[#f1f1f5] font-semibold">{result.totalMatches} matches</span>
                  <span className="text-[#6b6b84] text-sm"> for "<span className="text-[#6366f1]">{result.query}</span>"</span>
                </div>
              </div>
              {result.matches.length > 0 ? (
                <div className="space-y-3">
                  {result.matches.map((c, i) => (
                    <VectorChunkCard key={i} citation={c} index={i} highlight={result.query} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <SearchIcon className="w-10 h-10 text-[#6b6b84] mx-auto mb-3" />
                  <p className="text-[#f1f1f5] font-medium">No results found</p>
                  <p className="text-[#6b6b84] text-sm mt-1">Try different keywords or a broader query</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-[rgba(99,102,241,0.08)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="w-8 h-8 text-[#6b6b84]" />
              </div>
              <h3 className="text-[#f1f1f5] font-semibold mb-2">Semantic Vector Search</h3>
              <p className="text-[#6b6b84] text-sm max-w-sm mx-auto">
                Search using natural language. Our AI finds semantically similar content across all your indexed documents.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
