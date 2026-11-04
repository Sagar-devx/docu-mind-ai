package com.documind.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@Data
@Builder
@NoArgsConstructor
public class ChatResponseDto {

    private String answer;
    private String conversationId;
    private List<CitationDto> citations;
    private Long responseTimeMs;
}
