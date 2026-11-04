export type DocumentStatus = 'PENDING' | 'PROCESSING' | 'INDEXED' | 'FAILED';

export interface CitationDto {
  documentId: string;
  fileName: string;
  chunkIndex: number;
  pageNumber: number;
  snippet: string;
  similarityScore: number;
  metadata: Record<string, unknown>;
}

export interface ChatRequestDto {
  question: string;
  documentId?: string;
  topK?: number;
  minSimilarity?: number;
  conversationId?: string;
}

export interface ChatResponseDto {
  answer: string;
  conversationId: string;
  citations: CitationDto[];
  responseTimeMs: number;
}

export interface DocumentResponseDto {
  id: string;
  fileName: string;
  fileSize: number;
  status: DocumentStatus;
  chunksCreated: number;
  message: string;
}

export interface DocumentMetadataDto {
  id: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  totalPages: number;
  totalChunks: number;
  status: DocumentStatus;
  errorMessage: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchRequestDto {
  query: string;
  documentId?: string;
  topK?: number;
  similaritySearch?: number;
}

export interface SearchResultDto {
  query: string;
  totalMatches: number;
  matches: CitationDto[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timeStamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: CitationDto[];
  responseTimeMs?: number;
  isStreaming?: boolean;
  timestamp: Date;
}
