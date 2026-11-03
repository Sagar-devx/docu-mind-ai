package com.documind.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/documents")
@Tag(
        name = "Document Management",
        description = "Endpoints for uploading, listing and managing documents and their vector embeddings."
)
public class DocumentController {
}
