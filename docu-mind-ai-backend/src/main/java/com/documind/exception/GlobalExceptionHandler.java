package com.documind.exception;

import com.documind.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<?> handleBadCredentialsException(BadCredentialsException ex) {
        log.warn("Authentication failed: {}", ex.getMessage());

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.builder()
                        .success(false)
                        .message("Invalid username or password.")
                        .data(null)
                        .timeStamp(LocalDateTime.now())
                        .build()
                );
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleNotFoundException(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.builder()
                        .success(false)
                        .message(ex.getMessage())
                        .data(null)
                        .timeStamp(LocalDateTime.now())
                        .build()
                );
    }

    @ExceptionHandler(DocumentProcessingException.class)
    public ResponseEntity<Object> handleProcessingException(DocumentProcessingException ex) {
        log.warn("Document processing error: {}", ex.getMessage());

        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_CONTENT)
                .body(ApiResponse.builder()
                        .success(false)
                        .message(ex.getMessage())
                        .data(null)
                        .timeStamp(LocalDateTime.now())
                        .build()
                );
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Object> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException ex) {
        log.warn("Upload size exceeded: {}", ex.getMessage());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.builder()
                        .success(false)
                        .message("File size exceeds the allowed limit (25 MB).")
                        .data(null)
                        .timeStamp(LocalDateTime.now())
                        .build()
                );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex) {
        log.warn("Invalid method argument: {}", ex.getMessage());

        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(error -> {
            errors.put(error.getField(), error.getDefaultMessage());
        });

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<Map<String, String>>builder()
                        .success(false)
                        .message("Validation failed for one or more fields.")
                        .data(errors)
                        .timeStamp(LocalDateTime.now())
                        .build()
                );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgumentException(IllegalArgumentException ex) {
        log.warn("Illegal argument: {}", ex.getMessage());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.builder()
                        .success(false)
                        .message(ex.getMessage())
                        .data(null)
                        .timeStamp(LocalDateTime.now())
                        .build()
                );
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        log.warn("Database constraint violation: {}", ex.getMessage());

        String message = "Username already exists. Please choose a different username.";
        String cause = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : "";
        if (cause != null && (cause.contains("users_email_key") || cause.toLowerCase().contains("email"))) {
            message = "Email is already registered. Please sign in or use a different email.";
        }

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.builder()
                        .success(false)
                        .message(message)
                        .data(null)
                        .timeStamp(LocalDateTime.now())
                        .build()
                );
    }

    @ExceptionHandler(org.springframework.web.HttpMediaTypeNotAcceptableException.class)
    public ResponseEntity<String> handleMediaTypeNotAcceptableException(org.springframework.web.HttpMediaTypeNotAcceptableException ex) {
        log.warn("Media type not acceptable: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE)
                .body("Requested media type is not supported.");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGenericException(Exception ex) {
        log.error("An unexpected error occurred: {}", ex.getMessage(), ex);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.builder()
                        .success(false)
                        .message("An unexpected error occurred. Please try again later.")
                        .data(null)
                        .timeStamp(LocalDateTime.now())
                        .build()
                );
    }
}
