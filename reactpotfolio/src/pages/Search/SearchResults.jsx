import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './SearchResults.css';

const SearchResults = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [searchInput, setSearchInput] = useState(query || '');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const url = "http://localhost:8080/api/yfdata/search";

    async function fetchSearchResults(query) {
        const response = await fetch(`${url}?q=${query}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    }

    useEffect(() => {
        if (query) {
            setSearchInput(query);
            setLoading(true);
            fetchSearchResults(query)
                .then(data => {
                    console.log("Search results:", data);
                    setResults(data);
                })
                .catch(error => {
                    console.error("Error fetching search results:", error);
                    setResults({ stocks: [], cryptos: [], mutualFunds: [], commodities: [] });
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [query]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            setSearchParams({ q: searchInput.trim() });
        }
    };

    const handleAssetClick = (symbol, type) => {
        // Navigate to asset details or handle click
        console.log(`Clicked ${type}: ${symbol}`);
    
        navigate(`/asset/${type}/${symbol}`);
    };

    const getChangeColor = (change) => {
        if (!change) return 'var(--text-secondary)';
        return change >= 0 ? '#10b981' : '#ef4444';
    };

    const formatPrice = (price, currency = 'USD') => {
        if (!price) return 'N/A';
        const symbols = { USD: '$', GBP: '£', INR: '₹', EUR: '€' };
        return `${symbols[currency] || currency} ${price.toFixed(2)}`;
    };

    const formatChange = (change, percent) => {
        if (change === null || change === undefined) return '';
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(2)} (${sign}${percent?.toFixed(2)}%)`;
    };

    const AssetCard = ({ asset, type }) => (
        <div className="asset-card" onClick={() => handleAssetClick(asset.symbol, type)}>
            <div className="asset-card-header">
                <div className="asset-info">
                    <div className="asset-symbol">{asset.symbol}</div>
                    <div className="asset-name">{asset.shortName || asset.longname}</div>
                </div>
                <div className="asset-price-info">
                    <div className="asset-price">
                        {formatPrice(asset.regularMarketPrice, asset.currency)}
                    </div>
                    {asset.regularMarketChange !== undefined && (
                        <div 
                            className="asset-change" 
                            style={{ color: getChangeColor(asset.regularMarketChange) }}
                        >
                            {formatChange(asset.regularMarketChange, asset.regularMarketPercentChange)}
                        </div>
                    )}
                </div>
            </div>
            <div className="asset-card-details">
                {asset.exchange && (
                    <span className="asset-badge">{asset.exchange}</span>
                )}
                {asset.industryName && (
                    <span className="asset-badge">{asset.industryName}</span>
                )}
                {asset.quoteType && (
                    <span className="asset-badge">{asset.quoteType}</span>
                )}
            </div>
        </div>
    );

    const ResultSection = ({ title, items, type, icon }) => {
        if (!items || items.length === 0) return null;
        
        return (
            <div className="result-section">
                <div className="section-header">
                    <span className="section-icon">{icon}</span>
                    <h3 className="section-title">{title}</h3>
                    <span className="section-count">{items.length} result{items.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="asset-scroll-container">
                    {items.map((item, index) => (
                        <AssetCard key={item.symbol || index} asset={item} type={type} />
                    ))}
                </div>
            </div>
        );
    };

    const hasResults = results && (
        (results.stocks && results.stocks.length > 0) ||
        (results.cryptos && results.cryptos.length > 0) ||
        (results.mutualFunds && results.mutualFunds.length > 0) ||
        (results.commodities && results.commodities.length > 0)
    );

    return (
        <div className="search-results-page">
            <div className="search-header">
                <h1 className="page-title">Search Assets</h1>
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-input-wrapper">
                        <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search stocks, crypto, funds, commodities..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                        <button type="submit" className="search-button">
                            Search
                        </button>
                    </div>
                </form>
                {query && results && (
                    <div className="search-query">
                        Showing results for <strong>"{query}"</strong>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Searching financial markets...</p>
                </div>
            ) : hasResults ? (
                <div className="results-container">
                    <ResultSection 
                        title="Stocks" 
                        items={results.stocks} 
                        type="stock"
                        icon="📈"
                    />
                    <ResultSection 
                        title="Cryptocurrencies" 
                        items={results.cryptos} 
                        type="crypto"
                        icon="₿"
                    />
                    <ResultSection 
                        title="Mutual Funds" 
                        items={results.mutualFunds} 
                        type="fund"
                        icon="📊"
                    />
                    <ResultSection 
                        title="Commodities" 
                        items={results.commodities} 
                        type="commodity"
                        icon="🥇"
                    />
                </div>
            ) : results ? (
                <div className="no-results">
                    <div className="no-results-icon">🔍</div>
                    <h2>No results found</h2>
                    <p>We couldn't find any matches for "{query}"</p>
                    <p className="suggestion">Try searching with a different ticker symbol or company name</p>
                </div>
            ) : null}
        </div>
    );
};

export default SearchResults;
