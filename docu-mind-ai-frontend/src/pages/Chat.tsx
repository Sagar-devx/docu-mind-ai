import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FileText, ChevronDown, Check, Layers } from 'lucide-react';
import { useDocuments } from '../hooks/useDocuments';
import { Navbar } from '../components/Navbar';
import { ChatWindow } from '../components/ChatWindow';
import { useChat } from '../context/ChatContext';

export const Chat = () => {
  const location = useLocation();
  const state = location.state as { documentId?: string } | null;
  const { data: docs } = useDocuments();
  const { selectedDocumentId, setSelectedDocumentId, conversationId } = useChat();
  const [showDocPicker, setShowDocPicker] = useState(false);

  useEffect(() => {
    if (state?.documentId) setSelectedDocumentId(state.documentId);
  }, [state?.documentId, setSelectedDocumentId]);

  const selectedDoc = docs?.find((d) => d.id === selectedDocumentId);
  const indexedDocs = docs?.filter((d) => d.status === 'INDEXED') ?? [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Navbar
        title="AI Chat"
        subtitle={
          conversationId
            ? `Session ID: ${conversationId.slice(0, 8)}...`
            : 'Retrieval Augmented Generation with citation grounding'
        }
        actions={
          <div className="relative">
            {/* Scope Trigger */}
            <button
              onClick={() => setShowDocPicker(!showDocPicker)}
              className="flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3.5 py-1.5 bg-[#14141e] hover:bg-[#181825] border border-white/[0.08] hover:border-indigo-500/40 rounded-xl text-xs font-medium text-white transition-all shadow-sm"
            >
              <div className="w-5 h-5 rounded-md bg-indigo-500/15 flex items-center justify-center text-indigo-400 shrink-0">
                <FileText className="w-3 h-3" />
              </div>
              <span className="max-w-[90px] xs:max-w-[120px] sm:max-w-[150px] truncate">
                {selectedDoc ? selectedDoc.fileName : 'All Ingested Documents'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#71718a] shrink-0" />
            </button>

            {/* Scope Dropdown */}
            {showDocPicker && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowDocPicker(false)} />
                <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] bg-[#12121c]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60 z-40 p-2 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1.5 text-[11px] font-semibold text-[#71718a] uppercase tracking-wider">
                    Query Target Scope
                  </div>

                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedDocumentId(undefined);
                        setShowDocPicker(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                        !selectedDocumentId
                          ? 'bg-indigo-600/15 text-indigo-300 font-semibold border border-indigo-500/25'
                          : 'text-[#8e8ea6] hover:bg-white/[0.04] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        <span>All Documents ({indexedDocs.length})</span>
                      </div>
                      {!selectedDocumentId && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>

                    {indexedDocs.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => {
                          setSelectedDocumentId(d.id);
                          setShowDocPicker(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors truncate ${
                          selectedDocumentId === d.id
                            ? 'bg-indigo-600/15 text-indigo-300 font-semibold border border-indigo-500/25'
                            : 'text-[#8e8ea6] hover:bg-white/[0.04] hover:text-white'
                        }`}
                      >
                        <span className="truncate pr-2">{d.fileName}</span>
                        {selectedDocumentId === d.id && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        }
      />

      <div className="flex-1 overflow-hidden">
        <ChatWindow documentId={selectedDocumentId} />
      </div>
    </div>
  );
};
