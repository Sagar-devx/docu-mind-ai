import { useState, useCallback } from 'react';
import { X, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useUploadMultiple } from '../hooks/useDocuments';
import { formatFileSize } from '../utils/formatters';
import type { DocumentResponseDto } from '../types';
import { toast } from 'sonner';

interface Props {
  onClose: () => void;
}

export const UploadModal = ({ onClose }: Props) => {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<DocumentResponseDto[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const upload = useUploadMultiple();

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const allowed = Array.from(newFiles).filter((f) => {
      const ext = f.name.toLowerCase();
      return (
        ext.endsWith('.pdf') ||
        ext.endsWith('.docx') ||
        ext.endsWith('.doc') ||
        ext.endsWith('.txt') ||
        f.type === 'application/pdf'
      );
    });

    if (allowed.length < newFiles.length) {
      toast.warning('Some files were skipped. Only PDF, DOCX, and TXT are supported.');
    }

    setFiles((prev) => [...prev, ...allowed]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  const handleSubmit = async () => {
    if (!files.length) return;
    try {
      const res = await upload.mutateAsync(files);
      setResults(res);
      setFiles([]);
      toast.success(`${res.length} file(s) uploaded! Processing & indexing in background.`);
    } catch (err) {
      toast.error((err as Error).message || 'Failed to upload documents');
    }
  };

  const getFileBadge = (name: string) => {
    if (name.endsWith('.pdf')) return { label: 'PDF', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
    if (name.endsWith('.docx') || name.endsWith('.doc')) return { label: 'DOCX', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
    return { label: 'TXT', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#12121c]/95 border border-white/[0.08] rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-2xl shadow-indigo-950/40 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center shrink-0">
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-base sm:text-lg">Ingest Documents</h2>
              <p className="text-[#71718a] text-[11px] sm:text-xs">PDF, DOCX, TXT — Up to 25MB per file</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-[#8e8ea6] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {results.length === 0 ? (
            <>
              {/* Drop Area */}
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-5 sm:p-8 cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]'
                    : 'border-white/[0.09] hover:border-indigo-500/40 hover:bg-white/[0.02]'
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.doc,.txt"
                  className="hidden"
                  onChange={(e) => addFiles(e.target.files)}
                />
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6 text-indigo-400 animate-bounce duration-1000" />
                </div>
                <p className="text-white font-medium text-sm">
                  Click to browse <span className="text-[#71718a] font-normal">or drag & drop files</span>
                </p>
                <p className="text-[#62627a] text-xs mt-1">
                  Automatic token chunking (700) + Gemini Embeddings (768d)
                </p>
              </label>

              {/* Selected Files Preview */}
              {files.length > 0 && (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  <div className="text-xs font-semibold text-[#71718a] uppercase tracking-wider px-1">
                    Queued for Indexing ({files.length})
                  </div>
                  {files.map((f, i) => {
                    const badge = getFileBadge(f.name);
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 hover:border-white/[0.1] transition-colors"
                      >
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.color}`}>
                          {badge.label}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{f.name}</p>
                          <p className="text-[#71718a] text-xs">{formatFileSize(f.size)}</p>
                        </div>
                        <button
                          onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                          className="p-1 rounded-lg hover:bg-rose-500/15 text-[#71718a] hover:text-rose-400 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleSubmit}
                disabled={!files.length || upload.isPending}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                {upload.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Processing & Indexing Embeddings...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>
                      Index {files.length > 0 ? `${files.length} Document${files.length > 1 ? 's' : ''}` : 'Files'}
                    </span>
                  </>
                )}
              </button>
            </>
          ) : (
            /* Results View */
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Processing Complete
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {results.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl p-3"
                  >
                    {r.status === 'FAILED' ? (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{r.fileName}</p>
                      <p className="text-[#71718a] text-xs">
                        {r.status} · {r.chunksCreated ?? 0} vector chunks
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white font-medium text-sm transition-colors"
              >
                Close & View Documents
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
