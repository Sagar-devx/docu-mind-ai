import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FileText, ChevronDown } from 'lucide-react';
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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Navbar
        title="AI Chat"
        subtitle={conversationId ? `Session: ${conversationId.slice(0, 8)}...` : 'RAG-powered document Q&A'}
        actions={
          <div className="relative">
            <button
              onClick={() => setShowDocPicker(!showDocPicker)}
              className="flex items-center gap-2 px-3 py-2 bg-[#1a1a24] border border-[#2a2a3a] hover:border-[rgba(99,102,241,0.4)] rounded-xl text-sm text-[#a0a0b8] transition-all"
            >
              <FileText className="w-4 h-4 text-[#6366f1]" />
              <span className="max-w-[140px] truncate">{selectedDoc?.fileName ?? 'All Documents'}</span>
              <ChevronDown className="w-3.5 h-3.5 shrink-0" />
            </button>
            {showDocPicker && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-[#1a1a24] border border-[#2a2a3a] rounded-xl shadow-2xl z-10 overflow-hidden">
                <div className="p-1">
                  <button
                    onClick={() => { setSelectedDocumentId(undefined); setShowDocPicker(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedDocumentId ? 'bg-[rgba(99,102,241,0.15)] text-[#6366f1]' : 'text-[#a0a0b8] hover:bg-[#2a2a3a]'}`}
                  >
                    All Documents
                  </button>
                  {docs?.filter((d) => d.status === 'INDEXED').map((d) => (
                    <button
                      key={d.id}
                      onClick={() => { setSelectedDocumentId(d.id); setShowDocPicker(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors ${selectedDocumentId === d.id ? 'bg-[rgba(99,102,241,0.15)] text-[#6366f1]' : 'text-[#a0a0b8] hover:bg-[#2a2a3a]'}`}
                    >
                      {d.fileName}
                    </button>
                  ))}
                </div>
              </div>
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
