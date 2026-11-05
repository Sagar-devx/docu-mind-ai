package com.documind.controller;

import com.documind.dto.ApiResponse;
import com.documind.dto.DocumentMetadataDto;
import com.documind.dto.DocumentResponseDto;
import com.documind.entity.User;
import com.documind.service.DocumentMetadataService;
import com.documind.service.impl.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/documents")
@Tag(
        name = "Document Management",
        description = "Endpoints for uploading, listing, and managing documents and their vector embeddings."
)
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentMetadataService documentService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Upload and index a single document",
            description = "Uploads a supported document (PDF, DOCX, TXT), extracts text chunks, generates vector embeddings, and stores them in PgVector."
    )
    public ResponseEntity<ApiResponse<DocumentResponseDto>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();
        DocumentResponseDto response = documentService.uploadandProcess(file, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<DocumentResponseDto>builder()
                        .success(true)
                        .message("Document uploaded and processed successfully.")
                        .data(response)
                        .timeStamp(LocalDateTime.now())
                        .build());
    }

    @PostMapping(value = "/upload-multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Upload and index multiple documents in batch",
            description = "Uploads multiple files simultaneously, processing and indexing each document into the vector database."
    )
    public ResponseEntity<ApiResponse<List<DocumentResponseDto>>> uploadMultipleDocuments(
            @RequestParam("files") List<MultipartFile> files,
            Authentication authentication
    ) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        List<DocumentResponseDto> responseDtos = documentService.uploadMultipleDocuments(files, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<List<DocumentResponseDto>>builder()
                        .success(true)
                        .message("Documents uploaded and processed successfully.")
                        .data(responseDtos)
                        .timeStamp(LocalDateTime.now())
                        .build());
    }

    @GetMapping("/user")
    @Operation(
            summary = "Get all uploaded documents of logged in user",
            description = "Retrieves metadata for all uploaded documents sorted by creation date descending."
    )
    public ResponseEntity<ApiResponse<List<DocumentMetadataDto>>> getAllDocumentsOfLoggedInUser(
            Authentication authentication
    ) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();
        List<DocumentMetadataDto> documents = documentService.getAllDocumentsByUser(user);
        return ResponseEntity.ok(
                ApiResponse.<List<DocumentMetadataDto>>builder()
                        .success(true)
                        .message("Documents retrieved successfully.")
                        .data(documents)
                        .timeStamp(LocalDateTime.now())
                        .build()
        );
    }

    // for admin
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    @Operation(
            summary = "Get all uploaded documents",
            description = "Retrieves metadata for all uploaded documents sorted by creation date descending."
    )
    public ResponseEntity<ApiResponse<List<DocumentMetadataDto>>> getAllDocuments() {
        List<DocumentMetadataDto> documents = documentService.getAllDocuments();
        return ResponseEntity.ok(
                ApiResponse.<List<DocumentMetadataDto>>builder()
                        .success(true)
                        .message("Documents retrieved successfully.")
                        .data(documents)
                        .timeStamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get document metadata by ID",
            description = "Fetches the details, file size, status, and chunk count of a specific document by its UUID."
    )
    public ResponseEntity<ApiResponse<DocumentMetadataDto>> getDocumentById(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();
        DocumentMetadataDto document = documentService.getDocumentById(id, user);
        return ResponseEntity.ok(
                ApiResponse.<DocumentMetadataDto>builder()
                        .success(true)
                        .message("Document retrieved successfully.")
                        .data(document)
                        .timeStamp(LocalDateTime.now())
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Delete document and its vector embeddings",
            description = "Permanently deletes the document record from the database along with all its vector chunks from PgVector."
    )
    public ResponseEntity<ApiResponse<Void>> deleteDocument(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();
        documentService.deleteDocument(id, user);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Document deleted successfully.")
                        .data(null)
                        .timeStamp(LocalDateTime.now())
                        .build()
        );
    }
}
