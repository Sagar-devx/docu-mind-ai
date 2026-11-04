import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, MessageSquare, Search, TrendingUp, Upload, ArrowRight, Zap } from 'lucide-react';
import { useDocuments } from '../hooks/useDocuments';
import { Navbar } from '../components/Navbar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/StatusBadge';
import { UploadModal } from '../components/UploadModal';
import { formatFileSize, formatDate } from '../utils/formatters';

export const Dashboard = () => {
  const { data: docs, isLoading } = useDocuments();
  const navigate = useNavigate();
  const [showUpload, setShowUpload] = useState(false);

  const indexed = docs?.filter((d) => d.status === 'INDEXED').length ?? 0;
  const processing = docs?.filter((d) => d.status === 'PROCESSING' || d.status === 'PENDING').length ?? 0;
  const failed = docs?.filter((d) => d.status === 'FAILED').length ?? 0;
  const totalChunks = docs?.reduce((sum, d) => sum + (d.totalChunks ?? 0), 0) ?? 0;

  const stats = [
    { label: 'Total Documents', value: docs?.length ?? 0, icon: FileText, color: 'text-[#6366f1]', bg: 'bg-[rgba(99,102,241,0.12)]' },
    { label: 'Indexed',         value: indexed,           icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Vector Chunks',   value: totalChunks,       icon: Zap,         color: 'text-amber-400',   bg: 'bg-amber-500/10' },
    { label: 'Processing',      value: processing,         icon: Search,      color: 'text-blue-400',    bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Navbar
        title="Dashboard"
        subtitle="Your document intelligence overview"
        actions={
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#6366f1] hover:bg-[#5254cc] text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Upload className="w-4 h-4" /> Upload
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-[#1a1a24] border border-[#2a2a3a] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[#6b6b84] text-sm">{label}</span>
                <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
              </div>
              <div className="text-[#f1f1f5] text-3xl font-bold">
                {isLoading ? <LoadingSpinner size="sm" /> : value}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Upload Documents', desc: 'Add PDF, DOCX or TXT files', icon: Upload, action: () => setShowUpload(true), primary: true },
            { label: 'Start Chat',       desc: 'Ask questions about your docs', icon: MessageSquare, action: () => navigate('/chat') },
            { label: 'Semantic Search',  desc: 'Search vector embeddings', icon: Search, action: () => navigate('/search') },
          ].map(({ label, desc, icon: Icon, action, primary }) => (
            <button
              key={label}
              onClick={action}
              className={`flex items-center gap-4 p-5 rounded-2xl border text-left transition-all group ${
                primary
                  ? 'bg-[rgba(99,102,241,0.1)] border-[rgba(99,102,241,0.3)] hover:bg-[rgba(99,102,241,0.15)]'
                  : 'bg-[#1a1a24] border-[#2a2a3a] hover:border-[rgba(99,102,241,0.3)]'
              }`}
            >
              <div className="w-11 h-11 bg-[rgba(99,102,241,0.15)] rounded-xl flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-[#6366f1]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[#f1f1f5] font-semibold text-sm">{label}</div>
                <div className="text-[#6b6b84] text-xs mt-0.5">{desc}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#6b6b84] group-hover:text-[#6366f1] transition-colors" />
            </button>
          ))}
        </div>

        {/* Recent Documents */}
        <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-2xl">
          <div className="flex items-center justify-between p-5 border-b border-[#2a2a3a]">
            <h2 className="text-[#f1f1f5] font-semibold">Recent Documents</h2>
            <button
              onClick={() => navigate('/documents')}
              className="text-xs text-[#6366f1] hover:text-[#5254cc] flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-[#2a2a3a]">
            {isLoading ? (
              <div className="flex justify-center py-8"><LoadingSpinner /></div>
            ) : docs?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-10 h-10 text-[#6b6b84] mb-3" />
                <p className="text-[#f1f1f5] font-medium">No documents yet</p>
                <p className="text-[#6b6b84] text-sm mt-1">Upload your first document to get started</p>
              </div>
            ) : docs?.slice(0, 5).map((doc) => (
              <div key={doc.id} className="flex items-center gap-4 p-4 hover:bg-[#1f1f2e] transition-colors">
                <div className="w-9 h-9 bg-[rgba(99,102,241,0.12)] rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-[#6366f1]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#f1f1f5] text-sm font-medium truncate">{doc.fileName}</p>
                  <p className="text-[#6b6b84] text-xs">{formatFileSize(doc.fileSize)} · {formatDate(doc.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#6b6b84] text-xs">{doc.totalChunks ?? 0} chunks</span>
                  <StatusBadge status={doc.status} />
                </div>
              </div>
            ))}
          </div>
          {failed > 0 && (
            <div className="p-4 border-t border-[#2a2a3a] bg-red-500/5 rounded-b-2xl">
              <p className="text-red-400 text-sm text-center">{failed} document{failed > 1 ? 's' : ''} failed to process</p>
            </div>
          )}
        </div>
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </div>
  );
};
