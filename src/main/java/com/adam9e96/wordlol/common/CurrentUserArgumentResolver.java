package com.adam9e96.wordlol.common;

import com.adam9e96.wordlol.config.security.jwt.JwtTokenProvider;
import com.adam9e96.wordlol.dto.common.CurrentUser;
import com.adam9e96.wordlol.entity.User;
import com.adam9e96.wordlol.repository.jpa.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.MethodParameter;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

@RequiredArgsConstructor
@Component
public class CurrentUserArgumentResolver implements HandlerMethodArgumentResolver {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        boolean isCurrentUserAnnotation = parameter.getParameterAnnotation(CurrentUser.class) != null;
        boolean isUserClass = User.class.equals(parameter.getParameterType());
        return isCurrentUserAnnotation && isUserClass;
    }

    @Override
    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {

        HttpServletRequest request = (HttpServletRequest) webRequest.getNativeRequest();
        String token = jwtTokenProvider.resolveToken(request);

        if (token != null && jwtTokenProvider.validateToken(token)) {
            String email = jwtTokenProvider.getEmailFromToken(token);
            return userRepository.findByEmail(email).orElse(null);
        }

        return null;
    }
}
