package org.hsbc.service;

import org.hsbc.entity.PmsEntity;

public interface PmsService {
    PmsEntity addAsset(PmsEntity asset);

    void removeAsset(Long id);

    PmsEntity updateQuantity(Long id, int newQuantity);

    double calculatePL(Long id);

    double calculatePLPercentage(Long id);

    double getTotalPortfolioValue();
}
