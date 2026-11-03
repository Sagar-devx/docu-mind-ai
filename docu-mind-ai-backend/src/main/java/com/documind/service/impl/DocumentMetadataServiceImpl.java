package com.documind.service.impl;

import com.documind.dto.DocumentResponseDto;
import com.documind.entity.DocumentMetaData;
import com.documind.entity.DocumentStatus;
import com.documind.repository.DocumentMetadataRepository;
import com.documind.service.DocumentMetadataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentMetadataServiceImpl implements DocumentMetadataService {

    private final DocumentMetadataRepository documentMetadataRepository;
    private final JdbcTemplate jdbcTemplate;
    private final DocumentParserService parserService;
    private final DocumentIngestionService ingestionService;

    @Override
    public DocumentResponseDto uploadandProcess(MultipartFile file) {

        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
        String contentType = file.getContentType() != null ? file.getContentType().toLowerCase(): "application/octet-stream";

        DocumentMetaData documentMetaData = DocumentMetaData.builder()
                .fileName(fileName)
                .status(DocumentStatus.UPLOADING)
                .contentType(contentType)
                .fileSize(file.getSize())
                .createdAt(LocalDateTime.now())
                .build();

        documentMetaData = documentMetadataRepository.save(documentMetaData);

        List<Document> parsedDocs = parserService.parse(file);

        int chunksCreated = ingestionService.ingest(parsedDocs, documentMetaData);

        return DocumentResponseDto.builder()
                .id(documentMetaData.getId())
                .fileName(documentMetaData.getFileName())
                .fileSize(documentMetaData.getFileSize())
                .status(documentMetaData.getStatus())
                .chunksCreated(chunksCreated)
                .message("Document uploaded and processed successfully.")
                .build();
    }
}
