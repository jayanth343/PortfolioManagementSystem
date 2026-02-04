package org.hsbc.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "wallet")
public class WalletEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    double balance;

    public WalletEntity(Long id, double balance) {
        this.id = id;
        this.balance = balance;
    }

    public WalletEntity() {
    }

    public WalletEntity(double balance) {
        this.balance = balance;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public double getBalance() {
        return balance;
    }

    public void setBalance(double balance) {
        this.balance = balance;
    }

    @Override
    public String toString() {
        return "WalletEntity{" +
                "id=" + id +
                ", balance=" + balance +
                '}';
    }
}
