package com.documind.service.impl;

import com.documind.exception.DocumentProcessingException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.reader.pdf.config.PdfDocumentReaderConfig;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@Slf4j
public class DocumentParserService {

    public List<Document> parse(MultipartFile file) {

        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
        String contentType = file.getContentType() != null ? file.getContentType().toLowerCase() : "application/octet-stream";

        log.info("Parsing document: {} with content type: {}", fileName, contentType);

        try {
            Resource resource = file.getResource();

            if (fileName.toLowerCase().endsWith(".pdf")) {
                return parsePdf(resource);
            } else {
                return parseGenericFile(resource);
            }

        } catch (Exception e) {
            log.error("Failed to parse document: {}", fileName, e);
            throw new DocumentProcessingException("Failed to parse document content: " + fileName, e);
        }
    }

    private List<Document> parseGenericFile(Resource resource) {
        TikaDocumentReader documentReader = new TikaDocumentReader(resource);
        return documentReader.read();
    }

    private List<Document> parsePdf(Resource resource) {
        PdfDocumentReaderConfig config = PdfDocumentReaderConfig.builder()
                .withPageTopMargin(0)
                .withPageBottomMargin(0)
                .build();

        PagePdfDocumentReader documentReader = new PagePdfDocumentReader(resource, config);
        return documentReader.read();
    }
}
