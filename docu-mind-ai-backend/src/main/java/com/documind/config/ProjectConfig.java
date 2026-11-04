package com.documind.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ProjectConfig {

    @Bean
    public OpenAPI openAPI()
    {
        return new OpenAPI()
                .info(new Info()
                        .title("Documind - AI Document Intelligence & RAG backend")
                        .description("Documind API documentation")
                        .version("1.0.0"));

    }

    @Bean
    public ModelMapper modelMapper()
    {
        return new ModelMapper();
    }
}
