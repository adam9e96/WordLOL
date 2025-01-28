package com.adam9e96.WordLOL.controller;


import com.adam9e96.WordLOL.dto.DashBoardResponse;
import com.adam9e96.WordLOL.service.DashboardService;
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
