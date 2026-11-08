// ─── Auth ───
export interface LoginRequest { username: string; password: string; }
export interface RegisterRequest { username: string; email: string; password: string; }
export interface UserDto { id: number; username: string; email: string; role: 'USER' | 'ADMIN'; }
export interface LoginResponse { accessToken: string; user: UserDto; }

// ─── Documents ───
export type DocumentStatus = 'UPLOADING' | 'PENDING' | 'PROCESSING' | 'INDEXED' | 'FAILED';

export interface DocumentResponseDto {
  id: string;
  fileName: string;
  fileSize: number;
  status: DocumentStatus;
  chunksCreated: number;
  message: string;
  userId?: number;
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

// ─── Chat ───
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

// ─── Search ───
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

// ─── Common ───
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
