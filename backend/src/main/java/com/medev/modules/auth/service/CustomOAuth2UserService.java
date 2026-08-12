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

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final ProfileService profileService;

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

        if ("github".equals(registrationId)) {
            providerId = String.valueOf(attributes.get("id"));
            String login = (String) attributes.get("login");
            email = (String) attributes.get("email");
            if (email == null) {
                email = login + "@github.user.medev.com";
            }
            username = login.toLowerCase();
            nameAttributeKey = "login";
        } else if ("google".equals(registrationId)) {
            providerId = (String) attributes.get("sub");
            email = (String) attributes.get("email");
            String name = (String) attributes.get("name");
            // username из email: "john.doe@gmail.com" -> "john.doe"
            username = email.substring(0, email.indexOf("@")).toLowerCase().replaceAll("[^a-z0-9._-]", "");
            nameAttributeKey = "sub";
        } else {
            throw new OAuth2AuthenticationException("Unsupported OAuth2 provider: " + registrationId);
        }

        final String finalEmail = email;
        final String finalUsername = username;
        final String finalProviderId = providerId;

        User user = userRepository.findByEmail(finalEmail).orElseGet(() -> {
            String uname = finalUsername;
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
            return saved;
        });

        // Fix Pre-Account Creation vulnerability:
        // If the account was created via password and had no OAuth providers linked,
        // we invalidate the password when linking OAuth to lock out any potential attacker.
        if (user.getPassword() != null && user.getGithubId() == null && user.getGoogleId() == null) {
            user.setPassword(org.springframework.security.crypto.bcrypt.BCrypt.hashpw(
                    UUID.randomUUID().toString(), org.springframework.security.crypto.bcrypt.BCrypt.gensalt(12)
            ));
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

        // Для Google нужно добавить "email" в attributes для SuccessHandler,
        // т.к. DefaultOAuth2User требует nameAttributeKey в attributes map
        Map<String, Object> enrichedAttributes = new HashMap<>(attributes);
        enrichedAttributes.put("_provider", registrationId);
        enrichedAttributes.put("_email", finalEmail);

        return new DefaultOAuth2User(
                Collections.singletonList(() -> "ROLE_" + user.getRole().name()),
                enrichedAttributes,
                nameAttributeKey
        );
    }
}
