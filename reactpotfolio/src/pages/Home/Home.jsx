import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PortfolioChart from '../../components/charts/PortfolioChart';
import PerformanceCard from '../../components/cards/PerformanceCard';
import AssetDetailsModal from '../../components/modals/AssetDetailsModal';
import { getPortfolioSummary, getPortfolioPerformance, getAssetAllocation } from '../../api/portfolioApi';
import { getAssets } from '../../api/assetsApi';
import AssetAllocationPieChart from '../../components/charts/AssetAllocationPieChart';
import { getAssetPriceHistory } from '../../api/marketApi';
import './Home.css';

import { formatCurrency } from '../../utils/formatCurrency';
import { formatPercentage } from '../../utils/formatPercentage';
import PriceChart from '../../components/charts/PriceChart'; // Temporary Validation

const Home = () => {
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [allocationData, setAllocationData] = useState(null);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [historyData, setHistoryData] = useState([]);



    useEffect(() => {
        const fetchData = async () => {
            try {
                const summaryData = await getPortfolioSummary();
                const performanceData = await getPortfolioPerformance();
                const allocation = await getAssetAllocation();
                const assetsData = await getAssets();
                setSummary(summaryData);
                setChartData(performanceData);
                setAllocationData(allocation);
                setAssets(assetsData);
            } catch (error) {
                console.error("Failed to fetch portfolio data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCardClick = async (asset) => {
        const modalAsset = {
            ...asset,
            id: 'perf-' + asset.symbol // temporary ID to avoid key issues if passed as generic asset
        };
        setSelectedAsset(modalAsset);
        // Fetch specific history for this asset
        const history = await getAssetPriceHistory(asset.symbol);
        setHistoryData(history);
    };

    const handleCloseModal = () => {
        setSelectedAsset(null);
        setHistoryData([]);
    };

    if (loading) {
        return <div className="home-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>Loading...</div>;
    }

    // Calculate Investment Breakdown
    const investmentBreakdown = {
        'Stocks': 0,
        'Mutual Funds': 0,
        'Crypto': 0,
        'Commodities': 0
    };

    assets.forEach(asset => {
        if (investmentBreakdown[asset.assetType] !== undefined) {
            investmentBreakdown[asset.assetType] += asset.currentValue;
        }
    });

    return (
        <div className="home-page">
            <div className="hero-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>Hello, {summary.userName}</h1>

                <div className="portfolio-summary" style={{ textAlign: 'center', marginBottom: '25px', width: 'fit-content' }}>
                    <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Total Portfolio Value</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '5px' }}>{formatCurrency(summary.portfolioValue)}</div>
                    <div style={{ fontSize: '1.1rem' }}>
                        <span className="text-positive">{formatCurrency(summary.totalGain)} ({formatPercentage(summary.gainPercentage)})</span>
                    </div>
                </div>



            </div>

            <div className="chart-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <PortfolioChart data={chartData} />
                <AssetAllocationPieChart data={allocationData} />
            </div>

            <div className="performance-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                {/* Top Performers Column */}
                <div>
                    <h3 style={{ marginBottom: '15px', borderLeft: '4px solid #4caf50', paddingLeft: '10px' }}>Top Performers</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {[...assets]
                            .sort((a, b) => b.percentageChange - a.percentageChange)
                            .slice(0, 3)
                            .map(asset => (
                                <div key={`top-${asset.id}`} onClick={() => handleCardClick(asset)} style={{ cursor: 'pointer' }}>
                                    <PerformanceCard
                                        label="Top Performer"
                                        name={asset.companyName}
                                        value={asset.currentValue}
                                        percentage={asset.percentageChange}
                                        hideLabel={true}
                                    />
                                </div>
                            ))}
                        {assets.length === 0 && <div className="text-muted">No assets available.</div>}
                    </div>
                </div>

                {/* Lowest Performers Column */}
                <div>
                    <h3 style={{ marginBottom: '15px', borderLeft: '4px solid #f44336', paddingLeft: '10px' }}>Lowest Performers</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {[...assets]
                            .sort((a, b) => a.percentageChange - b.percentageChange)
                            .slice(0, 3)
                            .map(asset => (
                                <div key={`low-${asset.id}`} onClick={() => handleCardClick(asset)} style={{ cursor: 'pointer' }}>
                                    <PerformanceCard
                                        label="Lowest Performer"
                                        name={asset.companyName}
                                        value={asset.currentValue}
                                        percentage={asset.percentageChange}
                                        hideLabel={true}
                                    />
                                </div>
                            ))}
                        {assets.length === 0 && <div className="text-muted">No assets available.</div>}
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '40px', marginBottom: '40px' }}>
                <h3 style={{ marginBottom: '20px', paddingLeft: '10px', borderLeft: '4px solid #DB292D' }}>Investment Breakdown</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    {Object.entries(investmentBreakdown).map(([type, value]) => (
                        <div
                            key={type}
                            onClick={() => navigate('/holdings')}
                            className="card breakdown-card"
                            style={{
                                padding: '20px',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, background-color 0.2s',
                                backgroundColor: '#1e1e1e'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.backgroundColor = '#252525';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.backgroundColor = '#1e1e1e';
                            }}
                        >
                            <div className="text-muted text-sm" style={{ marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>{type}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: value > 0 ? 'white' : 'var(--text-secondary)' }}>
                                {formatCurrency(value)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>



            {
                selectedAsset && (
                    <AssetDetailsModal
                        asset={selectedAsset}
                        onClose={handleCloseModal}
                        historyData={historyData}
                        onSell={() => {
                            console.log("Sell requested from Home page - Read Only");
                            alert("Please go to Holdings page to manage assets.");
                        }}
                    />
                )
            }
        </div >
    );
};

export default Home;
