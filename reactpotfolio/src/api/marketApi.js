import { JAVA_API_URL, fetchWithTimeout, handleApiError } from './config';

// Base API URL - uses Java backend proxy
const API_BASE_URL = JAVA_API_URL;

/**
 * Get stock data by symbol
 */
export const getStockData = async (symbol) => {
    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/stocks/${symbol}`);
        if (!response.ok) throw new Error('Stock not found');
        return await response.json();
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Get cryptocurrency data by symbol
 */
export const getCryptoData = async (symbol) => {
    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/crypto/${symbol}`);
        if (!response.ok) throw new Error('Crypto not found');
        return await response.json();
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Get mutual fund data by symbol
 */
export const getMutualFundData = async (symbol) => {
    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/mutual-funds/${symbol}`);
        if (!response.ok) throw new Error('Mutual fund not found');
        return await response.json();
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Get commodity data by symbol
 */
export const getCommodityData = async (symbol) => {
    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/commodities/${symbol}`);
        if (!response.ok) throw new Error('Commodity not found');
        return await response.json();
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Get historical price data
 * @param {string} symbol - Asset symbol
 * @param {string} period - Time period (1D, 5D, 1W, 1MO, 3MO, 6MO, 1Y, 2Y)
 */
export const getAssetPriceHistory = async (symbol, period = '1MO') => {
    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/history/${symbol}?period=${period}`);
        if (!response.ok) throw new Error('History not found');
        const data = await response.json();
        
        // Transform to format expected by charts
        return data.data.map(item => ({
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            price: item.close,
            open: item.open,
            high: item.high,
            low: item.low,
            volume: item.volume
        }));
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Get news for a symbol
 */
export const getNews = async (symbol) => {
    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/news/${symbol}`);
        if (!response.ok) throw new Error('News not found');
        return await response.json();
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Search for assets
 */
export const searchAssets = async (query) => {
    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Search failed');
        
        return await response.json();
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Get portfolio performers (best and worst)
 */
export const getPortfolioPerformers = async (holdings) => {
    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/portfolio/performers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ holdings })
        });
        if (!response.ok) throw new Error('Failed to analyze portfolio');
        return await response.json();
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Get AI-powered portfolio recommendations
 */
export const getPortfolioRecommendations = async (holdings) => {
    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/portfolio/recommendations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ holdings })
        });
        if (!response.ok) throw new Error('Failed to get recommendations');
        return await response.json();
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Get stock analysis (sentiment + analyst recommendations)
 */
export const getStockAnalysis = async (symbol, inPortfolio = false, buyPrice = null) => {
    try {
        let url = `${API_BASE_URL}/stock/${symbol}/analysis?inPortfolio=${inPortfolio}`;
        if (buyPrice !== null) {
            url += `&buyPrice=${buyPrice}`;
        }
        const response = await fetchWithTimeout(url);
        if (!response.ok) throw new Error('Failed to analyze stock');
        return await response.json();
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Get historical price data for a symbol
 * @param {string} symbol - Asset symbol
 * @param {string} period - Time period (1d, 5d, 1mo, 3mo, 6mo, 1y, 5y, max)
 * @param {string} interval - Data interval (1m, 5m, 1h, 1d, 1mo)
 */
export const getHistoryData = async (symbol, period, interval) => {
    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/history/${symbol}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ period, interval }),
        });
        if (!response.ok) throw new Error('History not found');
        return await response.json();
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Health check for the API
 */
export const checkApiHealth = async () => {
    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/health`);
        return await response.json();
    } catch (error) {
        return handleApiError(error);
    }
};
