package com.adam9e96.wordlol.controller.interfaces.view;

import org.springframework.web.bind.annotation.GetMapping;

public interface ErrorController {
    @GetMapping("/access-denied")
    String accessDenied();
}
