import api from './api';
import type { ApiResponse, ChatRequestDto, ChatResponseDto, SearchRequestDto, SearchResultDto } from '../types';

export const chatService = {
  askQuestion: async (req: ChatRequestDto): Promise<ChatResponseDto> => {
    const { data } = await api.post<ApiResponse<ChatResponseDto>>('/api/v1/chat/query', req);
    return data.data;
  },

  streamQuestion: (
    req: ChatRequestDto,
    onChunk: (chunk: string) => void,
    onDone: () => void,
    onError: (e: Error) => void
  ): (() => void) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const ctrl = new AbortController();

    fetch(`${baseUrl}/api/v1/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify(req),
      signal: ctrl.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Stream error: ${res.status}`);
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) { onDone(); break; }
          const text = decoder.decode(value, { stream: true });
          const lines = text.split('\n');
          for (const line of lines) {
            if (line.startsWith('data:')) {
              const chunk = line.slice(5).trim();
              if (chunk && chunk !== '[DONE]') onChunk(chunk);
            } else if (line.trim() && !line.startsWith(':')) {
              onChunk(line);
            }
          }
        }
      })
      .catch((e) => { if (e.name !== 'AbortError') onError(e); });

    return () => ctrl.abort();
  },

  searchSimilar: async (req: SearchRequestDto): Promise<SearchResultDto> => {
    const { data } = await api.post<ApiResponse<SearchResultDto>>('/api/v1/chat/search/similarity', req);
    return data.data;
  },
};
