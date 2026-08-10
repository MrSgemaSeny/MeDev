package com.medev.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> loginBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> aiBuckets = new ConcurrentHashMap<>();

    // 5 запросов в минуту для логина (защита от брутфорса)
    private Bucket createLoginBucket() {
        Bandwidth limit = Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    // 10 запросов в час для AI парсинга резюме (ограничение расходов)
    private Bucket createAiBucket() {
        Bandwidth limit = Bandwidth.classic(10, Refill.intervally(10, Duration.ofHours(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
            
        String path = request.getRequestURI();
        String ip = getClientIpAddress(request);

        if (path.contains("/v1/auth/login")) {
            Bucket bucket = loginBuckets.computeIfAbsent(ip, k -> createLoginBucket());
            if (!bucket.tryConsume(1)) {
                sendError(response);
                return;
            }
        } else if (path.contains("/v1/ai/parse-resume")) {
            Bucket bucket = aiBuckets.computeIfAbsent(ip, k -> createAiBucket());
            if (!bucket.tryConsume(1)) {
                sendError(response);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private void sendError(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"error\": \"Слишком много запросов. Попробуйте позже.\"}");
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedForHeader = request.getHeader("X-Forwarded-For");
        if (xForwardedForHeader == null) {
            return request.getRemoteAddr();
        }
        return xForwardedForHeader.split(",")[0];
    }
}
