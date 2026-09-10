package com.medev.shared.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.http.converter.HttpMessageNotReadableException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    private Map<String, Object> errorPayload(HttpStatus status, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("status", status.value());
        body.put("error", message != null ? message : status.getReasonPhrase());
        body.put("message", message != null ? message : status.getReasonPhrase());
        return body;
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<Map<String, Object>> handleConflict(ConflictException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorPayload(HttpStatus.CONFLICT, e.getMessage()));
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorized(UnauthorizedException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorPayload(HttpStatus.UNAUTHORIZED, e.getMessage()));
    }
    
    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<Map<String, Object>> handleForbidden(ForbiddenException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorPayload(HttpStatus.FORBIDDEN, e.getMessage()));
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(NotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorPayload(HttpStatus.NOT_FOUND, e.getMessage()));
    }

    @ExceptionHandler(TooManyRequestsException.class)
    public ResponseEntity<Map<String, Object>> handleTooManyRequests(TooManyRequestsException e) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(errorPayload(HttpStatus.TOO_MANY_REQUESTS, e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException e) {
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getFieldErrors().forEach(err ->
            errors.put(err.getField(), err.getDefaultMessage())
        );
        Map<String, Object> body = errorPayload(HttpStatus.BAD_REQUEST, "Validation failed");
        body.put("errors", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException e) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(errorPayload(HttpStatus.PAYLOAD_TOO_LARGE, "Файл слишком большой. Максимальный размер: 10MB"));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleHttpMessageNotReadable(HttpMessageNotReadableException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorPayload(HttpStatus.BAD_REQUEST, "Некорректный формат данных в запросе"));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorPayload(HttpStatus.BAD_REQUEST, e.getMessage()));
    }

    @ExceptionHandler(org.springframework.web.server.ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatus(org.springframework.web.server.ResponseStatusException e) {
        HttpStatus status = HttpStatus.valueOf(e.getStatusCode().value());
        String msg = e.getReason() != null ? e.getReason() : e.getMessage();
        return ResponseEntity.status(status).body(errorPayload(status, msg));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalState(IllegalStateException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorPayload(HttpStatus.BAD_REQUEST, e.getMessage()));
    }


    @ExceptionHandler(com.medev.modules.ai.model.LlmException.class)
    public ResponseEntity<Map<String, Object>> handleLlmException(com.medev.modules.ai.model.LlmException e) {
        log.warn("LLM error occurred [{}]: {}", e.getReason(), e.getMessage());
        HttpStatus status;
        String userMessage;

        switch (e.getReason()) {
            case RATE_LIMITED -> {
                status = HttpStatus.TOO_MANY_REQUESTS;
                userMessage = "Превышен лимит запросов к AI. Пожалуйста, подождите минуту и повторите попытку.";
            }
            case PROVIDER_UNAVAILABLE, TIMEOUT, CIRCUIT_OPEN -> {
                status = HttpStatus.SERVICE_UNAVAILABLE;
                userMessage = "Сервис AI временно перегружен или недоступен. Пожалуйста, повторите попытку через 1-2 минуты.";
            }
            case INVALID_RESPONSE -> {
                status = HttpStatus.BAD_GATEWAY;
                userMessage = "AI вернул некорректный ответ. Пожалуйста, повторите попытку.";
            }
            case API_KEY_MISSING -> {
                status = HttpStatus.SERVICE_UNAVAILABLE;
                userMessage = "Сервис AI не настроен.";
            }
            default -> {
                status = HttpStatus.INTERNAL_SERVER_ERROR;
                userMessage = "Ошибка при обработке запроса AI.";
            }
        }

        return ResponseEntity.status(status).body(errorPayload(status, userMessage));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception e) {
        log.error("Unhandled exception occurred", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorPayload(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error"));
    }
}
