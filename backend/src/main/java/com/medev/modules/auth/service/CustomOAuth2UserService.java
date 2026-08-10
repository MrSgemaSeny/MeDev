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
        
        Map<String, Object> attributes = oAuth2User.getAttributes();
        String githubId = String.valueOf(attributes.get("id"));
        String login = (String) attributes.get("login");
        String email = (String) attributes.get("email");
        String accessToken = userRequest.getAccessToken().getTokenValue();

        if (email == null) {
            // Если email скрыт в настройках GitHub, генерируем фейковый или запрашиваем отдельно
            email = login + "@github.user.medev.com";
        }
        
        final String finalEmail = email;

        User user = userRepository.findByEmail(finalEmail).orElseGet(() -> {
            // Проверка на занятый username
            String username = login.toLowerCase();
            if (userRepository.existsByUsername(username)) {
                username = username + "_" + UUID.randomUUID().toString().substring(0, 4);
            }
            
            User newUser = User.builder()
                    .email(finalEmail)
                    .username(username)
                    .githubId(githubId)
                    .role(User.Role.USER)
                    .plan(User.Plan.FREE)
                    .build();
            User saved = userRepository.save(newUser);
            profileService.createEmptyProfile(saved);
            return saved;
        });

        // Обновляем токен GitHub, даже если пользователь уже существовал
        user.setGithubId(githubId);
        user.setGithubAccessToken(accessToken);
        userRepository.save(user);

        return new DefaultOAuth2User(
                Collections.singletonList(() -> "ROLE_" + user.getRole().name()),
                attributes,
                "login" // Поле из GitHub API, используемое как имя пользователя
        );
    }
}
