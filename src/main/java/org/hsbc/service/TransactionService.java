package org.hsbc.service;

import org.hsbc.entity.TransactionEntity;

import java.util.List;

public interface TransactionService {
    TransactionEntity addTransaction(TransactionEntity transaction);

    List<TransactionEntity> getAllTransactions();

    List<TransactionEntity> getTransactionsBySymbol(String symbol);

}
