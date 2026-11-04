import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, Grid3X3, List, Search } from 'lucide-react';
import { useDocuments, useDeleteDocument } from '../hooks/useDocuments';
import { Navbar } from '../components/Navbar';
import { DocumentCard } from '../components/DocumentCard';
import { UploadModal } from '../components/UploadModal';
import { DocumentDetailsModal } from '../components/DocumentDetailsModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/StatusBadge';
import { formatFileSize, formatDate } from '../utils/formatters';
import type { DocumentMetadataDto, DocumentStatus } from '../types';

type ViewMode = 'grid' | 'list';

export const Documents = () => {
  const { data: docs, isLoading, refetch } = useDocuments();
  const deleteMutation = useDeleteDocument();
  const navigate = useNavigate();
  const [showUpload, setShowUpload] = useState(false);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'ALL'>('ALL');

  const filtered = docs?.filter((d) => {
    const matchesSearch = d.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) ?? [];

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleChat = (doc: DocumentMetadataDto) => navigate('/chat', { state: { documentId: doc.id } });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Navbar
        title="Documents"
        subtitle={`${docs?.length ?? 0} documents in your library`}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => refetch()} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#1a1a24] text-[#6b6b84] hover:text-[#f1f1f5] transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#6366f1] hover:bg-[#5254cc] text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" /> Upload
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b84]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full bg-[#1a1a24] border border-[#2a2a3a] focus:border-[rgba(99,102,241,0.5)] rounded-xl pl-10 pr-4 py-2 text-sm text-[#f1f1f5] placeholder:text-[#6b6b84] outline-none transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as DocumentStatus | 'ALL')}
            className="bg-[#1a1a24] border border-[#2a2a3a] rounded-xl px-3 py-2 text-sm text-[#f1f1f5] outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="INDEXED">Indexed</option>
            <option value="PROCESSING">Processing</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
          <div className="flex bg-[#1a1a24] border border-[#2a2a3a] rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`w-8 h-7 flex items-center justify-center rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[rgba(99,102,241,0.2)] text-[#6366f1]' : 'text-[#6b6b84]'}`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`w-8 h-7 flex items-center justify-center rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[rgba(99,102,241,0.2)] text-[#6366f1]' : 'text-[#6b6b84]'}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-[rgba(99,102,241,0.08)] rounded-2xl flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-[#6b6b84]" />
            </div>
            <p className="text-[#f1f1f5] font-semibold mb-1">No documents found</p>
            <p className="text-[#6b6b84] text-sm">
              {searchQuery || statusFilter !== 'ALL' ? 'Try adjusting your filters' : 'Upload your first document to get started'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onDelete={handleDelete}
                onView={(d) => setDetailsId(d.id)}
                onChat={handleChat}
              />
            ))}
          </div>
        ) : (
          <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-2xl divide-y divide-[#2a2a3a]">
            {filtered.map((doc) => (
              <div key={doc.id} className="flex items-center gap-4 p-4 hover:bg-[#1f1f2e] transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-[#f1f1f5] text-sm font-medium truncate">{doc.fileName}</p>
                  <p className="text-[#6b6b84] text-xs mt-0.5">{formatFileSize(doc.fileSize)} · {formatDate(doc.createdAt)}</p>
                </div>
                <StatusBadge status={doc.status} />
                <div className="flex items-center gap-2">
                  <button onClick={() => setDetailsId(doc.id)} className="px-3 py-1.5 text-xs bg-[#13131a] hover:bg-[rgba(99,102,241,0.12)] text-[#a0a0b8] hover:text-[#6366f1] rounded-lg transition-all">Details</button>
                  <button onClick={() => handleChat(doc)} className="px-3 py-1.5 text-xs bg-[rgba(99,102,241,0.12)] hover:bg-[rgba(99,102,241,0.2)] text-[#6366f1] rounded-lg transition-all">Chat</button>
                  <button onClick={() => handleDelete(doc.id)} className="px-3 py-1.5 text-xs bg-[#13131a] hover:bg-red-500/15 text-[#6b6b84] hover:text-red-400 rounded-lg transition-all">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      {detailsId && <DocumentDetailsModal documentId={detailsId} onClose={() => setDetailsId(null)} />}
    </div>
  );
};
