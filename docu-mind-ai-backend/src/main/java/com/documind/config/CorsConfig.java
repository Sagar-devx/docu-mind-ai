package com.documind.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
@RequiredArgsConstructor
public class CorsConfig implements WebMvcConfigurer {

    private final AppProperties appProperties;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] allowedOrigins = appProperties.getCors().getAllowedOrigins().split(",");
        String[] allowedMethods = appProperties.getCors().getAllowedMethods().split(",");
        String[] allowedHeaders = appProperties.getCors().getAllowedHeaders().split(",");

        registry.addMapping("/**")
                .allowedOriginPatterns(allowedOrigins)
                .allowedHeaders(allowedHeaders)
                .allowedMethods(allowedMethods)
                .allowCredentials(true);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList(appProperties.getCors().getAllowedOrigins().split(",")));
        configuration.setAllowedMethods(Arrays.asList(appProperties.getCors().getAllowedMethods().split(",")));
        configuration.setAllowedHeaders(Arrays.asList(appProperties.getCors().getAllowedHeaders().split(",")));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
