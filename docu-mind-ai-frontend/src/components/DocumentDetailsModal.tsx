import { X, FileText, Clock, Hash, Layers, AlertCircle } from 'lucide-react';
import { useDocument } from '../hooks/useDocuments';
import { StatusBadge } from './StatusBadge';
import { LoadingSpinner } from './LoadingSpinner';
import { formatFileSize, formatDate } from '../utils/formatters';

interface Props { documentId: string; onClose: () => void; }

export const DocumentDetailsModal = ({ documentId, onClose }: Props) => {
  const { data: doc, isLoading } = useDocument(documentId);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#2a2a3a]">
          <h2 className="text-[#f1f1f5] font-semibold text-lg">Document Details</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#2a2a3a] text-[#6b6b84] hover:text-[#f1f1f5] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-8"><LoadingSpinner /></div>
          ) : doc ? (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[rgba(99,102,241,0.12)] rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-[#6366f1]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[#f1f1f5] font-semibold truncate">{doc.fileName}</h3>
                  <p className="text-[#6b6b84] text-sm">{doc.contentType}</p>
                </div>
                <StatusBadge status={doc.status} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Hash,     label: 'File Size',    value: formatFileSize(doc.fileSize) },
                  { icon: Layers,   label: 'Total Chunks', value: doc.totalChunks ?? '—' },
                  { icon: FileText, label: 'Total Pages',  value: doc.totalPages ?? '—' },
                  { icon: Clock,    label: 'Created',      value: formatDate(doc.createdAt) },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-[#13131a] rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-3.5 h-3.5 text-[#6b6b84]" />
                      <span className="text-[#6b6b84] text-xs">{label}</span>
                    </div>
                    <div className="text-[#f1f1f5] text-sm font-medium">{String(value)}</div>
                  </div>
                ))}
              </div>
              {doc.errorMessage && (
                <div className="flex gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{doc.errorMessage}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[#6b6b84] text-center py-8">Document not found</p>
          )}
        </div>
      </div>
    </div>
  );
};
