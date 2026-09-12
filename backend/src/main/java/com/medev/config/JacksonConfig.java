package com.medev.config;

import com.fasterxml.jackson.core.json.JsonReadFeature;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jsonCustomizer() {
        return builder -> {
            builder.modules(new JavaTimeModule());
            builder.featuresToDisable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
            builder.featuresToEnable(DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT);
            builder.featuresToEnable(DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY);
            builder.featuresToEnable(
                    JsonReadFeature.ALLOW_TRAILING_COMMA.mappedFeature(),
                    JsonReadFeature.ALLOW_UNQUOTED_FIELD_NAMES.mappedFeature(),
                    JsonReadFeature.ALLOW_SINGLE_QUOTES.mappedFeature(),
                    JsonReadFeature.ALLOW_UNESCAPED_CONTROL_CHARS.mappedFeature(),
                    JsonReadFeature.ALLOW_JAVA_COMMENTS.mappedFeature()
            );
        };
    }
}
