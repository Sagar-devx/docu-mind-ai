import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../services/documentService';
import { useAuth } from '../context/AuthContext';
import type { DocumentMetadataDto } from '../types';

export const useDocuments = () => {
  const { user } = useAuth();
  return useQuery<DocumentMetadataDto[]>({
    queryKey: ['documents', user?.id],
    queryFn: () => documentService.getUserDocuments(),
    enabled: !!user,
    staleTime: 5000,
    refetchInterval: (query) => {
      const hasActive = query.state.data?.some(
        (d) => d.status === 'PROCESSING' || d.status === 'UPLOADING' || d.status === 'PENDING'
      );
      return hasActive ? 2500 : false;
    },
  });
};

export const useDocument = (id: string) =>
  useQuery<DocumentMetadataDto>({
    queryKey: ['document', id],
    queryFn: () => documentService.getDocumentById(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      return s === 'PROCESSING' || s === 'UPLOADING' || s === 'PENDING' ? 2500 : false;
    },
  });

export const useUploadDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => documentService.uploadDocument(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  });
};

export const useUploadMultiple = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) => documentService.uploadMultiple(files),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  });
};

export const useDeleteDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentService.deleteDocument(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  });
};
