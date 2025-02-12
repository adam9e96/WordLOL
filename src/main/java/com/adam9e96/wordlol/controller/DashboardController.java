package com.adam9e96.wordlol.controller;


import com.adam9e96.wordlol.dto.DashBoardResponse;
import com.adam9e96.wordlol.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashBoardResponse> getDashboard() {
        return ResponseEntity.ok().body(dashboardService.getDashboardData());
    }



}
