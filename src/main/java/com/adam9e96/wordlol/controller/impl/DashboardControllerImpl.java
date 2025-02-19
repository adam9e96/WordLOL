package com.adam9e96.wordlol.controller.impl;


import com.adam9e96.wordlol.controller.interfaces.DashboardController;
import com.adam9e96.wordlol.dto.DashBoardResponse;
import com.adam9e96.wordlol.service.interfaces.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardControllerImpl implements DashboardController {

    private final DashboardService dashboardService;

    @Override
    @GetMapping
    public ResponseEntity<DashBoardResponse> getDashboardData() {
        return ResponseEntity.ok().body(dashboardService.getDashboardData());
    }

}
