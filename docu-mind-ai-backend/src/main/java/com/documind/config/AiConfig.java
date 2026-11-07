package com.documind.config;

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
import java.util.List;
import java.util.Map;

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
                                                4. Tone & Format: Always be warm, professional, clear, and structured. Use Markdown (headings, bullet points, bold text, code blocks) to make responses easy to read.
                        
                        
                                                Document Context is :
                        
                                                {doc_context}
                                                
                                                Produce markdown output.
                        
                        
                        """)
                .defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
                .build();
    }

    @Bean
    public EmbeddingModel embeddingModel(@Value("${gemini.api-key}") String apiKey) {

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(30));
        requestFactory.setReadTimeout(Duration.ofSeconds(60));

        RestClient restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .build();

        return new EmbeddingModel() {
            @Override
            public EmbeddingResponse call(EmbeddingRequest request) {

                List<Embedding> embeddings = new ArrayList<>();
                int idx = 0;
                for (String text : request.getInstructions()) {
                    Map<String, Object> body = Map.of(
                            "content", Map.of("parts", List.of(Map.of("text", text))),
                            "outputDimensionality", 768
                    );
                    Map response = restClient.post()
                            .uri("https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent")
                            .header("Content-Type", "application/json")
                            .header("x-goog-api-key", apiKey)
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
                        embeddings.add(new Embedding(floatValues, idx++));
                    }
                }
                return new EmbeddingResponse(embeddings);
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
