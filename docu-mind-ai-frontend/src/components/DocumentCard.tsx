import { Trash2, Eye, MessageSquare, Layers, Clock, FileText } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { formatFileSize, formatDate } from '../utils/formatters';
import type { DocumentMetadataDto } from '../types';

interface Props {
  doc: DocumentMetadataDto;
  onDelete: (id: string) => void;
  onView: (doc: DocumentMetadataDto) => void;
  onChat: (doc: DocumentMetadataDto) => void;
}

export const DocumentCard = ({ doc, onDelete, onView, onChat }: Props) => {
  const getFileStyle = (name: string) => {
    if (name.endsWith('.pdf')) {
      return {
        tag: 'PDF',
        tagCls: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        iconBg: 'bg-rose-500/10 text-rose-400',
      };
    }
    if (name.endsWith('.docx') || name.endsWith('.doc')) {
      return {
        tag: 'DOCX',
        tagCls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        iconBg: 'bg-blue-500/10 text-blue-400',
      };
    }
    return {
      tag: 'TXT',
      tagCls: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      iconBg: 'bg-amber-500/10 text-amber-400',
    };
  };

  const style = getFileStyle(doc.fileName);

  return (
    <div className="group relative bg-[#13131c]/70 hover:bg-[#161622]/90 backdrop-blur-md border border-white/[0.06] hover:border-indigo-500/40 rounded-2xl p-5 transition-all duration-300 flex flex-col justify-between shadow-lg shadow-black/20 hover:shadow-indigo-950/20">
      <div>
        {/* Top bar */}
        <div className="flex items-start justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${style.iconBg} border border-white/[0.05]`}>
              <FileText className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${style.tagCls}`}>
              {style.tag}
            </span>
          </div>
          <StatusBadge status={doc.status} />
        </div>

        {/* Title */}
        <h3
          className="text-white font-semibold text-sm line-clamp-1 mb-1 group-hover:text-indigo-300 transition-colors"
          title={doc.fileName}
        >
          {doc.fileName}
        </h3>
        <p className="text-[#65657d] text-xs flex items-center gap-1.5 mb-4">
          <Clock className="w-3 h-3" />
          {formatDate(doc.createdAt)}
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-2.5">
            <span className="text-[11px] text-[#6b6b84] block mb-0.5">Size</span>
            <span className="text-white text-xs font-semibold">{formatFileSize(doc.fileSize)}</span>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-2.5">
            <span className="text-[11px] text-[#6b6b84] block mb-0.5">Chunks</span>
            <span className="text-indigo-400 text-xs font-semibold flex items-center gap-1">
              <Layers className="w-3 h-3" />
              {doc.totalChunks ?? '0'}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-white/[0.05]">
        <button
          onClick={() => onChat(doc)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 text-xs font-semibold transition-all"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Ask Doc</span>
        </button>

        <button
          onClick={() => onView(doc)}
          title="Inspect Metadata"
          className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-[#8e8ea6] hover:text-white transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onDelete(doc.id)}
          title="Delete Document"
          className="p-2 rounded-xl bg-white/[0.03] hover:bg-rose-500/15 text-[#8e8ea6] hover:text-rose-400 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
