package com.documind.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/chat")
@Tag(
        name = "Chat",
        description = "Endpoints for chat and conversation with the AI model."
)
public class ChatController {

}
