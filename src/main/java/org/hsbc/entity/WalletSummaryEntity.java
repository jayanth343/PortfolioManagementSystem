package org.hsbc.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "wallet_summary")
public class WalletSummaryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double totalBalance;
    private double totalUsed;

    public Long getId() {
        return id;
    }

    public double getTotalBalance() {
        return totalBalance;
    }

    public double getTotalUsed() {
        return totalUsed;
    }
}
