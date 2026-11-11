package com.documind.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.Embedding;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.embedding.EmbeddingRequest;
import org.springframework.ai.embedding.EmbeddingResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Configuration
public class AiConfig {

    @Bean
    public ChatClient chatClient(ChatClient.Builder builder, ChatMemory chatMemory)
    {
        return builder
                .defaultSystem("""
                                                You are DocuMind, an intelligent, versatile, and friendly AI document intelligence assistant.                        
                                                Your Capabilities:
                                                1. Document-Grounded Q&A: When context from the user's uploaded documents is provided, prioritize and base your answer directly on that context, citing document names and page numbers when available.
                                                2. General Knowledge & Conversation: If the user engages in general conversation (greetings, chit-chat, programming questions, math, explanations, summaries, or general knowledge) that may not be present in the uploaded documents, answer helpfully, accurately, and naturally.
                                                3. Hybrid Synthesis: If the document context partially covers a topic, synthesize the document facts with your broader knowledge to give a complete, high-quality answer.
                                                4. Professional Formatting Guidelines:
                                                   - Use structured Markdown headings (### Section Title) with relevant icons or numbers to cleanly divide content.
                                                   - Format lists using bullet points (- **Item:** Description) for high readability.
                                                   - Format contact information, repositories, or profiles as clickable Markdown links (e.g. [LinkedIn](https://...), [GitHub](https://...)).
                                                   - For comparisons, grades, or structured data, use clean Markdown tables.
                                                   - Conclude comprehensive answers with an executive callout block (> **Summary:** ...).
                        
                        
                                                Document Context is :
                        
                                                {doc_context}
                                                
                                                Produce markdown output.
                        
                        
                        """)
                .defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
                .build();
    }

    @Bean
    public EmbeddingModel embeddingModel(@Value("${gemini.api-key}") String apiKeyConfig) {

        List<String> apiKeys = Arrays.stream(apiKeyConfig.split(","))
                .map(String::trim)
                .filter(k -> !k.isEmpty())
                .toList();

        final List<String> effectiveKeys = apiKeys.isEmpty() ? List.of("") : apiKeys;
        final AtomicInteger keyCounter = new AtomicInteger(0);

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(30));
        requestFactory.setReadTimeout(Duration.ofSeconds(60));

        RestClient restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .build();

        return new EmbeddingModel() {
            private static final int BATCH_SIZE = 25;

            private String getNextApiKey() {
                return effectiveKeys.get(Math.abs(keyCounter.getAndIncrement() % effectiveKeys.size()));
            }

            @Override
            public EmbeddingResponse call(EmbeddingRequest request) {
                List<String> instructions = request.getInstructions();
                List<Embedding> embeddings = new ArrayList<>();

                if (instructions == null || instructions.isEmpty()) {
                    return new EmbeddingResponse(embeddings);
                }

                // If single text (e.g. search query or single chunk), use fast direct call
                if (instructions.size() == 1) {
                    float[] vec = embedSingle(instructions.get(0));
                    embeddings.add(new Embedding(vec != null ? vec : new float[768], 0));
                    return new EmbeddingResponse(embeddings);
                }

                // For multiple chunks, process in batches of 25 via batchEmbedContents
                int idx = 0;
                for (int i = 0; i < instructions.size(); i += BATCH_SIZE) {
                    List<String> batch = instructions.subList(i, Math.min(i + BATCH_SIZE, instructions.size()));
                    List<Map<String, Object>> batchRequests = new ArrayList<>();
                    for (String text : batch) {
                        String cleanText = (text == null || text.trim().isEmpty()) ? "content" : text;
                        batchRequests.add(Map.of(
                                "model", "models/gemini-embedding-001",
                                "content", Map.of("parts", List.of(Map.of("text", cleanText))),
                                "outputDimensionality", 768
                        ));
                    }

                    boolean batchSuccess = false;
                    for (int attempt = 0; attempt < effectiveKeys.size() && !batchSuccess; attempt++) {
                        String key = getNextApiKey();
                        try {
                            Map response = restClient.post()
                                    .uri("https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents")
                                    .header("Content-Type", "application/json")
                                    .header("x-goog-api-key", key)
                                    .body(Map.of("requests", batchRequests))
                                    .retrieve()
                                    .body(Map.class);

                            if (response != null && response.containsKey("embeddings")) {
                                List<Map> embeddingList = (List<Map>) response.get("embeddings");
                                for (int k = 0; k < batch.size(); k++) {
                                    float[] floatValues = null;
                                    if (k < embeddingList.size()) {
                                        Map embeddingMap = embeddingList.get(k);
                                        if (embeddingMap != null && embeddingMap.containsKey("values")) {
                                            List<Double> values = (List<Double>) embeddingMap.get("values");
                                            floatValues = new float[values.size()];
                                            for (int j = 0; j < values.size(); j++) {
                                                floatValues[j] = values.get(j).floatValue();
                                            }
                                        }
                                    }
                                    embeddings.add(new Embedding(floatValues != null ? floatValues : new float[768], idx++));
                                }
                                batchSuccess = true;
                            }
                        } catch (Exception e) {
                            log.warn("Gemini batch embedding call failed on attempt {}/{}: {}", attempt + 1, effectiveKeys.size(), e.getMessage());
                        }
                    }

                    if (!batchSuccess) {
                        // Fallback to single calls with rotating keys; ensure every item gets an embedding
                        for (String text : batch) {
                            float[] vec = embedSingle(text);
                            embeddings.add(new Embedding(vec != null ? vec : new float[768], idx++));
                        }
                    }

                    // Gentle delay between batches: 4.5s for 2-key rotation (9s rest/key), 8s for single key to stay strictly under 30k TPM
                    if (i + BATCH_SIZE < instructions.size()) {
                        try {
                            Thread.sleep(effectiveKeys.size() > 1 ? 4500 : 8000);
                        } catch (InterruptedException ignored) {
                            Thread.currentThread().interrupt();
                        }
                    }
                }

                return new EmbeddingResponse(embeddings);
            }

            private float[] embedSingle(String text) {
                String cleanText = (text == null || text.trim().isEmpty()) ? "content" : text;
                for (int attempt = 0; attempt < effectiveKeys.size(); attempt++) {
                    String key = getNextApiKey();
                    try {
                        Map<String, Object> body = Map.of(
                                "content", Map.of("parts", List.of(Map.of("text", cleanText))),
                                "outputDimensionality", 768
                        );
                        Map response = restClient.post()
                                .uri("https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent")
                                .header("Content-Type", "application/json")
                                .header("x-goog-api-key", key)
                                .body(body)
                                .retrieve()
                                .body(Map.class);

                        if (response != null && response.containsKey("embedding")) {
                            Map embeddingMap = (Map) response.get("embedding");
                            List<Double> values = (List<Double>) embeddingMap.get("values");
                            float[] floatValues = new float[values.size()];
                            for (int i = 0; i < values.size(); i++) {
                                floatValues[i] = values.get(i).floatValue();
                            }
                            return floatValues;
                        }
                    } catch (Exception e) {
                        log.warn("Gemini single embedding call failed on attempt {}/{}: {}", attempt + 1, effectiveKeys.size(), e.getMessage());
                    }
                }
                return new float[768];
            }

            @Override
            public float[] embed(Document document) {
                return embed(document.getText());
            }

            @Override
            public float[] embed(String text) {
                EmbeddingResponse response = call(new EmbeddingRequest(List.of(text), null));
                return response.getResults().get(0).getOutput();
            }

            @Override
            public List<float[]> embed(List<String> texts) {
                EmbeddingResponse response = call(new EmbeddingRequest(texts, null));
                return response.getResults().stream().map(Embedding::getOutput).toList();
            }

            @Override
            public int dimensions() {
                return 768;
            }
        };
    }
}
