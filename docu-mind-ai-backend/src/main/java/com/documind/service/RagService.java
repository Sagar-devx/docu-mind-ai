package com.documind.service;

import com.documind.dto.ChatRequestDto;
import com.documind.dto.ChatResponseDto;
import com.documind.dto.SearchRequestDto;
import com.documind.dto.SearchResultDto;
import com.documind.entity.User;
import reactor.core.publisher.Flux;

public interface RagService {

    SearchResultDto searchSimilarChunks(SearchRequestDto request, User user);
    ChatResponseDto askQuestion(ChatRequestDto requestDto, User user);
    Flux<String> streamQuestionAnswer(ChatRequestDto request, User user);
}
