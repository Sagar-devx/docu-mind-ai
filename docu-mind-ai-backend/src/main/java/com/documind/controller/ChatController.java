package com.documind.controller;

import com.documind.dto.*;
import com.documind.service.RagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/chat")
@Tag(
        name = "Chat",
        description = "Endpoints for chat and conversation with the AI model."
)
@RequiredArgsConstructor
public class ChatController {

    private final RagService ragService;

    @PostMapping("/query")
    @Operation(
            summary = "Ask a question (Synchronous Q&A)",
            description = "Performs vector similarity search on ingested documents, builds an augmented prompt with retrieved context, and returns the LLM response with citations."
    )
    public ResponseEntity<ApiResponse<ChatResponseDto>> askQuestion(
            @Valid @RequestBody ChatRequestDto requestDto
    ) {
        ChatResponseDto chatResponseDto = ragService.askQuestion(requestDto);
        return ResponseEntity.ok(
                ApiResponse.<ChatResponseDto>builder()
                        .success(true)
                        .message("Question answered successfully.")
                        .data(chatResponseDto)
                        .timeStamp(LocalDateTime.now())
                        .build()
        );
    }

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(
            summary = "Stream question response (Reactive SSE)",
            description = "Streams LLM answer tokens in real-time as Server-Sent Events (SSE) based on relevant document chunks."
    )
    public Flux<String> streamQuestion(
            @Valid @RequestBody ChatRequestDto requestDto
    ) {
        return ragService.streamQuestionAnswer(requestDto);
    }

    @PostMapping("/search/similarity")
    @Operation(
            summary = "Vector similarity search",
            description = "Performs semantic similarity search against the PgVector store without invoking the LLM, returning relevant matching text chunks and citations."
    )
    public ResponseEntity<ApiResponse<SearchResultDto>> searchSimilar(
            @Valid @RequestBody SearchRequestDto requestDto
    ) {
        SearchResultDto searchResultDto = ragService.searchSimilarChunks(requestDto);
        return ResponseEntity.ok(
                ApiResponse.<SearchResultDto>builder()
                        .success(true)
                        .message("Similar chunks retrieved successfully.")
                        .data(searchResultDto)
                        .timeStamp(LocalDateTime.now())
                        .build()
        );
    }

}
