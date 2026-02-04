package org.hsbc.controller;

import org.hsbc.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
@RestController
@RequestMapping("/dashboard")
public class DashboardController {
    private final DashboardService service;

    public DashboardController(DashboardService service) {
        this.service = service;
    }

    @GetMapping("/wallet-summary")
    public Map<String, Double> getWalletSummary() {

        Map<String, Double> response = new HashMap<>();
        response.put("totalBalance",
                service.getAvailableBalance()
                        + service.getTotalUsedBalance());
        response.put("totalUsed",
                service.getTotalUsedBalance());
        response.put("availableBalance",
                service.getAvailableBalance());

        return response;
    }
}
