package org.hsbc.entity;

import jakarta.persistence.*;


@Entity
public class PmsEntity
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    long id;
    String companyName;
    String symbol;
    int quantity;
    double buyPrice;
    double currentPrice;
    double buyingValue;
    String currency;
    String exchange;
    String industry;
    String assetType;

    public PmsEntity() {
    }

    public PmsEntity(long id, String companyName, String symbol, int quantity, double buyPrice, double currentPrice, double buyingValue, String currency, String exchange, String industry, String assetType) {
        this.id = id;
        this.companyName = companyName;
        this.symbol = symbol;
        this.quantity = quantity;
        this.buyPrice = buyPrice;
        this.currentPrice = currentPrice;
        this.buyingValue = buyingValue;
        this.currency = currency;
        this.exchange = exchange;
        this.industry = industry;
        this.assetType = assetType;
    }

    public PmsEntity(String companyName, String symbol, int quantity, double buyPrice, double currentPrice, double buyingValue, String currency, String exchange, String industry, String assetType) {
        this.companyName = companyName;
        this.symbol = symbol;
        this.quantity = quantity;
        this.buyPrice = buyPrice;
        this.currentPrice = currentPrice;
        this.buyingValue = buyingValue;
        this.currency = currency;
        this.exchange = exchange;
        this.industry = industry;
        this.assetType = assetType;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
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

    public double getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(double currentPrice) {
        this.currentPrice = currentPrice;
    }

    public double getBuyingValue() {
        return buyingValue;
    }

    public void setBuyingValue(double buyingValue) {
        this.buyingValue = buyingValue;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getExchange() {
        return exchange;
    }

    public void setExchange(String exchange) {
        this.exchange = exchange;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public String getAssetType() {
        return assetType;
    }

    public void setAssetType(String assetType) {
        this.assetType = assetType;
    }

    @Override
    public String toString() {
        return "PmsEntity{" +
                "id=" + id +
                ", companyName='" + companyName + '\'' +
                ", symbol='" + symbol + '\'' +
                ", quantity=" + quantity +
                ", buyPrice=" + buyPrice +
                ", currentPrice=" + currentPrice +
                ", buyingValue=" + buyingValue +
                ", currency='" + currency + '\'' +
                ", exchange='" + exchange + '\'' +
                ", industry='" + industry + '\'' +
                ", assetType='" + assetType + '\'' +
                '}';
    }
}
