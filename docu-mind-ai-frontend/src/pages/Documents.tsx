import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  RefreshCw,
  Grid3X3,
  List,
  Search,
  FileText,
  Trash2,
  Eye,
  MessageSquare,
} from 'lucide-react';
import { useDocuments, useDeleteDocument } from '../hooks/useDocuments';
import { Navbar } from '../components/Navbar';
import { DocumentCard } from '../components/DocumentCard';
import { UploadModal } from '../components/UploadModal';
import { DocumentDetailsModal } from '../components/DocumentDetailsModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/StatusBadge';
import { formatFileSize, formatDate } from '../utils/formatters';
import type { DocumentMetadataDto, DocumentStatus } from '../types';
import { toast } from 'sonner';

type ViewMode = 'grid' | 'list';

export const Documents = () => {
  const { data: docs, isLoading, refetch, isFetching } = useDocuments();
  const deleteMutation = useDeleteDocument();
  const navigate = useNavigate();
  const [showUpload, setShowUpload] = useState(false);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'ALL'>('ALL');

  const filtered =
    docs?.filter((d) => {
      const matchesSearch = d.fileName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    }) ?? [];

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this document and purge its PgVector embeddings?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Document & embeddings purged from vector store');
      } catch (err) {
        toast.error((err as Error).message || 'Failed to delete document');
      }
    }
  };

  const handleChat = (doc: DocumentMetadataDto) => {
    navigate('/chat', { state: { documentId: doc.id } });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Navbar
        title="Document Vault"
        subtitle={`${docs?.length ?? 0} personal documents indexed in PgVector`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                refetch();
                toast.info('Refreshing document library...');
              }}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#8e8ea6] hover:text-white transition-colors"
              title="Refresh Vault"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Ingest Document</span>
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Filter and Control Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#12121b]/80 border border-white/[0.06] rounded-2xl p-3">
          {/* Search Field */}
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71718a]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by file name or extension..."
              className="w-full bg-[#0a0a10] border border-white/[0.08] focus:border-indigo-500/50 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-[#525266] outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#71718a] hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as DocumentStatus | 'ALL')}
              className="bg-[#0a0a10] border border-white/[0.08] text-xs font-semibold text-[#b3b3cb] rounded-xl px-3 py-2 outline-none cursor-pointer focus:border-indigo-500/50"
            >
              <option value="ALL">All Status ({docs?.length ?? 0})</option>
              <option value="INDEXED">Indexed Only</option>
              <option value="PROCESSING">Processing</option>
              <option value="UPLOADING">Uploading</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#0a0a10] border border-white/[0.08] rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-indigo-600/20 text-indigo-400 font-bold' : 'text-[#71718a] hover:text-white'
                }`}
                title="Grid View"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-indigo-600/20 text-indigo-400 font-bold' : 'text-[#71718a] hover:text-white'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <LoadingSpinner size="lg" />
            <p className="text-[#71718a] text-xs mt-3">Fetching vector metadata...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl bg-[#12121b]/40 border border-white/[0.04]">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
              <FileText className="w-7 h-7 text-indigo-400" />
            </div>
            <h3 className="text-white font-semibold text-base mb-1">No documents found</h3>
            <p className="text-[#71718a] text-xs max-w-sm mb-5">
              {searchQuery || statusFilter !== 'ALL'
                ? 'No matching files for your filter criteria. Try resetting filters.'
                : 'Your document vault is empty. Ingest your first document to start querying.'}
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
            >
              Upload Document
            </button>
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
          /* Table List View */
          <div className="rounded-2xl bg-[#12121b]/80 border border-white/[0.06] overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[11px] font-semibold text-[#71718a] uppercase tracking-wider">
                  <th className="py-3 px-4">Document</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Chunks</th>
                  <th className="py-3 px-4">Uploaded</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-xs">
                {filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-3.5 px-4 font-medium text-white max-w-[220px]">
                      <div className="flex items-center gap-2.5 truncate">
                        <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="truncate" title={doc.fileName}>
                          {doc.fileName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="py-3.5 px-4 text-[#8e8ea6]">{formatFileSize(doc.fileSize)}</td>
                    <td className="py-3.5 px-4 text-indigo-400 font-semibold">{doc.totalChunks ?? 0}</td>
                    <td className="py-3.5 px-4 text-[#71718a]">{formatDate(doc.createdAt)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleChat(doc)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 text-xs font-semibold border border-indigo-500/20 transition-all flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Chat</span>
                        </button>
                        <button
                          onClick={() => setDetailsId(doc.id)}
                          className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#71718a] hover:text-white transition-colors"
                          title="Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/15 text-[#71718a] hover:text-rose-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      {detailsId && <DocumentDetailsModal documentId={detailsId} onClose={() => setDetailsId(null)} />}
    </div>
  );
};
