import api from './api';
import type { ApiResponse, DocumentMetadataDto, DocumentResponseDto } from '../types';

export const documentService = {
  uploadDocument: async (file: File): Promise<DocumentResponseDto> => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post<ApiResponse<DocumentResponseDto>>('/api/v1/documents/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
    return data.data;
  },

  uploadMultiple: async (files: File[]): Promise<DocumentResponseDto[]> => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    const { data } = await api.post<ApiResponse<DocumentResponseDto[]>>('/api/v1/documents/upload-multiple', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 180000,
    });
    return data.data;
  },

  // Use /user endpoint for user-scoped documents
  getUserDocuments: async (): Promise<DocumentMetadataDto[]> => {
    const { data } = await api.get<ApiResponse<DocumentMetadataDto[]>>('/api/v1/documents/user');
    return data.data;
  },

  getAllDocuments: async (): Promise<DocumentMetadataDto[]> => {
    const { data } = await api.get<ApiResponse<DocumentMetadataDto[]>>('/api/v1/documents');
    return data.data;
  },

  getDocumentById: async (id: string): Promise<DocumentMetadataDto> => {
    const { data } = await api.get<ApiResponse<DocumentMetadataDto>>(`/api/v1/documents/${id}`);
    return data.data;
  },

  deleteDocument: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/documents/${id}`);
  },
};
