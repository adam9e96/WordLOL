package com.adam9e96.wordlol.controller.impl.view;

import com.adam9e96.wordlol.controller.interfaces.view.ErrorController;
import org.springframework.stereotype.Controller;

@Controller
public class ErrorControllerImpl implements ErrorController {
    @Override
    public String accessDenied() {
        return "views/error/access-denied";
    }
}
