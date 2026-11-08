import { useState } from 'react';
import { Search as SearchIcon, Zap, Sparkles, Filter, Layers, Sliders, Database } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { chatService } from '../services/chatService';
import { useDocuments } from '../hooks/useDocuments';
import { Navbar } from '../components/Navbar';
import { VectorChunkCard } from '../components/VectorChunkCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { SearchResultDto } from '../types';
import { toast } from 'sonner';

const SAMPLE_QUERIES = [
  'Authentication and security mechanisms',
  'Vector embeddings and chunking strategy',
  'Error handling and API response format',
];

export const Search = () => {
  const [query, setQuery] = useState('');
  const [topK, setTopK] = useState(5);
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>(undefined);
  const [minSimilarity, setMinSimilarity] = useState<number | undefined>(undefined);
  const [result, setResult] = useState<SearchResultDto | null>(null);

  const { data: docs } = useDocuments();
  const indexedDocs = docs?.filter((d) => d.status === 'INDEXED') ?? [];

  const search = useMutation({
    mutationFn: () =>
      chatService.searchSimilar({
        query,
        topK,
        documentId: selectedDocId,
        similaritySearch: minSimilarity,
      }),
    onSuccess: (data) => {
      setResult(data);
      if (data.totalMatches === 0) {
        toast.info('No relevant chunks found with sufficient similarity');
      }
    },
    onError: (err) => {
      toast.error((err as Error).message || 'Search failed');
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) search.mutate();
  };

  const handleSampleClick = (sample: string) => {
    setQuery(sample);
    search.mutate();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Navbar
        title="Semantic Search"
        subtitle="Search concepts, passages, and topics across your document library"
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Search Console Header */}
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl bg-gradient-to-b from-[#141422] to-[#101018] border border-white/[0.08] p-6 shadow-xl">
            <form onSubmit={handleSearch} className="space-y-3.5">
              <div className="relative flex items-center">
                <SearchIcon className="absolute left-4 w-5 h-5 text-indigo-400 pointer-events-none" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search documents (e.g., system architecture, project experience, requirements)..."
                  className="w-full bg-[#0a0a10] border border-white/[0.08] focus:border-indigo-500/60 rounded-2xl pl-12 pr-32 py-3.5 text-sm text-white placeholder:text-[#525266] outline-none transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!query.trim() || search.isPending}
                  className="absolute right-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/25 flex items-center gap-2"
                >
                  {search.isPending ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Search</span>
                    </>
                  )}
                </button>
              </div>

              {/* Filters Row */}
              <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
                {/* Top-K Select */}
                <div className="flex items-center gap-2 bg-[#0a0a10] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-[#8e8ea6]">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Retrieve Top:</span>
                  <select
                    value={topK}
                    onChange={(e) => setTopK(Number(e.target.value))}
                    className="bg-transparent text-white font-semibold outline-none cursor-pointer"
                  >
                    {[3, 5, 8, 10, 15].map((n) => (
                      <option key={n} value={n} className="bg-[#12121b]">
                        {n} Passages
                      </option>
                    ))}
                  </select>
                </div>

                {/* Document Filter */}
                <div className="flex items-center gap-2 bg-[#0a0a10] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-[#8e8ea6]">
                  <Filter className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Target:</span>
                  <select
                    value={selectedDocId ?? ''}
                    onChange={(e) => setSelectedDocId(e.target.value ? e.target.value : undefined)}
                    className="bg-transparent text-white font-semibold outline-none cursor-pointer max-w-[150px] truncate"
                  >
                    <option value="" className="bg-[#12121b]">
                      All Documents
                    </option>
                    {indexedDocs.map((d) => (
                      <option key={d.id} value={d.id} className="bg-[#12121b]">
                        {d.fileName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Min Match % Threshold Filter */}
                <div className="flex items-center gap-2 bg-[#0a0a10] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-[#8e8ea6]">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Min Match:</span>
                  <select
                    value={minSimilarity ?? ''}
                    onChange={(e) => setMinSimilarity(e.target.value ? Number(e.target.value) : undefined)}
                    className="bg-transparent text-white font-semibold outline-none cursor-pointer"
                  >
                    <option value="" className="bg-[#12121b]">
                      Default (40%)
                    </option>
                    <option value="0.3" className="bg-[#12121b]">
                      30% (Broad)
                    </option>
                    <option value="0.4" className="bg-[#12121b]">
                      40% (Standard)
                    </option>
                    <option value="0.5" className="bg-[#12121b]">
                      50% (Balanced)
                    </option>
                    <option value="0.6" className="bg-[#12121b]">
                      60% (Strict)
                    </option>
                    <option value="0.7" className="bg-[#12121b]">
                      70% (High Precision)
                    </option>
                  </select>
                </div>
              </div>
            </form>

            {/* Exploratory pills */}
            <div className="flex items-center gap-2 mt-4 pt-3.5 border-t border-white/[0.06] overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-semibold text-[#525266] uppercase tracking-wider shrink-0">
                Try querying:
              </span>
              {SAMPLE_QUERIES.map((sq, i) => (
                <button
                  key={i}
                  onClick={() => handleSampleClick(sq)}
                  className="text-xs text-[#71718a] hover:text-indigo-300 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] rounded-full px-3 py-1 whitespace-nowrap transition-colors"
                >
                  {sq}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Stream */}
        <div className="max-w-4xl mx-auto">
          {search.isPending ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <LoadingSpinner size="lg" />
              <p className="text-white text-sm font-semibold mt-4">Searching Document Passages</p>
              <p className="text-[#65657d] text-xs mt-1">Retrieving matching sections from your files...</p>
            </div>
          ) : result ? (
            <div className="space-y-4">
              {/* Meta row */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-white font-semibold text-sm">
                      {result.totalMatches} Matching Passage{result.totalMatches === 1 ? '' : 's'}
                    </span>
                    <span className="text-[#71718a] text-xs block">
                      Results for &ldquo;{result.query}&rdquo;
                      {minSimilarity ? ` • Filtered at ≥ ${Math.round(minSimilarity * 100)}% match` : ' • Default threshold'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chunk Cards */}
              {result.matches.length > 0 ? (
                <div className="space-y-3">
                  {result.matches.map((citation, i) => (
                    <VectorChunkCard
                      key={i}
                      citation={citation}
                      index={i}
                      highlight={result.query}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-[#12121b]/40 rounded-3xl border border-white/[0.04]">
                  <Database className="w-10 h-10 text-[#525266] mx-auto mb-3" />
                  <p className="text-white font-medium text-sm">No matching passages found</p>
                  <p className="text-[#65657d] text-xs mt-1">
                    Try phrasing your search differently or broaden your terms.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Intro State */
            <div className="text-center py-20 bg-[#12121b]/40 rounded-3xl border border-white/[0.04]">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4 text-indigo-400">
                <Database className="w-7 h-7" />
              </div>
              <h3 className="text-white font-bold text-base mb-1.5">Intelligent Library Search</h3>
              <p className="text-[#71718a] text-xs max-w-md mx-auto leading-relaxed">
                Search across all your uploaded documents using natural language to find exact matching passages, key clauses, and relevant information.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
