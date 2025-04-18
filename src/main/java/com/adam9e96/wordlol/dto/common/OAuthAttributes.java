package com.adam9e96.wordlol.dto.common;

import com.adam9e96.wordlol.entity.User;
import com.adam9e96.wordlol.enums.Role;
import lombok.Builder;

import java.util.Map;

public record OAuthAttributes(
        Map<String, Object> attributes,
        String nameAttributeKey,
        String name,
        String email,
        String picture) {
    @Builder
    public OAuthAttributes {

    }

    public static OAuthAttributes of(String registrationId,
                                     String userNameAttributeName,
                                     Map<String, Object> attributes) {
        return ofGoogle(userNameAttributeName, attributes);
    }

    private static OAuthAttributes ofGoogle(String userNameAttributeName,
                                            Map<String, Object> attributes) {
        return OAuthAttributes.builder()
                .name((String) attributes.get("name"))
                .email((String) attributes.get("email"))
                .picture((String) attributes.get("picture"))
                .attributes(attributes)
                .nameAttributeKey(userNameAttributeName)
                .build();
    }

    public User toEntity() {
        return User.builder()
                .name(name)
                .email(email)
                .picture(picture)
                .role(Role.USER)
                .build();
    }
}
