import { X, FileText, Clock, Hash, Layers, AlertCircle, Database, CheckCircle2 } from 'lucide-react';
import { useDocument } from '../hooks/useDocuments';
import { StatusBadge } from './StatusBadge';
import { LoadingSpinner } from './LoadingSpinner';
import { formatFileSize, formatDate } from '../utils/formatters';

interface Props {
  documentId: string;
  onClose: () => void;
}

export const DocumentDetailsModal = ({ documentId, onClose }: Props) => {
  const { data: doc, isLoading } = useDocument(documentId);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#12121c]/95 border border-white/[0.08] rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-2xl shadow-indigo-950/40 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center shrink-0">
              <Database className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-base sm:text-lg">Document Telemetry</h2>
              <p className="text-[#71718a] text-[11px] sm:text-xs">Vector storage & ingestion metadata</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-[#8e8ea6] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="md" />
            </div>
          ) : doc ? (
            <div className="space-y-5">
              {/* File Title Card */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm truncate" title={doc.fileName}>
                    {doc.fileName}
                  </h3>
                  <p className="text-[#71718a] text-xs mt-0.5 truncate">{doc.contentType || 'application/octet-stream'}</p>
                </div>
                <StatusBadge status={doc.status} />
              </div>

              {/* Grid of stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Hash,     label: 'File Size',    value: formatFileSize(doc.fileSize) },
                  { icon: Layers,   label: 'Vector Chunks', value: `${doc.totalChunks ?? 0} embedded` },
                  { icon: FileText, label: 'Total Pages',  value: doc.totalPages ? `${doc.totalPages} pages` : 'Single stream' },
                  { icon: Clock,    label: 'Indexed At',   value: formatDate(doc.createdAt) },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3.5">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-[#71718a] text-xs font-medium">{label}</span>
                    </div>
                    <div className="text-white text-sm font-semibold">{value}</div>
                  </div>
                ))}
              </div>

              {/* Vector specs info */}
              <div className="p-3.5 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20 flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="text-xs text-[#a0a0b8]">
                  <span className="text-emerald-300 font-semibold">Ready for RAG:</span> HNSW cosine index enabled with multi-tenant isolation.
                </div>
              </div>

              {/* Error if present */}
              {doc.errorMessage && (
                <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-rose-300 text-xs leading-relaxed">{doc.errorMessage}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[#71718a] text-center py-8 text-sm">Document not found</p>
          )}
        </div>
      </div>
    </div>
  );
};
