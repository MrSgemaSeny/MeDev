package com.medev.modules.auth.service;

import com.medev.modules.auth.entity.User;
import com.medev.modules.auth.repository.UserRepository;
import com.medev.modules.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.Cookie;
import com.medev.shared.security.JwtService;

import com.medev.modules.audit.service.AuditService;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final ProfileService profileService;
    private final JwtService jwtService;
    private final AuditService auditService;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email;
        String providerId;
        String username;
        String nameAttributeKey;
        String avatarUrl = null;

        if ("github".equals(registrationId)) {
            providerId = String.valueOf(attributes.get("id"));
            String login = (String) attributes.get("login");
            String accessToken = userRequest.getAccessToken().getTokenValue();
            email = fetchGitHubPrimaryEmail(accessToken);
            if (email == null) {
                email = (String) attributes.get("email");
            }
            if (email == null) {
                email = login + "@github.user.medev.com";
            }
            username = login != null ? login.toLowerCase() : "github_user";
            nameAttributeKey = "login";
            avatarUrl = (String) attributes.get("avatar_url");
        } else if ("google".equals(registrationId)) {
            providerId = (String) attributes.get("sub");
            Boolean emailVerified = (Boolean) attributes.get("email_verified");
            if (emailVerified != null && !emailVerified) {
                throw new OAuth2AuthenticationException("Google email is not verified");
            }
            email = (String) attributes.get("email");
            String rawUsername = email != null && email.contains("@")
                    ? email.substring(0, email.indexOf("@")).toLowerCase().replaceAll("[^a-z0-9._-]", "")
                    : "";
            username = rawUsername.isBlank() ? "user_" + UUID.randomUUID().toString().substring(0, 8) : rawUsername;
            nameAttributeKey = "sub";
            avatarUrl = (String) attributes.get("picture");
        } else {
            throw new OAuth2AuthenticationException("Unsupported OAuth2 provider: " + registrationId);
        }
        
        boolean isLinking = false;
        Long currentUserId = null;
        
        ServletRequestAttributes attr = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attr != null) {
            HttpServletRequest request = attr.getRequest();
            if (request.getCookies() != null) {
                for (Cookie c : request.getCookies()) {
                    if ("medev_link_jwt".equals(c.getName())) {
                        String token = c.getValue();
                        try {
                            if (jwtService.validateToken(token)) {
                                currentUserId = jwtService.extractUserId(token);
                                isLinking = true;
                            }
                        } catch (Exception ignored) {}
                        break;
                    }
                }
            }
        }

        final String finalEmail = email;
        final String finalUsername = username;
        final String finalProviderId = providerId;
        final boolean linkingFlow = isLinking;

        User user;
        
        if (linkingFlow && currentUserId != null) {
            user = userRepository.findById(currentUserId)
                    .orElseThrow(() -> new OAuth2AuthenticationException("User not found for linking"));
        } else {
            user = userRepository.findByEmail(finalEmail).orElseGet(() -> {
                String uname = finalUsername;
                if (uname == null || uname.isBlank()) {
                    uname = "user_" + UUID.randomUUID().toString().substring(0, 8);
                }
                
                if (com.medev.modules.auth.service.AuthService.RESERVED_USERNAMES.contains(uname)) {
                    uname = uname + "_" + UUID.randomUUID().toString().substring(0, 4);
                }

                if (userRepository.existsByUsername(uname)) {
                    uname = uname + "_" + UUID.randomUUID().toString().substring(0, 4);
                }

                User.UserBuilder builder = User.builder()
                        .email(finalEmail)
                        .username(uname)
                        .role(User.Role.USER)
                        .plan(User.Plan.FREE);

                if ("github".equals(registrationId)) {
                    builder.githubId(finalProviderId);
                } else if ("google".equals(registrationId)) {
                    builder.googleId(finalProviderId);
                }

                User saved = userRepository.save(builder.build());
                profileService.createEmptyProfile(saved);
                auditService.logAction(saved.getId(), "AUTH_OAUTH_REGISTER_SUCCESS", String.valueOf(saved.getId()), "User registered via OAuth provider: " + registrationId, null);
                return saved;
            });
        }

        // Обновляем provider ID для существующего пользователя
        if ("github".equals(registrationId)) {
            user.setGithubId(providerId);
            String accessToken = userRequest.getAccessToken().getTokenValue();
            user.setGithubAccessToken(accessToken);
            
            String login = (String) attributes.get("login");
            if (login != null) {
                profileService.setGithubUsernameIfMissing(user.getId(), login);
            }
        } else if ("google".equals(registrationId)) {
            user.setGoogleId(providerId);
        }
        userRepository.save(user);

        if (avatarUrl != null && !avatarUrl.isBlank()) {
            profileService.setAvatarIfMissing(user.getId(), avatarUrl);
        }

        // Для Google нужно добавить "email" в attributes для SuccessHandler,
        // т.к. DefaultOAuth2User требует nameAttributeKey в attributes map
        Map<String, Object> enrichedAttributes = new HashMap<>(attributes);
        enrichedAttributes.put("_provider", registrationId);
        // User could have been looked up by currentUserId, so their actual email might differ from finalEmail
        enrichedAttributes.put("_email", user.getEmail());
        if (linkingFlow) {
            enrichedAttributes.put("_action", "LINK_ACCOUNT");
        }

        return new DefaultOAuth2User(
                Collections.singletonList(() -> "ROLE_" + user.getRole().name()),
                enrichedAttributes,
                nameAttributeKey
        );
    }

    private String fetchGitHubPrimaryEmail(String accessToken) {
        if (accessToken == null || accessToken.isBlank()) {
            return null;
        }
        try {
            org.springframework.web.client.RestClient restClient = org.springframework.web.client.RestClient.create();
            java.util.List<Map<String, Object>> emails = restClient.get()
                    .uri("https://api.github.com/user/emails")
                    .header("Authorization", "Bearer " + accessToken)
                    .header("Accept", "application/vnd.github+json")
                    .retrieve()
                    .body(new org.springframework.core.ParameterizedTypeReference<java.util.List<Map<String, Object>>>() {});
            if (emails != null) {
                for (Map<String, Object> emailObj : emails) {
                    Boolean primary = (Boolean) emailObj.get("primary");
                    Boolean verified = (Boolean) emailObj.get("verified");
                    if (Boolean.TRUE.equals(primary) && Boolean.TRUE.equals(verified)) {
                        return (String) emailObj.get("email");
                    }
                }
                for (Map<String, Object> emailObj : emails) {
                    Boolean verified = (Boolean) emailObj.get("verified");
                    if (Boolean.TRUE.equals(verified)) {
                        return (String) emailObj.get("email");
                    }
                }
            }
        } catch (Exception ignored) {
            // fallback if scope doesn't allow or network error
        }
        return null;
    }
}
