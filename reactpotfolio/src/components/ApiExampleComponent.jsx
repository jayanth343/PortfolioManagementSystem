import React, { useState, useEffect } from 'react';
import { 
    getStockData, 
    searchAssets, 
    getPortfolioPerformers,
    getStockAnalysis 
} from '../api';

/**
 * Example component demonstrating API integration
 * This shows how to use the market data API functions
 */
function ApiExampleComponent() {
    const [stockData, setStockData] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [performers, setPerformers] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Example 1: Fetch stock data
    const fetchStockData = async (symbol) => {
        setLoading(true);
        setError(null);
        
        const data = await getStockData(symbol);
        
        if (data.error) {
            setError(data.error);
        } else {
            setStockData(data);
        }
        
        setLoading(false);
    };

    // Example 2: Search for assets
    const searchForAssets = async (query) => {
        setLoading(true);
        setError(null);
        
        const results = await searchAssets(query);
        
        if (results.error) {
            setError(results.error);
        } else {
            setSearchResults(results);
        }
        
        setLoading(false);
    };

    // Example 3: Analyze portfolio
    const analyzePortfolio = async () => {
        setLoading(true);
        setError(null);
        
        // Sample portfolio holdings
        const sampleHoldings = [
            { 
                symbol: 'AAPL', 
                quantity: 10, 
                buy_price: 150.0, 
                purchase_date: '2024-01-15' 
            },
            { 
                symbol: 'GOOGL', 
                quantity: 5, 
                buy_price: 140.0, 
                purchase_date: '2024-02-01' 
            },
            { 
                symbol: 'MSFT', 
                quantity: 8, 
                buy_price: 380.0, 
                purchase_date: '2024-03-10' 
            }
        ];
        
        const analysis = await getPortfolioPerformers(sampleHoldings);
        
        if (analysis.error) {
            setError(analysis.error);
        } else {
            setPerformers(analysis);
        }
        
        setLoading(false);
    };

    // Example 4: Get stock analysis with sentiment
    const analyzeStock = async (symbol, inPortfolio = false, buyPrice = null) => {
        setLoading(true);
        setError(null);
        
        const analysis = await getStockAnalysis(symbol, inPortfolio, buyPrice);
        
        if (analysis.error) {
            setError(analysis.error);
        } else {
            console.log('Stock Analysis:', analysis);
            // Use analysis data in your component
        }
        
        setLoading(false);
    };

    // Auto-fetch Apple stock on component mount
    useEffect(() => {
        fetchStockData('AAPL');
    }, []);

    return (
        <div className="api-example">
            <h1>API Integration Examples</h1>

            {loading && <div className="loading">Loading...</div>}
            {error && <div className="error">Error: {error}</div>}

            {/* Example 1: Stock Data Display */}
            <section>
                <h2>Stock Data Example</h2>
                <button onClick={() => fetchStockData('AAPL')}>
                    Get Apple Stock
                </button>
                <button onClick={() => fetchStockData('GOOGL')}>
                    Get Google Stock
                </button>
                
                {stockData && (
                    <div className="stock-info">
                        <h3>{stockData.name} ({stockData.symbol})</h3>
                        <p>Current Price: ${stockData.current_price?.toFixed(2)}</p>
                        <p>Previous Close: ${stockData.previous_close?.toFixed(2)}</p>
                        <p>Market Cap: ${(stockData.market_cap / 1e9).toFixed(2)}B</p>
                        <p>Volume: {stockData.volume?.toLocaleString()}</p>
                        <p>Sector: {stockData.sector}</p>
                        <p>Industry: {stockData.industry}</p>
                    </div>
                )}
            </section>

            {/* Example 2: Asset Search */}
            <section>
                <h2>Asset Search Example</h2>
                <button onClick={() => searchForAssets('apple')}>
                    Search "apple"
                </button>
                <button onClick={() => searchForAssets('microsoft')}>
                    Search "microsoft"
                </button>
                
                {searchResults.length > 0 && (
                    <div className="search-results">
                        <h3>Search Results:</h3>
                        <ul>
                            {searchResults.slice(0, 5).map((result, index) => (
                                <li key={index}>
                                    <strong>{result.symbol}</strong> - {result.name}
                                    <br />
                                    <small>
                                        {result.exchange} | Type: {result.type}
                                    </small>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </section>

            {/* Example 3: Portfolio Analysis */}
            <section>
                <h2>Portfolio Analysis Example</h2>
                <button onClick={analyzePortfolio}>
                    Analyze Sample Portfolio
                </button>
                
                {performers && (
                    <div className="portfolio-performers">
                        <div className="best-performers">
                            <h3>Best Performers (≥5%)</h3>
                            {performers.best_performers?.length > 0 ? (
                                <ul>
                                    {performers.best_performers.map((asset, index) => (
                                        <li key={index}>
                                            <strong>{asset.symbol}</strong>
                                            <br />
                                            Gain: {asset.gain_percentage?.toFixed(2)}%
                                            <br />
                                            Value: ${asset.current_value?.toFixed(2)}
                                            <br />
                                            Annualized Return: {asset.annualized_return?.toFixed(2)}%
                                            <br />
                                            Portfolio Weight: {asset.portfolio_weight?.toFixed(2)}%
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No best performers (threshold ≥5%)</p>
                            )}
                        </div>
                        
                        <div className="worst-performers">
                            <h3>Worst Performers (≤-5%)</h3>
                            {performers.worst_performers?.length > 0 ? (
                                <ul>
                                    {performers.worst_performers.map((asset, index) => (
                                        <li key={index}>
                                            <strong>{asset.symbol}</strong>
                                            <br />
                                            Loss: {asset.gain_percentage?.toFixed(2)}%
                                            <br />
                                            Value: ${asset.current_value?.toFixed(2)}
                                            <br />
                                            Annualized Return: {asset.annualized_return?.toFixed(2)}%
                                            <br />
                                            Portfolio Weight: {asset.portfolio_weight?.toFixed(2)}%
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No worst performers (threshold ≤-5%)</p>
                            )}
                        </div>
                    </div>
                )}
            </section>

            {/* Example 4: Stock Analysis */}
            <section>
                <h2>Stock Analysis Example</h2>
                <button onClick={() => analyzeStock('AAPL', true, 150)}>
                    Analyze AAPL (in portfolio)
                </button>
                <button onClick={() => analyzeStock('TSLA', false)}>
                    Analyze TSLA (not in portfolio)
                </button>
                <p>
                    <small>Check browser console for analysis results</small>
                </p>
            </section>
        </div>
    );
}

export default ApiExampleComponent;

/**
 * Usage Notes:
 * 
 * 1. Import this component in your App.jsx to test:
 *    import ApiExampleComponent from './components/ApiExampleComponent';
 * 
 * 2. Add to your routes or main component:
 *    <ApiExampleComponent />
 * 
 * 3. Ensure backends are running:
 *    - Flask: http://localhost:5000
 *    - Java: http://localhost:8080
 * 
 * 4. All API functions handle errors gracefully and return:
 *    { error: "error message" } on failure
 *    or the actual data on success
 * 
 * 5. Common patterns:
 * 
 *    const data = await getStockData('AAPL');
 *    if (data.error) {
 *        // Handle error
 *        setError(data.error);
 *    } else {
 *        // Use data
 *        setStockData(data);
 *    }
 */
