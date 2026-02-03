import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PortfolioChart from '../../components/charts/PortfolioChart';
import PerformanceCard from '../../components/cards/PerformanceCard';
import AssetDetailsModal from '../../components/modals/AssetDetailsModal';
import { getPortfolioSummary, getPortfolioPerformance } from '../../api/portfolioApi';
import { getAssetPriceHistory } from '../../api/marketApi';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [historyData, setHistoryData] = useState([]);

    const topPerformer = {
        companyName: 'Bitcoin',
        symbol: 'BTC',
        currentValue: '$31,000.00',
        percentageChange: '+106.67%',
        assetType: 'Crypto',
        quantity: 0.5
    };

    const lowestPerformer = {
        companyName: 'Vanguard 500',
        symbol: 'VOO',
        currentValue: '$9,000.00',
        percentageChange: '+18.42%',
        assetType: 'Mutual Funds',
        quantity: 25
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const summaryData = await getPortfolioSummary();
                const performanceData = await getPortfolioPerformance();
                setSummary(summaryData);
                setChartData(performanceData);
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

    return (
        <div className="home-page">
            <div className="hero-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>Hello, {summary.userName}</h1>

                <div className="portfolio-summary" style={{ textAlign: 'center', marginBottom: '25px', width: 'fit-content' }}>
                    <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Total Portfolio Value</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '5px' }}>{summary.portfolioValue}</div>
                    <div style={{ fontSize: '1.1rem' }}>
                        <span className="text-positive">{summary.totalGain} ({summary.gainPercentage})</span>
                    </div>
                </div>

                <button
                    className="btn"
                    onClick={() => navigate('/holdings')}
                    style={{
                        padding: '12px 30px',
                        fontSize: '1.1rem',
                        borderRadius: '50px',   // pill shape
                        backgroundColor: '#DB292D', // red color
                        color: 'white',         // text color for contrast
                        border: 'none'          // remove default border
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#b71c1c'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#DB292D'}
                >
                    View Holdings
                </button>

            </div>

            <div className="chart-section">
                <PortfolioChart data={chartData} />
            </div>

            <div className="performance-section">
                <div onClick={() => handleCardClick(topPerformer)} style={{ cursor: 'pointer' }}>
                    <PerformanceCard
                        label="Top Performer"
                        name={topPerformer.companyName}
                        value={topPerformer.currentValue}
                        percentage={topPerformer.percentageChange}
                    />
                </div>
                <div onClick={() => handleCardClick(lowestPerformer)} style={{ cursor: 'pointer' }}>
                    <PerformanceCard
                        label="Lowest Performer"
                        name={lowestPerformer.companyName}
                        value={lowestPerformer.currentValue}
                        percentage={lowestPerformer.percentageChange}
                    />
                </div>
            </div>

            {selectedAsset && (
                <AssetDetailsModal
                    asset={selectedAsset}
                    onClose={handleCloseModal}
                    historyData={historyData}
                    onSell={() => {
                        console.log("Sell requested from Home page - Read Only");
                        alert("Please go to Holdings page to manage assets.");
                    }}
                />
            )}
        </div>
    );
};

export default Home;
