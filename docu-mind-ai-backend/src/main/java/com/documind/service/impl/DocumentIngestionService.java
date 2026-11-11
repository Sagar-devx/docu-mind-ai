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
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class DocumentIngestionService {

    private final VectorStore vectorStore;
    private final DocumentMetadataRepository documentMetadataRepository;
    private final AppProperties appProperties;

    // Takes parsed document text, chops it into vector-friendly chunks, enriches metadata, and saves embeddings
    public int ingest(List<Document> parsedDocs, DocumentMetaData documentMetaData) {

        log.info("Ingesting document: {} (userId: {}) with {} parsed pages", 
                documentMetaData.getFileName(), documentMetaData.getUser().getId(), parsedDocs.size());

        try {
            documentMetaData.setStatus(DocumentStatus.PROCESSING);
            documentMetaData.setTotalPages(parsedDocs.size());

            // 1. Break text into smaller token chunks with slight overlap so context isn't chopped mid-sentence
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

            // 2. Tag each chunk with documentId, chunk index, and page number so search citations know the exact origin
            List<Document> enrichedChunks = new ArrayList<>();

            for (int i = 0; i < chunks.size(); i++) {
                Document chunk = chunks.get(i);

                Map<String, Object> enrichedMetadata = new HashMap<>(chunk.getMetadata());
                enrichedMetadata.put("documentId", documentMetaData.getId().toString());
                enrichedMetadata.put("chunkIndex", i);
                enrichedMetadata.put("fileName", documentMetaData.getFileName());
                enrichedMetadata.put("contentType", documentMetaData.getContentType());
                enrichedMetadata.put("userId", documentMetaData.getUser().getId().toString());

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
            log.info("Ingesting {} chunks for document: {} (userId: {})", 
                    enrichedChunks.size(), documentMetaData.getFileName(), documentMetaData.getUser().getId());

            if (enrichedChunks.size() > appProperties.getRag().getMaxNumChunks()) {
                throw new DocumentProcessingException(
                        "Document produced " + enrichedChunks.size() + " chunks, exceeding the allowed limit of "
                                + appProperties.getRag().getMaxNumChunks() + " chunks (~200-300 pages). Please upload a smaller section or split the document."
                );
            }

            // 3. Generate embeddings and store vectors into PgVector in safe batches of 25 chunks
            int batchSize = 25;
            for (int i = 0; i < enrichedChunks.size(); i += batchSize) {
                List<Document> batch = enrichedChunks.subList(i, Math.min(i + batchSize, enrichedChunks.size()));
                vectorStore.add(batch);
                if (i + batchSize < enrichedChunks.size()) {
                    try {
                        Thread.sleep(4500); // 4.5s pacing to stay strictly within Gemini 30k TPM rate limit
                    } catch (InterruptedException ignored) {
                        Thread.currentThread().interrupt();
                    }
                }
            }
            documentMetaData.setStatus(DocumentStatus.INDEXED);
            documentMetaData.setTotalChunks(enrichedChunks.size());
            documentMetaData.setErrorMessage(null);
            documentMetadataRepository.save(documentMetaData);

            log.info("Document ingestion completed for document: {} with {} chunks (userId: {})", 
                    documentMetaData.getFileName(), enrichedChunks.size(), documentMetaData.getUser().getId());
            return enrichedChunks.size();

        } catch (Throwable e) {
            log.error("Error occurred while ingesting document: {} (userId: {})", 
                    documentMetaData.getFileName(), documentMetaData.getUser().getId(), e);

            String errorMsg = e.getMessage() != null ? e.getMessage() : "An error occurred while ingesting the document";
            if (errorMsg.length() > 2000) {
                errorMsg = errorMsg.substring(0, 1997) + "...";
            }

            documentMetaData.setStatus(DocumentStatus.FAILED);
            documentMetaData.setErrorMessage(errorMsg);
            documentMetadataRepository.save(documentMetaData);
            if (e instanceof DocumentProcessingException dpe) {
                throw dpe;
            }
            throw new DocumentProcessingException(errorMsg, e);
        }

    }

    // Executes vector ingestion asynchronously in a background thread to prevent HTTP timeouts
    @Async
    public void ingestAsync(List<Document> parsedDocs, UUID documentId) {
        log.info("Starting background async ingestion for documentId: {}", documentId);
        DocumentMetaData documentMetaData = documentMetadataRepository.findById(documentId).orElse(null);
        if (documentMetaData == null) {
            log.error("Cannot perform async ingestion: Document not found with id: {}", documentId);
            return;
        }

        try {
            ingest(parsedDocs, documentMetaData);
            log.info("Background async ingestion finished successfully for documentId: {}", documentId);
        } catch (Throwable t) {
            log.error("Async background ingestion failed for documentId: {}", documentId, t);
        }
    }

    // Auto-recovers any documents left in PROCESSING or UPLOADING status after a crash/restart
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void recoverStuckDocumentsOnStartup() {
        List<DocumentMetaData> stuckDocs = documentMetadataRepository.findByStatusIn(
                List.of(DocumentStatus.PROCESSING, DocumentStatus.UPLOADING)
        );
        if (!stuckDocs.isEmpty()) {
            log.warn("Found {} stuck document(s) in PROCESSING/UPLOADING state after restart. Marking as FAILED.", stuckDocs.size());
            for (DocumentMetaData doc : stuckDocs) {
                doc.setStatus(DocumentStatus.FAILED);
                doc.setErrorMessage("Processing was interrupted due to a server restart. Please re-upload.");
            }
            documentMetadataRepository.saveAll(stuckDocs);
            log.info("Successfully recovered {} stuck document(s).", stuckDocs.size());
        }
    }
}
