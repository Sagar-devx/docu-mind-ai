package com.documind.service;

import com.documind.dto.DocumentMetadataDto;
import com.documind.dto.DocumentResponseDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface DocumentMetadataService {

    DocumentResponseDto uploadandProcess(MultipartFile file);
    List<DocumentResponseDto> uploadMultipleDocuments(List<MultipartFile> files);
    List<DocumentMetadataDto> getAllDocuments();
    DocumentMetadataDto getDocumentById(UUID id);
    void deleteDocument(UUID id);
}
