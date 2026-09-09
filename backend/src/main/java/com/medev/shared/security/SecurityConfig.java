package com.medev.shared.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.Customizer;

import java.util.List;

import com.medev.modules.auth.service.CustomOAuth2UserService;
import com.medev.modules.auth.security.OAuth2LoginSuccessHandler;
import com.medev.modules.auth.security.OAuth2LoginFailureHandler;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final OAuth2LoginFailureHandler oAuth2LoginFailureHandler;
    private final com.medev.modules.auth.security.CookieOAuth2AuthorizationRequestRepository cookieAuthorizationRequestRepository;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .cors(Customizer.withDefaults())
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .dispatcherTypeMatchers(jakarta.servlet.DispatcherType.ASYNC).permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                // Публичные эндпоинты
                .requestMatchers(
                    "/v1/auth/**",
                    "/v1/portfolio/**",    // публичные страницы
                    "/v1/billing/webhook",
                    "/v1/billing/webhook/kaspi",
                    "/actuator/health",
                    "/oauth2/**",
                    "/login/oauth2/**",
                    "/error"               // Tomcat error page
                ).permitAll()
                // Только ADMIN
                .requestMatchers("/v1/admin/**", "/actuator/**").hasRole("ADMIN")
                // Всё остальное — авторизованные пользователи
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .authorizationEndpoint(a -> a.authorizationRequestRepository(cookieAuthorizationRequestRepository))
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService)
                )
                .successHandler(oAuth2LoginSuccessHandler)
                .failureHandler(oAuth2LoginFailureHandler)
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    // Inside Spring Security, context-path (/api) is already stripped.
                    // So the URI is /v1/..., not /api/v1/...
                    response.setStatus(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"" + authException.getMessage() + "\"}");
                })
            )
            .headers(headers -> headers
                .contentTypeOptions(Customizer.withDefaults())
                .frameOptions(frame -> frame.deny())
                .referrerPolicy(ref -> ref.policy(org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                .permissionsPolicy(perm -> perm.policy("camera=(), microphone=(), geolocation=()"))
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(@org.springframework.beans.factory.annotation.Value("${cors.allowed-origins:http://localhost:5173}") String allowedOrigins) {
        CorsConfiguration configuration = new CorsConfiguration();
        java.util.Set<String> allOrigins = new java.util.LinkedHashSet<>();
        allOrigins.add("https://app.medev.mrsgemaseny.com");
        allOrigins.add("https://medev.mrsgemaseny.com");
        allOrigins.add("https://me-dev-two.vercel.app");
        allOrigins.add("https://mrsgemaseny.github.io");
        allOrigins.add("http://localhost:5173");
        allOrigins.add("http://localhost:3000");
        allOrigins.add("capacitor://localhost");
        allOrigins.add("http://localhost");
        allOrigins.add("https://localhost");

        if (allowedOrigins != null && !allowedOrigins.isBlank()) {
            java.util.Arrays.stream(allowedOrigins.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isBlank())
                    .forEach(allOrigins::add);
        }

        java.util.List<String> exactOrigins = allOrigins.stream().filter(s -> !s.contains("*")).toList();
        java.util.List<String> patternOrigins = new java.util.ArrayList<>(allOrigins.stream().filter(s -> s.contains("*")).toList());
        if (!patternOrigins.contains("https://*.mrsgemaseny.com")) {
            patternOrigins.add("https://*.mrsgemaseny.com");
        }
        if (!patternOrigins.contains("https://*.vercel.app")) {
            patternOrigins.add("https://*.vercel.app");
        }

        if (!exactOrigins.isEmpty()) {
            configuration.setAllowedOrigins(exactOrigins);
        }
        if (!patternOrigins.isEmpty()) {
            configuration.setAllowedOriginPatterns(patternOrigins);
        }
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin", "*"));
        configuration.setExposedHeaders(List.of("Authorization", "Set-Cookie"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}
