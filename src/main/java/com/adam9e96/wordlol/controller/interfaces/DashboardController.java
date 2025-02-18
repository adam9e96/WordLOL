package com.adam9e96.wordlol.controller.interfaces;

import com.adam9e96.wordlol.dto.DashBoardResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;

public interface DashboardController {
    @GetMapping
    ResponseEntity<DashBoardResponse> getDashboard();
}
