package com.documind.service;

import com.documind.dto.DocumentMetadataDto;
import com.documind.dto.DocumentResponseDto;
import com.documind.entity.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface DocumentMetadataService {

    DocumentResponseDto uploadandProcess(MultipartFile file, User user);
    List<DocumentResponseDto> uploadMultipleDocuments(List<MultipartFile> files, User user);
    List<DocumentMetadataDto> getAllDocuments();
    List<DocumentMetadataDto> getAllDocumentsByUser(User user);
    DocumentMetadataDto getDocumentById(UUID id, User user);
    void deleteDocument(UUID id, User user);
}
