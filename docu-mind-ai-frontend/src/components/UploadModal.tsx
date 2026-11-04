import { useState, useCallback } from 'react';
import { X, Upload, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useUploadMultiple } from '../hooks/useDocuments';
import { formatFileSize } from '../utils/formatters';
import type { DocumentResponseDto } from '../types';

interface Props { onClose: () => void; }

export const UploadModal = ({ onClose }: Props) => {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<DocumentResponseDto[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const upload = useUploadMultiple();

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const arr = Array.from(newFiles).filter(
      (f) => f.type === 'application/pdf' || f.type.includes('word') || f.type.includes('text')
    );
    setFiles((prev) => [...prev, ...arr]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  const handleSubmit = async () => {
    if (!files.length) return;
    const res = await upload.mutateAsync(files);
    setResults(res);
    setFiles([]);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#2a2a3a]">
          <div>
            <h2 className="text-[#f1f1f5] font-semibold text-lg">Upload Documents</h2>
            <p className="text-[#6b6b84] text-sm">PDF, DOCX, TXT — max 25MB each</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#2a2a3a] text-[#6b6b84] hover:text-[#f1f1f5] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {results.length === 0 ? (
            <>
              <label
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#6366f1] bg-[rgba(99,102,241,0.08)]'
                    : 'border-[#2a2a3a] hover:border-[rgba(99,102,241,0.4)] hover:bg-[rgba(99,102,241,0.04)]'
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.doc,.txt"
                  className="hidden"
                  onChange={(e) => addFiles(e.target.files)}
                />
                <Upload className="w-10 h-10 text-[#6366f1] mb-3" />
                <p className="text-[#f1f1f5] font-medium text-sm">Drag & drop files here</p>
                <p className="text-[#6b6b84] text-xs mt-1">or click to browse</p>
              </label>

              {files.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 bg-[#13131a] rounded-xl p-3">
                      <FileText className="w-4 h-4 text-[#6366f1] shrink-0" />
                      <span className="text-[#f1f1f5] text-sm flex-1 truncate">{f.name}</span>
                      <span className="text-[#6b6b84] text-xs">{formatFileSize(f.size)}</span>
                      <button
                        onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                        className="text-[#6b6b84] hover:text-red-400 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!files.length || upload.isPending}
                className="w-full py-3 rounded-xl bg-[#6366f1] hover:bg-[#5254cc] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                {upload.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                ) : (
                  <><Upload className="w-4 h-4" /> Upload {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''}` : 'Files'}</>
                )}
              </button>
              {upload.isError && (
                <p className="text-red-400 text-sm text-center">{(upload.error as Error).message}</p>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <h3 className="text-[#f1f1f5] font-medium text-sm">Upload Results</h3>
              {results.map((r) => (
                <div key={r.id} className="flex items-center gap-3 bg-[#13131a] rounded-xl p-3">
                  {r.status === 'FAILED'
                    ? <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    : <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-[#f1f1f5] text-sm truncate">{r.fileName}</p>
                    <p className="text-[#6b6b84] text-xs">{r.message} · {r.chunksCreated ?? 0} chunks</p>
                  </div>
                </div>
              ))}
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-[#6366f1] hover:bg-[#5254cc] text-white font-medium text-sm transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
