package org.hsbc.service;

import java.util.List;
import org.hsbc.entity.PmsEntity;
import org.hsbc.exception.InvalidPmsIdException;

public interface PmsService {

    PmsEntity addAsset(PmsEntity asset);

    void removeAsset(Long id) throws InvalidPmsIdException;

    PmsEntity updateQuantity(Long id, int newQuantity) throws InvalidPmsIdException;

    double calculatePL(Long id) throws InvalidPmsIdException;

    double calculatePLPercentage(Long id) throws InvalidPmsIdException;

    double getTotalPortfolioValue();

    List<PmsEntity> getAllAssets();

    PmsEntity getAssetById(Long id) throws InvalidPmsIdException;

}