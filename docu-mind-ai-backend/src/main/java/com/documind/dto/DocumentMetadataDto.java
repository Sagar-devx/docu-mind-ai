package com.documind.dto;

import com.documind.entity.DocumentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class DocumentMetadataDto {

    private UUID id;
    private String fileName;
    private String contentType;
    private Long fileSize;
    private Integer totalPages;
    private Integer totalChunks;
    private DocumentStatus status;
    private String errorMessage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
