package org.hsbc.controller;

import org.hsbc.entity.TransactionEntity;
import org.hsbc.service.TransactionService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/transactions")
public class TransactionController {

    private final TransactionService service;

    public TransactionController(TransactionService service) {
        this.service = service;
    }

    // 1️⃣ Add transaction
    @PostMapping("/add")
    public TransactionEntity addTransaction(
            @RequestBody TransactionEntity transaction) {
        return service.addTransaction(transaction);
    }

    // 2️⃣ Get all transactions
    @GetMapping("/all")
    public List<TransactionEntity> getAllTransactions() {
        return service.getAllTransactions();
    }

    // 3️⃣ Get transactions by symbol
    @GetMapping("/symbol/{symbol}")
    public List<TransactionEntity> getBySymbol(
            @PathVariable String symbol) {
        return service.getTransactionsBySymbol(symbol);
    }
}
