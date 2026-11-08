import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  MessageSquare,
  Search,
  Upload,
  ArrowRight,
  Zap,
  CheckCircle2,
  Sparkles,
  Database,
  Layers,
} from 'lucide-react';
import { useDocuments } from '../hooks/useDocuments';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/StatusBadge';
import { UploadModal } from '../components/UploadModal';
import { formatFileSize, formatDate } from '../utils/formatters';

export const Dashboard = () => {
  const { data: docs, isLoading } = useDocuments();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showUpload, setShowUpload] = useState(false);

  const indexed = docs?.filter((d) => d.status === 'INDEXED').length ?? 0;
  const processing =
    docs?.filter((d) => d.status === 'PROCESSING' || d.status === 'PENDING' || d.status === 'UPLOADING').length ?? 0;
  const failed = docs?.filter((d) => d.status === 'FAILED').length ?? 0;
  const totalChunks = docs?.reduce((sum, d) => sum + (d.totalChunks ?? 0), 0) ?? 0;
  const totalBytes = docs?.reduce((sum, d) => sum + (d.fileSize ?? 0), 0) ?? 0;

  const stats = [
    {
      label: 'Total Documents',
      value: docs?.length ?? 0,
      sub: `${formatFileSize(totalBytes)} total storage`,
      icon: FileText,
      gradient: 'from-indigo-500/20 to-indigo-600/5',
      border: 'border-indigo-500/20',
      iconColor: 'text-indigo-400',
    },
    {
      label: 'Indexed & Ready',
      value: indexed,
      sub: 'Available for immediate Q&A',
      icon: CheckCircle2,
      gradient: 'from-emerald-500/20 to-emerald-600/5',
      border: 'border-emerald-500/20',
      iconColor: 'text-emerald-400',
    },
    {
      label: 'Indexed Segments',
      value: totalChunks,
      sub: 'Processed text segments',
      icon: Zap,
      gradient: 'from-amber-500/20 to-amber-600/5',
      border: 'border-amber-500/20',
      iconColor: 'text-amber-400',
    },
    {
      label: 'Processing Queue',
      value: processing,
      sub: failed > 0 ? `${failed} file(s) failed` : 'All documents up to date',
      icon: Layers,
      gradient: 'from-purple-500/20 to-purple-600/5',
      border: 'border-purple-500/20',
      iconColor: 'text-purple-400',
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Navbar
        title="Dashboard"
        subtitle="Intelligent document search and analysis overview"
        actions={
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Hero Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#171728] via-[#151522] to-[#12121b] border border-white/[0.08] p-7 shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Document Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
              Welcome back, <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">{user?.username || 'User'}</span> 👋
            </h2>
            <p className="text-[#8e8ea6] text-sm leading-relaxed mb-6">
              You have <strong className="text-white font-medium">{indexed} document{indexed === 1 ? '' : 's'}</strong> ready for analysis. Ask questions in natural language, extract key findings, or search seamlessly across your knowledge base.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate('/chat')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#09090d] hover:bg-zinc-200 text-xs font-bold transition-all shadow-md"
              >
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <span>Start Chat</span>
              </button>
              <button
                onClick={() => navigate('/search')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-white border border-white/[0.08] text-xs font-semibold transition-all"
              >
                <Search className="w-4 h-4 text-indigo-400" />
                <span>Search Passages</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, sub, icon: Icon, gradient, border, iconColor }) => (
            <div
              key={label}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-b ${gradient} bg-[#13131c]/60 backdrop-blur-md border ${border} p-5 shadow-lg shadow-black/20`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-[#71718a] uppercase tracking-wider">{label}</span>
                <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {isLoading ? <LoadingSpinner size="sm" /> : value}
              </div>
              <div className="text-xs text-[#71718a]">{sub}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Upload Documents',
              desc: 'Add PDF, DOCX or TXT files to expand your personal knowledge base.',
              icon: Upload,
              action: () => setShowUpload(true),
              btnText: 'Upload Files',
            },
            {
              title: 'AI Document Chat',
              desc: 'Ask questions and receive instant answers with verified citations.',
              icon: MessageSquare,
              action: () => navigate('/chat'),
              btnText: 'Start Session',
            },
            {
              title: 'Semantic Search',
              desc: 'Search concepts, terms, and passages across all uploaded documents.',
              icon: Database,
              action: () => navigate('/search'),
              btnText: 'Search Library',
            },
          ].map(({ title, desc, icon: Icon, action, btnText }) => (
            <div
              key={title}
              onClick={action}
              className="group cursor-pointer rounded-2xl bg-[#13131c]/60 hover:bg-[#161624]/90 border border-white/[0.06] hover:border-indigo-500/40 p-5 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-indigo-300 transition-colors">
                  {title}
                </h3>
                <p className="text-[#71718a] text-xs leading-relaxed mb-4">{desc}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                <span>{btnText}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        {/* Recent Documents Section */}
        <div className="rounded-2xl bg-[#12121b]/80 border border-white/[0.06] shadow-xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
            <div>
              <h2 className="text-white font-semibold text-sm">Recent Documents</h2>
              <p className="text-[#65657d] text-xs">Recently ingested files and indexing status</p>
            </div>
            <button
              onClick={() => navigate('/documents')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>View Library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="md" />
              </div>
            ) : !docs || docs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-[#62627a]" />
                </div>
                <p className="text-white font-medium text-sm">No documents found</p>
                <p className="text-[#65657d] text-xs mt-1 max-w-xs">
                  Upload your first PDF or document to generate PgVector embeddings.
                </p>
                <button
                  onClick={() => setShowUpload(true)}
                  className="mt-4 px-3.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-all"
                >
                  Upload Now
                </button>
              </div>
            ) : (
              docs.slice(0, 5).map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between gap-4 p-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate" title={doc.fileName}>
                        {doc.fileName}
                      </p>
                      <p className="text-[#65657d] text-xs flex items-center gap-1.5 mt-0.5">
                        <span>{formatFileSize(doc.fileSize)}</span>
                        <span>•</span>
                        <span>{formatDate(doc.createdAt)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-[#71718a] hidden sm:inline">
                      {doc.totalChunks ?? 0} chunks
                    </span>
                    <StatusBadge status={doc.status} />
                    <button
                      onClick={() => navigate('/chat', { state: { documentId: doc.id } })}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-indigo-600/20 text-[#8e8ea6] hover:text-indigo-300 text-xs font-semibold border border-white/[0.06] transition-all"
                    >
                      Chat
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </div>
  );
};
