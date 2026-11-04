import { FileText, Trash2, Eye, Database } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { formatFileSize, formatDate } from '../utils/formatters';
import type { DocumentMetadataDto } from '../types';

interface Props {
  doc: DocumentMetadataDto;
  onDelete: (id: string) => void;
  onView: (doc: DocumentMetadataDto) => void;
  onChat: (doc: DocumentMetadataDto) => void;
}

export const DocumentCard = ({ doc, onDelete, onView, onChat }: Props) => (
  <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-2xl p-5 hover:border-[rgba(99,102,241,0.3)] transition-all group">
    <div className="flex items-start justify-between mb-3">
      <div className="w-11 h-11 bg-[rgba(99,102,241,0.12)] rounded-xl flex items-center justify-center">
        <FileText className="w-5 h-5 text-[#6366f1]" />
      </div>
      <StatusBadge status={doc.status} />
    </div>
    <div className="mb-3">
      <h3 className="text-[#f1f1f5] font-semibold text-sm truncate" title={doc.fileName}>{doc.fileName}</h3>
      <p className="text-[#6b6b84] text-xs mt-0.5">{formatDate(doc.createdAt)}</p>
    </div>
    <div className="grid grid-cols-2 gap-2 mb-4">
      <div className="bg-[#13131a] rounded-lg p-2">
        <div className="text-[#6b6b84] text-xs">Size</div>
        <div className="text-[#f1f1f5] text-xs font-medium">{formatFileSize(doc.fileSize)}</div>
      </div>
      <div className="bg-[#13131a] rounded-lg p-2">
        <div className="text-[#6b6b84] text-xs">Chunks</div>
        <div className="text-[#f1f1f5] text-xs font-medium">{doc.totalChunks ?? '—'}</div>
      </div>
    </div>
    <div className="flex gap-2">
      <button
        onClick={() => onView(doc)}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#13131a] hover:bg-[rgba(99,102,241,0.12)] text-[#a0a0b8] hover:text-[#6366f1] text-xs font-medium transition-all"
      >
        <Eye className="w-3.5 h-3.5" /> Details
      </button>
      <button
        onClick={() => onChat(doc)}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[rgba(99,102,241,0.12)] hover:bg-[rgba(99,102,241,0.2)] text-[#6366f1] text-xs font-medium transition-all"
      >
        <Database className="w-3.5 h-3.5" /> Chat
      </button>
      <button
        onClick={() => onDelete(doc.id)}
        className="w-9 flex items-center justify-center rounded-lg bg-[#13131a] hover:bg-red-500/15 text-[#6b6b84] hover:text-red-400 transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
);
