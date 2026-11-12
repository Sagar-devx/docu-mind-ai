package com.documind.service.impl;

import com.documind.config.AppProperties;
import com.documind.dto.*;
import com.documind.entity.Conversation;
import com.documind.entity.User;
import com.documind.repository.ConversationRepository;
import com.documind.service.RagService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.Filter;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.time.LocalDateTime;
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
    private final ConversationRepository conversationRepository;

    // Synchronous Q&A: finds relevant chunks, builds prompt with context, and returns answer with citations
    @Override
    public ChatResponseDto askQuestion(ChatRequestDto request, User user) {

        String conversationId = (request.getConversationId() != null && !request.getConversationId().isBlank())
                ? request.getConversationId()
                : UUID.randomUUID().toString();

        ensureConversationExists(conversationId, user, request.getQuestion());

        long startTime = System.currentTimeMillis();
        log.info("Processing Q&A query: '{}' [conversationId: {}, scoped docId: {}, userId: {}]",
                request.getQuestion(), conversationId, request.getDocumentId(), user.getId());

        List<Document> similarityDocuments = this.retrieveRelevantDocuments(
                request.getQuestion(),
                request.getDocumentId(),
                request.getTopK(),
                request.getMinSimilarity(),
                user
        );

        List<CitationDto> citationDtos = similarityDocuments.stream()
                .map(this::mapToCitation)
                .toList();

        String contextText = buildContextString(similarityDocuments);

        log.debug("Sending prompt to LLM for conversationId: {} (context length: {} chars)", conversationId, contextText.length());

        String answer;
        try {
            answer = this.chatClient
                    .prompt()
                    .system(system -> system.param("doc_context", contextText))
                    .advisors(advisor -> advisor.param(ChatMemory.CONVERSATION_ID, conversationId))
                    .user(request.getQuestion())
                    .call()
                    .content();
        } catch (Exception e) {
            log.error("LLM call failed for conversationId: '{}' (userId: {})", conversationId, user.getId(), e);
            answer = (e.getMessage() != null && e.getMessage().contains("429"))
                    ? "⚠️ *Rate limit reached from AI provider. Please wait a moment and try again.*"
                    : "⚠️ *Unable to generate response from AI provider. Please try again.*";
        }

        long responseTime = System.currentTimeMillis() - startTime;
        log.info("Completed Q&A for conversationId: '{}' in {} ms with {} citations (userId: {})",
                conversationId, responseTime, citationDtos.size(), user.getId());

        return ChatResponseDto.builder()
                .answer(answer)
                .conversationId(conversationId)
                .citations(citationDtos)
                .responseTimeMs(responseTime)
                .build();
    }

    private void ensureConversationExists(String conversationId, User user, @NotBlank(message = "Question cannot be empty") String question) {

        conversationRepository.findByIdAndUser(conversationId, user)
                .orElseGet(() -> {
                    String title = question.length() > 50 ? question.substring(0, 47) + "..." : question;
                    return conversationRepository.save(
                            Conversation.builder()
                                    .id(conversationId)
                                    .user(user)
                                    .title(title)
                                    .createdAt(LocalDateTime.now())
                                    .updatedAt(LocalDateTime.now())
                                    .build()
                    );
                });
    }

    // Streaming Q&A: streams response tokens word-by-word via Flux (SSE) for a real-time typing feel
    @Override
    public Flux<String> streamQuestionAnswer(ChatRequestDto request, User user) {

        String conversationId = (request.getConversationId() != null && !request.getConversationId().isBlank())
                ? request.getConversationId()
                : UUID.randomUUID().toString();
        ensureConversationExists(conversationId, user, request.getQuestion());
        log.info("Initiating streaming Q&A: '{}' [conversationId: {}, scoped docId: {}, userId: {}]",
                request.getQuestion(), conversationId, request.getDocumentId(), user.getId());

        List<Document> similarityDocuments = this.retrieveRelevantDocuments(
                request.getQuestion(),
                request.getDocumentId(),
                request.getTopK(),
                request.getMinSimilarity(),
                user
        );

        String contextText = buildContextString(similarityDocuments);

        return chatClient.prompt()
                .system(system -> system.param("doc_context", contextText))
                .user(request.getQuestion())
                .advisors(advisor -> advisor.param(ChatMemory.CONVERSATION_ID, conversationId))
                .stream()
                .content()
                .doOnComplete(() -> log.info("Finished streaming response for conversationId: '{}' (userId: {})", conversationId, user.getId()))
                .doOnError(e -> log.error("Error during streaming for conversationId: '{}' (userId: {})", conversationId, user.getId(), e))
                .onErrorResume(e -> {
                    log.error("Streaming error fallback for conversationId: '{}'", conversationId, e);
                    String errorMsg = (e.getMessage() != null && e.getMessage().contains("429"))
                            ? "\n\n⚠️ *Rate limit reached from AI provider. Please wait a moment and try again.*"
                            : "\n\n⚠️ *An error occurred while generating the response. Please try again.*";
                    return Flux.just(errorMsg);
                });
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
    public SearchResultDto searchSimilarChunks(SearchRequestDto request, User user) {
        log.info("Searching similar chunks for query: '{}', docId: {}, topK: {}, userId: {}",
                request.getQuery(), request.getDocumentId(), request.getTopK(), user.getId());

        List<Document> matchesDocs = retrieveRelevantDocuments(
                request.getQuery(),
                request.getDocumentId(),
                request.getTopK(),
                request.getSimilaritySearch(),
                user
        );

        List<CitationDto> citations = matchesDocs.stream()
                .map(this::mapToCitation)
                .toList();

        log.info("Found {} matching chunks for query: '{}' (userId: {})", citations.size(), request.getQuery(), user.getId());

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
                                                     Double similaritySearch,
                                                     User user
    ) {

        int effectiveTopK = (topK != null && topK > 0) ? topK : appProperties.getRag().getTopK();
        double effectiveSimilaritySearch = (similaritySearch != null) ? similaritySearch : appProperties.getRag().getSimilarityThreshold();

        SearchRequest.Builder searchRequestBuilder = SearchRequest.builder()
                .query(query)
                .topK(effectiveTopK);

        if (effectiveSimilaritySearch > 0.0) {
            searchRequestBuilder.similarityThreshold(effectiveSimilaritySearch);
        }

        FilterExpressionBuilder b = new FilterExpressionBuilder();
        Filter.Expression filterExpression;

        if (documentId != null) {
            log.debug("Scoping vector search to documentId: {} and userId: {}", documentId, user.getId());
            filterExpression =
                    b.and(
                            b.eq("userId", user.getId().toString()),
                            b.eq("documentId", documentId.toString())
                    ).build();
        } else {
            filterExpression = b.eq("userId", user.getId().toString()).build();
        }
        searchRequestBuilder.filterExpression(filterExpression);

        try {
            List<Document> documents = vectorStore.similaritySearch(searchRequestBuilder.build());
            log.info("Retrieved {} chunks from vector store for query: '{}' (scoped docId: {}, userId: {})",
                    documents.size(), query, documentId, user.getId());
            return documents;

        } catch (Exception e) {
            log.error("Similarity search failed in vector store for query: '{}' (userId: {})", query, user.getId(), e);
            return Collections.emptyList();
        }
    }
}
