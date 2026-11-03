package com.documind.service.impl;

import com.documind.config.AppProperties;
import com.documind.entity.DocumentMetaData;
import com.documind.entity.DocumentStatus;
import com.documind.exception.DocumentProcessingException;
import com.documind.repository.DocumentMetadataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class DocumentIngestionService {

    private final VectorStore vectorStore;
    private final DocumentMetadataRepository documentMetadataRepository;
    private final AppProperties appProperties;

    public int ingest(List<Document> parsedDocs, DocumentMetaData documentMetaData) {

        log.info("Ingesting document: {} with {} chunks", documentMetaData.getFileName(), parsedDocs.size());

        try {
            documentMetaData.setStatus(DocumentStatus.PROCESSING);
            documentMetaData.setTotalPages(parsedDocs.size());

            TokenTextSplitter tokenTextSplitter = TokenTextSplitter.builder()
                    .withChunkSize(appProperties.getRag().getChunkSize())
                    .withMinChunkSizeChars(appProperties.getRag().getMinChunkSizeChars())
                    .withMaxNumChunks(appProperties.getRag().getMaxNumChunks())
                    .withMinChunkLengthToEmbed(appProperties.getRag().getMinChunkLengthToEmbed())
                    .withKeepSeparator(true)
                    .build();

            List<Document> chunks = tokenTextSplitter.apply(parsedDocs);

            if (chunks.isEmpty()) {
                documentMetaData.setStatus(DocumentStatus.FAILED);
                documentMetaData.setErrorMessage("No chunks were created from the document. Please check the document content.");
                documentMetadataRepository.save(documentMetaData);
                throw new DocumentProcessingException("No chunks were created from the document. Please check the document content.");
            }

            List<Document> enrichedChunks = new ArrayList<>();

            for (int i = 0; i < chunks.size(); i++) {
                Document chunk = chunks.get(i);

                Map<String, Object> enrichedMetadata = new HashMap<>(chunk.getMetadata());
                enrichedMetadata.put("documentId", documentMetaData.getId().toString());
                enrichedMetadata.put("chunkIndex", i);
                enrichedMetadata.put("fileName", documentMetaData.getFileName());
                enrichedMetadata.put("contentType", documentMetaData.getContentType());

                Object pageNumber = chunk.getMetadata().get("page_number");

                if (pageNumber == null) {
                    pageNumber = chunk.getMetadata().get("pageNumber");
                }
                if (pageNumber != null) {
                    enrichedMetadata.put("pageNumber", pageNumber);
                }
                Document enrichedChunk = new Document(chunk.getText(), enrichedMetadata);
                enrichedChunks.add(enrichedChunk);
            }
            log.info("Ingesting {} chunks for document: {}", enrichedChunks.size(), documentMetaData.getFileName());

            vectorStore.add(enrichedChunks);
            documentMetaData.setStatus(DocumentStatus.INDEXED);
            documentMetaData.setTotalChunks(enrichedChunks.size());
            documentMetaData.setErrorMessage(null);
            documentMetadataRepository.save(documentMetaData);

            log.info("Document ingestion completed for document: {} with {} chunks", documentMetaData.getFileName(), enrichedChunks.size());
            return enrichedChunks.size();

        } catch (Exception e) {
            log.error("Error occurred while ingesting document: {}", documentMetaData.getFileName(), e);

            documentMetaData.setStatus(DocumentStatus.FAILED);
            documentMetaData.setErrorMessage("An error occurred while ingesting the document: " + e.getMessage());
            documentMetadataRepository.save(documentMetaData);
            throw new DocumentProcessingException("Failed to index document: " + documentMetaData.getFileName(), e);
        }

    }
}

