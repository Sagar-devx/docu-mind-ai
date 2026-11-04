package com.documind.service.impl;

import com.documind.config.AppProperties;
import com.documind.dto.*;
import com.documind.service.RagService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class RagServiceImpl implements RagService {

    private final VectorStore vectorStore;
    private final AppProperties appProperties;
    private final ChatClient chatClient;

    // Synchronous Q&A: finds relevant chunks, builds prompt with context, and returns answer with citations
    @Override
    public ChatResponseDto askQuestion(ChatRequestDto request) {
        long startTime = System.currentTimeMillis();
        String convId = request.getConversationId() != null ? request.getConversationId() : UUID.randomUUID().toString();
        log.info("Processing Q&A query: '{}' [conversationId: {}, scoped docId: {}]", request.getQuestion(), convId, request.getDocumentId());

        List<Document> similarityDocuments = this.retrieveRelevantDocuments(
                request.getQuestion(),
                request.getDocumentId(),
                request.getTopK(),
                request.getMinSimilarity()
        );

        List<CitationDto> citationDtos = similarityDocuments.stream()
                .map(this::mapToCitation)
                .toList();

        String contextText = buildContextString(similarityDocuments);
        String prompt = buildPrompt(request.getQuestion(), contextText);

        log.debug("Sending prompt to LLM for conversationId: {} (context length: {} chars)", convId, contextText.length());

        String answer = this.chatClient.prompt()
                .user(prompt)
                .call()
                .content();

        long responseTime = System.currentTimeMillis() - startTime;
        log.info("Completed Q&A for conversationId: '{}' in {} ms with {} citations", convId, responseTime, citationDtos.size());

        return ChatResponseDto.builder()
                .answer(answer)
                .conversationId(convId)
                .citations(citationDtos)
                .responseTimeMs(responseTime)
                .build();
    }

    // Streaming Q&A: streams response tokens word-by-word via Flux (SSE) for a real-time typing feel
    @Override
    public Flux<String> streamQuestionAnswer(ChatRequestDto request) {
        String convId = request.getConversationId() != null ? request.getConversationId() : UUID.randomUUID().toString();
        log.info("Initiating streaming Q&A: '{}' [conversationId: {}, scoped docId: {}]", request.getQuestion(), convId, request.getDocumentId());

        List<Document> similarityDocuments = this.retrieveRelevantDocuments(
                request.getQuestion(),
                request.getDocumentId(),
                request.getTopK(),
                request.getMinSimilarity()
        );

        String contextText = buildContextString(similarityDocuments);
        String prompt = buildPrompt(request.getQuestion(), contextText);

        return chatClient.prompt()
                .user(prompt)
                .stream()
                .content()
                .doOnComplete(() -> log.info("Finished streaming response for conversationId: '{}'", convId))
                .doOnError(e -> log.error("Error during streaming for conversationId: '{}'", convId, e));
    }

    // Grounds the LLM by combining retrieved document chunks with user query, or falls back to general chat
    private String buildPrompt(@NotBlank(message = "Question cannot be empty") String question, String contextText) {
        if (contextText != null && !contextText.isBlank()) {
            return String.format("""
                           Document Context:
                           ---------------------
                           %s
                           ---------------------                                        
                           User Message / Question: %s             
                           Instructions:
                           - If the user's question relates to the document context above, prioritize answering using that context and reference key sections.
                           - If the user is asking a general question, greeting, or discussing topics beyond the document context, respond helpfully and conversationally using your general knowledge while weaving in relevant document context if applicable.
                    
                    """, contextText, question);
        } else {
            return String.format("""
                       User Message / Question:
                       %s                         
                       Instructions:
                          - Respond helpfully, accurately, and conversationally to the user's message using your broad knowledge base.
                    
                    """, question);
        }
    }

    // Formats retrieved chunks with file name and page number headers for LLM readability
    private String buildContextString(List<Document> similarityDocuments) {
        if (similarityDocuments == null || similarityDocuments.isEmpty()) {
            log.debug("No document chunks available to build context string.");
            return "";
        }
        return similarityDocuments.stream()
                .map(doc -> {
                    String fileName = (String) doc.getMetadata().getOrDefault("fileName", "Unknown File");
                    Object page = doc.getMetadata().getOrDefault("pageNumber", "N/A");
                    return String.format("[Source: %s | Page: %s]\n%s", fileName, page, doc.getText());
                })
                .collect(Collectors.joining("\n\n---\n\n"));
    }

    // Standalone vector similarity search without LLM generation (useful for previews or inspection)
    @Override
    public SearchResultDto searchSimilarChunks(SearchRequestDto request) {
        log.info("Searching similar chunks for query: '{}', docId: {}, topK: {}", request.getQuery(), request.getDocumentId(), request.getTopK());

        List<Document> matchesDocs = retrieveRelevantDocuments(
                request.getQuery(),
                request.getDocumentId(),
                request.getTopK(),
                request.getSimilaritySearch());

        List<CitationDto> citations = matchesDocs.stream()
                .map(this::mapToCitation)
                .toList();

        log.info("Found {} matching chunks for query: '{}'", citations.size(), request.getQuery());

        return SearchResultDto.builder()
                .query(request.getQuery())
                .totalMatches(citations.size())
                .matches(citations)
                .build();
    }

    // Converts raw vector store metadata into a clean CitationDto for frontend display
    private CitationDto mapToCitation(Document document) {
        Map<String, Object> meta = document.getMetadata();
        UUID docId = null;

        if (meta.get("documentId") != null) {
            try {
                docId = UUID.fromString(meta.get("documentId").toString());
            } catch (Exception e) {
                log.warn("Unable to parse documentId '{}' as UUID in citation mapping", meta.get("documentId"));
            }
        }

        Integer chunkIndex = null;
        if (meta.get("chunkIndex") instanceof Number n) {
            chunkIndex = n.intValue();
        }

        Integer pageNumber = null;
        if (meta.get("pageNumber") instanceof Number n) {
            pageNumber = n.intValue();
        } else if (meta.get("page_number") instanceof Number n) {
            pageNumber = n.intValue();
        }

        Double score = null;
        if (meta.get("distance") instanceof Number n) {
            score = 1.0 - n.doubleValue();
        }

        return CitationDto.builder()
                .documentId(docId)
                .fileName((String) meta.getOrDefault("fileName", "Unknown"))
                .chunkIndex(chunkIndex)
                .pageNumber(pageNumber)
                .snippet(document.getText())
                .similarityScore(score)
                .metadata(meta)
                .build();
    }

    // Core vector search: queries PgVector using embeddings, top-K count, and optional documentId filter
    private List<Document> retrieveRelevantDocuments(@NotBlank(message = "Query cannot be empty") String query,
                                                     UUID documentId,
                                                     Integer topK,
                                                     Double similaritySearch) {

        int effectiveTopK = (topK != null && topK > 0) ? topK : appProperties.getRag().getTopK();
        double effectiveSimilaritySearch = (similaritySearch != null) ? similaritySearch : appProperties.getRag().getSimilarityThreshold();

        SearchRequest.Builder searchRequestBuilder = SearchRequest.builder()
                .query(query)
                .topK(effectiveTopK);

        if (effectiveSimilaritySearch > 0.0) {
            searchRequestBuilder.similarityThreshold(effectiveSimilaritySearch);
        }

        if (documentId != null) {
            log.debug("Scoping vector search to documentId: {}", documentId);
            FilterExpressionBuilder builder = new FilterExpressionBuilder();
            searchRequestBuilder.filterExpression(builder.eq("documentId", documentId.toString()).build());
        }

        try {
            List<Document> documents = vectorStore.similaritySearch(searchRequestBuilder.build());
            log.info("Retrieved {} chunks from vector store for query: '{}' (scoped docId: {})", documents.size(), query, documentId);
            return documents;

        } catch (Exception e) {
            log.error("Similarity search failed in vector store for query: '{}'", query, e);
            return Collections.emptyList();
        }
    }
}
