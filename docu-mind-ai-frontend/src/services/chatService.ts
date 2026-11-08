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
    const token = localStorage.getItem('documind_token');
    const ctrl = new AbortController();

    fetch(`${baseUrl}/api/v1/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(req),
      signal: ctrl.signal,
    })
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.removeItem('documind_token');
          localStorage.removeItem('documind_user');
          window.location.href = '/login';
          return;
        }
        if (!res.ok) throw new Error(`Stream error: ${res.status}`);
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // Process any remaining data in buffer
            if (buffer.trim()) {
              const lines = buffer.split(/\r?\n/);
              const dataLines: string[] = [];
              for (const line of lines) {
                if (line.startsWith('data:')) {
                  dataLines.push(line.slice(5));
                }
              }
              if (dataLines.length > 0) {
                const eventData = dataLines.join('\n');
                if (eventData !== '[DONE]') onChunk(eventData);
              }
            }
            onDone();
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // Standard SSE event boundary is double newline (\n\n or \r\n\r\n)
          const events = buffer.split(/\r?\n\r?\n/);
          buffer = events.pop() ?? ''; // keep incomplete event in buffer

          for (const event of events) {
            if (!event.trim()) continue;
            const lines = event.split(/\r?\n/);
            const dataLines: string[] = [];

            for (const line of lines) {
              if (line.startsWith('data:')) {
                dataLines.push(line.slice(5));
              }
            }

            if (dataLines.length > 0) {
              const eventData = dataLines.join('\n');
              if (eventData === '[DONE]') continue;
              onChunk(eventData);
            }
          }
        }
      })
      .catch((e) => {
        if (e.name !== 'AbortError') onError(e);
      });

    return () => ctrl.abort();
  },

  searchSimilar: async (req: SearchRequestDto): Promise<SearchResultDto> => {
    const { data } = await api.post<ApiResponse<SearchResultDto>>('/api/v1/chat/search/similarity', req);
    return data.data;
  },
};
