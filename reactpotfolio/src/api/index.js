export * from './portfolioApi';
export * from './assetsApi';
export * from './marketApi';

// Re-export specific functions for convenience
export { 
    getStockData, 
    getCryptoData, 
    getMutualFundData,
    getCommodityData,
    searchAssets,
    getPortfolioPerformers,
    getPortfolioRecommendations,
    getStockAnalysis
} from './marketApi';
