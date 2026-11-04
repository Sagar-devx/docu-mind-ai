import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../services/documentService';
import type { DocumentMetadataDto } from '../types';

export const useDocuments = () =>
  useQuery<DocumentMetadataDto[]>({
    queryKey: ['documents'],
    queryFn: documentService.getAllDocuments,
    staleTime: 30000,
  });

export const useDocument = (id: string) =>
  useQuery<DocumentMetadataDto>({
    queryKey: ['document', id],
    queryFn: () => documentService.getDocumentById(id),
    enabled: !!id,
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
