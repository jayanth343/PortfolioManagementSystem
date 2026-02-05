package org.hsbc.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class TransactionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long transactionId;

    String symbol;
    int quantity;
    double buyPrice;
    LocalDateTime transactionDate;

    String transactionType;

    public TransactionEntity() {
    }

    public TransactionEntity(Long transactionId, String symbol, int quantity, double buyPrice, LocalDateTime transactionDate, String transactionType) {
        this.transactionId = transactionId;
        this.symbol = symbol;
        this.quantity = quantity;
        this.buyPrice = buyPrice;
        this.transactionDate = transactionDate;
        this.transactionType = transactionType;
    }

    public TransactionEntity(String symbol, int quantity, double buyPrice, LocalDateTime transactionDate, String transactionType) {
        this.symbol = symbol;
        this.quantity = quantity;
        this.buyPrice = buyPrice;
        this.transactionDate = transactionDate;
        this.transactionType = transactionType;
    }

    public Long getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(Long transactionId) {
        this.transactionId = transactionId;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public double getBuyPrice() {
        return buyPrice;
    }

    public void setBuyPrice(double buyPrice) {
        this.buyPrice = buyPrice;
    }

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDateTime transactionDate) {
        this.transactionDate = transactionDate;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    @Override
    public String toString() {
        return "TransactionEntity{" +
                "transactionId=" + transactionId +
                ", symbol='" + symbol + '\'' +
                ", quantity=" + quantity +
                ", buyPrice=" + buyPrice +
                ", transactionDate=" + transactionDate +
                ", transactionType='" + transactionType + '\'' +
                '}';
    }
}
