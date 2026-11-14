package com.documind.service.impl;

import com.documind.dto.DocumentMetadataDto;
import com.documind.dto.DocumentResponseDto;
import com.documind.entity.DocumentMetaData;
import com.documind.entity.DocumentStatus;
import com.documind.entity.Role;
import com.documind.entity.User;
import com.documind.exception.DocumentProcessingException;
import com.documind.exception.ResourceNotFoundException;
import com.documind.repository.DocumentMetadataRepository;
import com.documind.service.DocumentMetadataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.ai.document.Document;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentMetadataServiceImpl implements DocumentMetadataService {

    private final DocumentMetadataRepository documentMetadataRepository;
    private final JdbcTemplate jdbcTemplate;
    private final DocumentParserService parserService;
    private final DocumentIngestionService ingestionService;
    private final ModelMapper modelMapper;

    // Handles single file upload: creates initial metadata, parses content, and triggers vector ingestion
    @Override
    public DocumentResponseDto uploadandProcess(MultipartFile file, User user) {

        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
        String contentType = file.getContentType() != null ? file.getContentType().toLowerCase() : "application/octet-stream";

        DocumentMetaData documentMetaData = DocumentMetaData.builder()
                .fileName(fileName)
                .status(DocumentStatus.PROCESSING)
                .contentType(contentType)
                .fileSize(file.getSize())
                .createdAt(LocalDateTime.now())
                .user(user)
                .build();

        documentMetaData = documentMetadataRepository.save(documentMetaData);

        List<Document> parsedDocs;
        try {
            parsedDocs = parserService.parse(file);
        } catch (Throwable t) {
            log.error("Failed to parse document '{}': {}", fileName, t.getMessage());
            documentMetaData.setStatus(DocumentStatus.FAILED);
            documentMetaData.setErrorMessage("Failed to parse document: " + t.getMessage());
            documentMetadataRepository.save(documentMetaData);
            throw new DocumentProcessingException("Failed to parse file: " + fileName, t);
        }

        // Fire asynchronous vectorization in background thread to unblock HTTP response immediately
        ingestionService.ingestAsync(parsedDocs, documentMetaData.getId());

        return DocumentResponseDto.builder()
                .id(documentMetaData.getId())
                .fileName(documentMetaData.getFileName())
                .fileSize(documentMetaData.getFileSize())
                .status(DocumentStatus.PROCESSING)
                .chunksCreated(0)
                .userId(user.getId())
                .message("Document uploaded. Indexing in progress...")
                .build();
    }

    // Loops through multiple uploaded files and processes each one sequentially
    @Override
    public List<DocumentResponseDto> uploadMultipleDocuments(List<MultipartFile> files, User user) {

        List<DocumentResponseDto> responseDtos = new ArrayList<>();

        for (MultipartFile multipartFile : files) {
            DocumentResponseDto result = this.uploadandProcess(multipartFile, user);
            responseDtos.add(result);
        }
        return responseDtos;
    }

    // Fetches all documents sorted by newest first for admin only
    @Override
    public List<DocumentMetadataDto> getAllDocuments() {

        List<DocumentMetaData> allDocuments = documentMetadataRepository.findAllByOrderByCreatedAtDesc();

        return allDocuments.stream()
                .map(documentMetaData -> modelMapper.map(documentMetaData, DocumentMetadataDto.class))
                .toList();
    }

    @Override
    public List<DocumentMetadataDto> getAllDocumentsByUser(User user) {
        List<DocumentMetaData> documents = documentMetadataRepository.findByUserOrderByCreatedAtDesc(user);
        return documents.stream()
                .map(documentMetaData -> modelMapper.map(documentMetaData, DocumentMetadataDto.class))
                .toList();
    }

    // Fetches a single document's metadata by its ID and user
    @Override
    public DocumentMetadataDto getDocumentById(UUID id, User user) {
        DocumentMetaData documentMetaData;
        if (user.getRole() == Role.ADMIN) {
            documentMetaData = documentMetadataRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Document with given id is not found"));
        } else {
            documentMetaData = documentMetadataRepository.findByIdAndUser(id, user)
                    .orElseThrow(() -> new ResourceNotFoundException("Document with given id is not found for the user"));
        }
        return modelMapper.map(documentMetaData, DocumentMetadataDto.class);
    }

    // Atomic cleanup: deletes vector chunks from documind_vector_store first, then deletes metadata
    @Transactional
    @Override
    public void deleteDocument(UUID id, User user) {
        DocumentMetaData documentMetaData;
        if (user.getRole() == Role.ADMIN) {
            documentMetaData = documentMetadataRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Document with given id is not found"));
        } else {
            documentMetaData = documentMetadataRepository.findByIdAndUser(id, user)
                    .orElseThrow(() -> new ResourceNotFoundException("Document with given id is not found for the user"));
        }

        try {
            String deleteVectorSql = "DELETE FROM documind_vector_store WHERE metadata->>'documentId' = ?";
            int deleteCount = jdbcTemplate.update(deleteVectorSql, id.toString());
            log.info("Deleted {} vector chunks for document id {}", deleteCount, id);
        } catch (Exception e) {
            log.warn("Could not delete vectors from vector store directly: {}", e.getMessage());
        }

        documentMetadataRepository.delete(documentMetaData);
        log.info("Deleted document metadata for id: {} by userId: {}", id, user.getId());
    }
}
