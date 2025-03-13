package com.adam9e96.wordlol.controller.interfaces.rest;

import com.adam9e96.wordlol.dto.response.DashBoardResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;

public interface DashboardController {
    @GetMapping
    ResponseEntity<DashBoardResponse> getDashboardData();
}
