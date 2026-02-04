package org.hsbc.controller;

import org.hsbc.service.WalletService;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/wallet")
public class WalletController {

    private final WalletService service;

    public WalletController(WalletService service) {
        this.service = service;
    }

    // 1️⃣ Show wallet balance
    @GetMapping("/balance")
    public double getBalance() {
        return service.getBalance();
    }

    // 2️⃣ Add money
    @PostMapping("/add")
    public double addMoney(@RequestParam double amount) {
        return service.addMoney(amount);
    }

    // 3️⃣ Deduct money
    @PostMapping("/deduct")
    public double deductMoney(@RequestParam double amount) {
        return service.deductMoney(amount);
    }
}
