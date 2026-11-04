package com.documind.service;

import com.documind.dto.ChatRequestDto;
import com.documind.dto.ChatResponseDto;
import com.documind.dto.SearchRequestDto;
import com.documind.dto.SearchResultDto;
import reactor.core.publisher.Flux;

public interface RagService {

    SearchResultDto searchSimilarChunks(SearchRequestDto request);
    ChatResponseDto askQuestion(ChatRequestDto requestDto);
    Flux<String> streamQuestionAnswer(ChatRequestDto request);
}
