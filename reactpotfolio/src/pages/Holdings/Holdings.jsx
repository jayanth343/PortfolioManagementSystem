import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import AssetCard from '../../components/cards/AssetCard';
import BuyAssetModal from '../../components/modals/BuyAssetModal';
import PriceChart from '../../components/charts/PriceChart';
import { getAssets, addAsset, buyAsset, sellAssetQuantity, updateCurrentPrice } from '../../api/assetsApi';
import { getCreditBalance } from '../../api/accountApi';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatPercentage } from '../../utils/formatPercentage';
import './Holdings.css';

const Holdings = () => {
    const navigate = useNavigate();
    const [assets, setAssets] = useState([]);
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [livePrices, setLivePrices] = useState({});
    const [buyQuantity, setBuyQuantity] = useState(1);
    const [sellQuantity, setSellQuantity] = useState(1);
    const [walletBalance, setWalletBalance] = useState(0);
    const [activeTab, setActiveTab] = useState('overview');
    const [analysis, setAnalysis] = useState(null);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [analysisError, setAnalysisError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [errorDialog, setErrorDialog] = useState({ open: false, title: '', message: '' });

    const fetchAssets = async () => {
        try {
            console.log("Holdings: Fetching assets...");
            const data = await getAssets();
            console.log("Holdings: Received assets:", data);
            console.log("Holdings: Asset count:", data?.length);
            setAssets(data);
        } catch (error) {
            console.error("Error fetching assets:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWalletBalance = async () => {
        try {
            const balance = await getCreditBalance();
            setWalletBalance(balance);
            console.log("Holdings: Wallet balance:", balance);
        } catch (error) {
            console.error("Error fetching wallet balance:", error);
        }
    };

    useEffect(() => {
        fetchAssets();
        fetchWalletBalance();
    }, []);

    // Socket.IO for live price updates every 2 minutes
    useEffect(() => {
        if (!selectedAsset) return;

        const socket = io('http://localhost:5000');

        socket.on('connect', () => {
            console.log('Holdings Socket connected for:', selectedAsset.symbol);
            socket.emit('subscribe_ticker', { ticker: selectedAsset.symbol });
        });

        socket.on('price_update', (data) => {
            console.log('Holdings Price update:', data);
            setLivePrices(prev => ({
                ...prev,
                [data.ticker]: data.price
            }));
            
            // Update database
            updateCurrentPrice(data.ticker, data.price)
                .catch((error) => {
                    console.error(`Failed to update database for ${data.ticker}:`, error);
                });
        });

        socket.on('error', (error) => {
            console.error('Holdings Socket error:', error);
        });

        return () => {
            socket.emit('unsubscribe_ticker', { ticker: selectedAsset.symbol });
            socket.disconnect();
        };
    }, [selectedAsset]);

    const handleAssetClick = (asset) => {
        setSelectedAsset(asset);
        setShowDetailsModal(true);
        setBuyQuantity(1);
        setSellQuantity(1);
        setActiveTab('overview');
        setAnalysis(null);
        setAnalysisError(null);
    };

    const fetchAnalysis = async () => {
        if (!selectedAsset) return;
        
        setAnalysisLoading(true);
        setAnalysisError(null);

        try {
            const url = `http://localhost:8080/api/yfdata/stock/${selectedAsset.symbol}/analysis?inPortfolio=true&buyPrice=${selectedAsset.buyPrice}`;
            console.log('Fetching analysis from:', url);
            
            const response = await fetch(url);
            console.log('Analysis response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Analysis error response:', errorData);
                throw new Error(errorData.error || 'Failed to fetch analysis');
            }

            const data = await response.json();
            console.log('Analysis data received:', data);
            console.log('Analysis recommendation:', data?.recommendation);
            console.log('Analysis summary:', data?.summary);
            console.log('Analysis keyPoints:', data?.keyPoints);
            setAnalysis(data);
        } catch (err) {
            console.error('Analysis error:', err);
            setAnalysisError(err.message || 'Failed to load AI recommendation');
        } finally {
            setAnalysisLoading(false);
        }
    };

    useEffect(() => {
        console.log('useEffect triggered - activeTab:', activeTab, 'analysis:', analysis, 'analysisLoading:', analysisLoading, 'selectedAsset:', selectedAsset?.symbol);
        if (activeTab === 'recommendation' && !analysis && !analysisLoading && selectedAsset) {
            console.log('Calling fetchAnalysis...');
            fetchAnalysis();
        }
    }, [activeTab]);

    const handleBuySubmit = async (formData) => {
        try {
            await addAsset(formData);
            await fetchAssets(); // Refresh list
            setShowBuyModal(false);
        } catch (error) {
            console.error("Error buying asset:", error);
        }
    };

    const handleBuyAsset = async () => {
        if (!selectedAsset || buyQuantity <= 0) {
            setErrorDialog({
                open: true,
                title: 'Invalid Quantity',
                message: 'Please enter a valid quantity greater than 0.'
            });
            return;
        }
        
        try {
            // Get current price (unit price)
            const currentUnitPrice = livePrices[selectedAsset.symbol] || selectedAsset.currentPrice;
            const totalCost = currentUnitPrice * buyQuantity;
            
            // Check if user has sufficient balance
            if (totalCost > walletBalance) {
                setErrorDialog({
                    open: true,
                    title: 'Insufficient Balance',
                    message: `You need ${formatCurrency(totalCost)} but only have ${formatCurrency(walletBalance)} in your wallet. Please add funds or reduce the quantity.`
                });
                return;
            }
            
            // Use new buyAsset function that handles add/update and transaction recording
            await buyAsset(
                selectedAsset.symbol,
                selectedAsset.companyName,
                buyQuantity,
                currentUnitPrice,
                selectedAsset.assetType
            );
            
            await fetchAssets();
            await fetchWalletBalance();
            
            // Dispatch event to update wallet balance in header
            window.dispatchEvent(new Event('transactionUpdated'));
            
            setShowDetailsModal(false);
            setBuyQuantity(1);
            
            setSnackbar({
                open: true,
                message: `Successfully added ${buyQuantity} units of ${selectedAsset.companyName} for ${formatCurrency(totalCost)}`,
                severity: 'success'
            });
        } catch (error) {
            console.error("Error buying asset:", error);
            setErrorDialog({
                open: true,
                title: 'Transaction Failed',
                message: error.message || 'Failed to complete the purchase. Please try again.'
            });
        }
    };

    const handleSellAsset = async () => {
        if (!selectedAsset || sellQuantity <= 0) {
            setErrorDialog({
                open: true,
                title: 'Invalid Quantity',
                message: 'Please enter a valid quantity greater than 0.'
            });
            return;
        }
        
        if (sellQuantity > selectedAsset.quantity) {
            setErrorDialog({
                open: true,
                title: 'Insufficient Holdings',
                message: `You only have ${selectedAsset.quantity} units of ${selectedAsset.companyName}. Cannot remove ${sellQuantity} units.`
            });
            return;
        }
        
        try {
            const currentUnitPrice = livePrices[selectedAsset.symbol] || selectedAsset.currentPrice;
            const totalValue = currentUnitPrice * sellQuantity;
            
            // Use new sellAssetQuantity function that handles remove/reduce and transaction recording
            await sellAssetQuantity(selectedAsset.symbol, sellQuantity);
            
            await fetchAssets();
            await fetchWalletBalance();
            
            // Dispatch event to update wallet balance in header
            window.dispatchEvent(new Event('transactionUpdated'));
            
            setShowDetailsModal(false);
            setSellQuantity(1);
            
            setSnackbar({
                open: true,
                message: `Successfully removed ${sellQuantity} units of ${selectedAsset.companyName} for ${formatCurrency(totalValue)}`,
                severity: 'success'
            });
        } catch (error) {
            console.error("Error selling asset:", error);
            setErrorDialog({
                open: true,
                title: 'Transaction Failed',
                message: error.message || 'Failed to complete the sale. Please try again.'
            });
        }
    };

    const navigateToDetails = () => {
        if (!selectedAsset) return;
        const assetType = selectedAsset.assetType?.toLowerCase().replace(' ', '') || 'stock';
        navigate(`/asset/${assetType}/${selectedAsset.symbol}`);
    };

    const getAssetsByType = (type) => assets.filter(asset => asset.assetType === type);

    const renderSection = (title, type, icon, color) => {
        const items = getAssetsByType(type);
        if (items.length === 0) return null;
        return (
            <div className="holdings-section" key={type}>
                <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                    <h2 style={{ borderLeft: `4px solid ${color}`, paddingLeft: '10px', margin: 0 }}>{title}</h2>
                    <span style={{ 
                        backgroundColor: 'rgba(255,255,255,0.1)', 
                        padding: '4px 12px', 
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        color: 'rgba(255,255,255,0.7)'
                    }}>
                        {items.length} asset{items.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <div className="holdings-list">
                    {items.map(asset => (
                        <AssetCard
                            key={asset.id}
                            {...asset}
                            currentValue={asset.currentPrice * asset.quantity}
                            onClick={() => handleAssetClick(asset)}
                        />
                    ))}
                </div>
            </div>
        );
    };

    if (loading) {
        return <div className="holdings-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>Loading Holdings...</div>;
    }

    // currentPrice from database is already the unit price
    const unitPrice = selectedAsset && (livePrices[selectedAsset.symbol] || selectedAsset.currentPrice);
    const totalValue = selectedAsset && unitPrice ? unitPrice * selectedAsset.quantity : 0;
    const buyPrice = selectedAsset?.buyPrice || 0;
    const gainLoss = unitPrice - buyPrice;
    const gainLossPercent = buyPrice > 0 ? ((gainLoss / buyPrice) * 100) : 0;

    return (
        <div className="holdings-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <Link
                        to="/"
                        className="back-link"
                        style={{
                            textDecoration: 'none',
                            color: 'white',
                            backgroundColor: '#DB292D',
                            border: 'none',
                            width: '50px',
                            height: '50px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '15px',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            lineHeight: '5',
                            paddingTop: '5px'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#b71c1c'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#DB292D'}
                    >←
                    </Link>
                    <h1>Your Holdings</h1>
                </div>
            </div>

            {renderSection('Stocks', 'stock', '📈', '#10b981')}
            {renderSection('Mutual Funds', 'fund', '📊', '#3b82f6')}
            {renderSection('Crypto', 'crypto', '₿', '#f59e0b')}
            {renderSection('Commodities', 'commodity', '🥇', '#8b5cf6')}

            {assets.length === 0 && (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '60px 20px',
                    color: 'rgba(255,255,255,0.5)'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📊</div>
                    <h2 style={{ color: 'rgba(255,255,255,0.7)' }}>No Holdings Yet</h2>
                    <p>Start building your portfolio by searching and adding assets</p>
                </div>
            )}

            {showBuyModal && (
                <BuyAssetModal
                    onClose={() => setShowBuyModal(false)}
                    onSubmit={handleBuySubmit}
                />
            )}

            {/* Asset Details Modal */}
            {showDetailsModal && selectedAsset && (
                <div 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.75)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        zIndex: 1000,
                        paddingTop: '80px',
                        paddingBottom: '40px',
                        paddingLeft: '20px',
                        paddingRight: '20px',
                        overflow: 'auto'
                    }}
                    onClick={() => setShowDetailsModal(false)}
                >
                    <div 
                        style={{
                            backgroundColor: '#0a0a0a',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            maxWidth: '650px',
                            width: '100%',
                            maxHeight: '80vh',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                            margin: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{ 
                            padding: '20px 24px',
                            borderBottom: '1px solid rgba(255,255,255,0.08)',
                            flexShrink: 0
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{
                                        display: 'inline-block',
                                        padding: '4px 10px',
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        color: 'rgba(255,255,255,0.6)',
                                        marginBottom: '12px',
                                        fontWeight: 500,
                                        letterSpacing: '0.3px'
                                    }}>
                                        {selectedAsset.assetType}
                                    </div>
                                    <h2 style={{ 
                                        color: '#fff', 
                                        margin: '0 0 6px 0',
                                        fontSize: '1.5rem',
                                        fontWeight: 600,
                                        letterSpacing: '-0.02em'
                                    }}>
                                        {selectedAsset.companyName}
                                    </h2>
                                    <div style={{ 
                                        fontSize: '0.95rem', 
                                        color: 'rgba(255,255,255,0.5)',
                                        fontFamily: 'ui-monospace, monospace'
                                    }}>
                                        {selectedAsset.symbol}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'rgba(255,255,255,0.6)',
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.2rem',
                                        transition: 'all 0.15s ease'
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.backgroundColor = 'rgba(255,255,255,0.05)';
                                        e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div style={{
                            display: 'flex',
                            borderBottom: '1px solid rgba(255,255,255,0.08)',
                            padding: '0 24px',
                            gap: '24px',
                            flexShrink: 0
                        }}>
                            <button
                                onClick={() => setActiveTab('overview')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: activeTab === 'overview' ? '#fff' : 'rgba(255,255,255,0.5)',
                                    padding: '12px 0',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    borderBottom: activeTab === 'overview' ? '2px solid #fff' : '2px solid transparent',
                                    transition: 'all 0.15s ease',
                                    marginBottom: '-1px'
                                }}
                            >
                                Overview
                            </button>
                            {selectedAsset?.assetType?.toLowerCase() !== 'mutual funds' && (
                                <button
                                    onClick={() => setActiveTab('recommendation')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: activeTab === 'recommendation' ? '#fff' : 'rgba(255,255,255,0.5)',
                                        padding: '12px 0',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        borderBottom: activeTab === 'recommendation' ? '2px solid #fff' : '2px solid transparent',
                                        transition: 'all 0.15s ease',
                                        marginBottom: '-1px'
                                    }}
                                >
                                    AI Recommendation
                                </button>
                            )}
                        </div>

                        {/* Content */}
                        <div style={{ 
                            padding: '20px 24px',
                            overflowY: 'auto',
                            flex: 1
                        }}>
                            {activeTab === 'overview' ? (
                            <>
                            {/* Price Information Grid */}
                            <div style={{ 
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '12px',
                                marginBottom: '24px'
                            }}>
                                <div style={{
                                    padding: '16px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(255,255,255,0.02)'
                                }}>
                                    <div style={{ 
                                        fontSize: '0.75rem',
                                        color: 'rgba(255,255,255,0.5)',
                                        marginBottom: '8px',
                                        fontWeight: 500
                                    }}>
                                        Current Price
                                    </div>
                                    <div style={{ 
                                        fontSize: '1.5rem',
                                        fontWeight: 600,
                                        color: '#fff',
                                        marginBottom: '4px',
                                        letterSpacing: '-0.02em'
                                    }}>
                                        {formatCurrency(unitPrice)}
                                    </div>
                                    <div style={{
                                        fontSize: '0.7rem',
                                        color: '#10b981'
                                    }}>
                                        ● Live
                                    </div>
                                </div>

                                <div style={{
                                    padding: '16px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(255,255,255,0.02)'
                                }}>
                                    <div style={{ 
                                        fontSize: '0.75rem',
                                        color: 'rgba(255,255,255,0.5)',
                                        marginBottom: '8px',
                                        fontWeight: 500
                                    }}>
                                        Avg Buy Price
                                    </div>
                                    <div style={{ 
                                        fontSize: '1.5rem',
                                        fontWeight: 600,
                                        color: '#fff',
                                        letterSpacing: '-0.02em'
                                    }}>
                                        {formatCurrency(buyPrice)}
                                    </div>
                                </div>

                                <div style={{
                                    padding: '16px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(255,255,255,0.02)'
                                }}>
                                    <div style={{ 
                                        fontSize: '0.75rem',
                                        color: 'rgba(255,255,255,0.5)',
                                        marginBottom: '8px',
                                        fontWeight: 500
                                    }}>
                                        P&L
                                    </div>
                                    <div style={{ 
                                        fontSize: '1.5rem',
                                        fontWeight: 600,
                                        color: gainLoss >= 0 ? '#10b981' : '#ef4444',
                                        marginBottom: '4px',
                                        letterSpacing: '-0.02em'
                                    }}>
                                        {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)}
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: gainLoss >= 0 ? '#10b981' : '#ef4444',
                                        fontWeight: 500
                                    }}>
                                        {gainLoss >= 0 ? '+' : ''}{formatPercentage(gainLossPercent)}
                                    </div>
                                </div>

                                <div style={{
                                    padding: '16px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(255,255,255,0.02)'
                                }}>
                                    <div style={{ 
                                        fontSize: '0.75rem',
                                        color: 'rgba(255,255,255,0.5)',
                                        marginBottom: '8px',
                                        fontWeight: 500
                                    }}>
                                        Quantity
                                    </div>
                                    <div style={{ 
                                        fontSize: '1.5rem',
                                        fontWeight: 600,
                                        color: '#fff',
                                        marginBottom: '4px',
                                        letterSpacing: '-0.02em'
                                    }}>
                                        {selectedAsset.quantity}
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: 'rgba(255,255,255,0.5)'
                                    }}>
                                        {formatCurrency(totalValue)}
                                    </div>
                                </div>
                            </div>

                            {/* Price Chart */}
                            <div style={{
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '8px',
                                padding: '12px',
                                marginBottom: '20px',
                                backgroundColor: 'rgba(0,0,0,0.3)',
                                height: '200px'
                            }}>
                                <PriceChart 
                                    symbol={selectedAsset.symbol} 
                                    height={180}
                                />
                            </div>

                            {/* Add/Remove Actions */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                {/* Add Section */}
                                <div style={{
                                    padding: '16px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(255,255,255,0.02)'
                                }}>
                                    <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)', marginBottom: '16px', fontWeight: 500 }}>
                                        Buy More
                                    </div>
                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ 
                                            display: 'block',
                                            fontSize: '0.75rem',
                                            color: 'rgba(255,255,255,0.5)',
                                            marginBottom: '6px',
                                            fontWeight: 500
                                        }}>
                                            Quantity
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={buyQuantity}
                                            onChange={(e) => setBuyQuantity(parseInt(e.target.value) || 1)}
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                backgroundColor: 'rgba(0,0,0,0.3)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '6px',
                                                color: '#fff',
                                                fontSize: '0.9rem',
                                                outline: 'none',
                                                transition: 'border-color 0.15s ease'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
                                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                        />
                                    </div>
                                    <div style={{
                                        fontSize: '0.8rem',
                                        color: 'rgba(255,255,255,0.5)',
                                        marginBottom: '16px'
                                    }}>
                                        Total: <span style={{ color: '#fff', fontWeight: 500 }}>{formatCurrency(unitPrice * buyQuantity)}</span>
                                    </div>
                                    <button
                                        onClick={handleBuyAsset}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            backgroundColor: '#fff',
                                            color: '#000',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease'
                                        }}
                                        onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.9)'}
                                        onMouseOut={(e) => e.target.style.backgroundColor = '#fff'}
                                    >
                                        Add {buyQuantity} {buyQuantity === 1 ? 'Unit' : 'Units'}
                                    </button>
                                </div>

                                {/* Remove Section */}
                                <div style={{
                                    padding: '16px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(255,255,255,0.02)'
                                }}>
                                    <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)', marginBottom: '16px', fontWeight: 500 }}>
                                        Sell Position
                                    </div>
                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ 
                                            display: 'block',
                                            fontSize: '0.75rem',
                                            color: 'rgba(255,255,255,0.5)',
                                            marginBottom: '6px',
                                            fontWeight: 500
                                        }}>
                                            Quantity (Max: {selectedAsset.quantity})
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max={selectedAsset.quantity}
                                            value={sellQuantity}
                                            onChange={(e) => setSellQuantity(Math.min(parseInt(e.target.value) || 1, selectedAsset.quantity))}
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                backgroundColor: 'rgba(0,0,0,0.3)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '6px',
                                                color: '#fff',
                                                fontSize: '0.9rem',
                                                outline: 'none',
                                                transition: 'border-color 0.15s ease'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
                                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                        />
                                    </div>
                                    <div style={{
                                        fontSize: '0.8rem',
                                        color: 'rgba(255,255,255,0.5)',
                                        marginBottom: '16px'
                                    }}>
                                        Total: <span style={{ color: '#fff', fontWeight: 500 }}>{formatCurrency(unitPrice * sellQuantity)}</span>
                                    </div>
                                    <button
                                        onClick={handleSellAsset}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            backgroundColor: 'transparent',
                                            color: '#fff',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            borderRadius: '6px',
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease'
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                            e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.backgroundColor = 'transparent';
                                            e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                                        }}
                                    >
                                        Remove {sellQuantity} {sellQuantity === 1 ? 'Unit' : 'Units'}
                                    </button>
                                </div>
                            </div>

                            {/* Details Button */}
                            <button
                                onClick={navigateToDetails}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: 'transparent',
                                    color: 'rgba(255,255,255,0.7)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.backgroundColor = 'rgba(255,255,255,0.05)';
                                    e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                                    e.target.style.color = '#fff';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.backgroundColor = 'transparent';
                                    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                    e.target.style.color = 'rgba(255,255,255,0.7)';
                                }}
                            >
                                View Full Details & Analysis →
                            </button>
                            </>
                            ) : selectedAsset?.assetType?.toLowerCase() !== 'mutual funds' ? (
                                /* AI Recommendation Tab */
                                <div>
                                    {console.log('Rendering AI tab - analysis:', analysis, 'loading:', analysisLoading, 'error:', analysisError)}
                                    {analysisLoading ? (
                                        <div style={{ 
                                            display: 'flex', 
                                            justifyContent: 'center', 
                                            alignItems: 'center',
                                            padding: '60px 20px',
                                            color: 'rgba(255,255,255,0.5)'
                                        }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🤖</div>
                                                <div>Analyzing {selectedAsset.companyName}...</div>
                                            </div>
                                        </div>
                                    ) : analysisError ? (
                                        <div style={{
                                            padding: '20px',
                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                            borderRadius: '8px',
                                            backgroundColor: 'rgba(239, 68, 68, 0.05)',
                                            color: '#ef4444',
                                            fontSize: '0.875rem'
                                        }}>
                                            {analysisError}
                                            <button
                                                onClick={fetchAnalysis}
                                                style={{
                                                    marginTop: '12px',
                                                    padding: '8px 16px',
                                                    backgroundColor: 'transparent',
                                                    color: '#ef4444',
                                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                                    borderRadius: '6px',
                                                    fontSize: '0.875rem',
                                                    cursor: 'pointer',
                                                    display: 'block'
                                                }}
                                            >
                                                Retry
                                            </button>
                                        </div>
                                    ) : analysis ? (
                                        <div>
                                            {console.log('Rendering analysis content:', analysis)}
                                            {/* Recommendation Badge */}
                                            {analysis.action && (() => {
                                                // Transform action text for portfolio context
                                                let displayAction = analysis.action;
                                                if (analysis.action.includes('STRONG BUY')) {
                                                    displayAction = 'ADD MORE';
                                                } else if (analysis.action.includes('BUY') && !analysis.action.includes('DON\'T')) {
                                                    displayAction = 'ACCUMULATE';
                                                } else if (analysis.action.includes('SELL')) {
                                                    displayAction = analysis.action; // Keep SELL as is
                                                }
                                                
                                                return (
                                                    <div style={{
                                                        padding: '16px',
                                                        border: '1px solid rgba(255,255,255,0.08)',
                                                        borderRadius: '8px',
                                                        backgroundColor: 'rgba(255,255,255,0.02)',
                                                        marginBottom: '16px'
                                                    }}>
                                                        <div style={{
                                                            fontSize: '0.75rem',
                                                            color: 'rgba(255,255,255,0.5)',
                                                            marginBottom: '8px',
                                                            fontWeight: 500
                                                        }}>
                                                            AI Recommendation
                                                        </div>
                                                        <div style={{
                                                            display: 'inline-block',
                                                            padding: '6px 14px',
                                                            backgroundColor: analysis.action.includes('BUY') ? 'rgba(16, 185, 129, 0.1)' :
                                                                            analysis.action.includes('SELL') ? 'rgba(239, 68, 68, 0.1)' :
                                                                            'rgba(245, 158, 11, 0.1)',
                                                            border: `1px solid ${analysis.action.includes('BUY') ? 'rgba(16, 185, 129, 0.3)' :
                                                                                analysis.action.includes('SELL') ? 'rgba(239, 68, 68, 0.3)' :
                                                                                'rgba(245, 158, 11, 0.3)'}`,
                                                            borderRadius: '6px',
                                                            color: analysis.action.includes('BUY') ? '#10b981' :
                                                                   analysis.action.includes('SELL') ? '#ef4444' :
                                                                   '#f59e0b',
                                                            fontSize: '0.95rem',
                                                            fontWeight: 600
                                                        }}>
                                                            {displayAction}
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            {/* Reasoning */}
                                            {analysis.reasoning && (
                                                <div style={{
                                                    padding: '16px',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    borderRadius: '8px',
                                                    backgroundColor: 'rgba(255,255,255,0.02)',
                                                    marginBottom: '16px'
                                                }}>
                                                    <div style={{
                                                        fontSize: '0.75rem',
                                                        color: 'rgba(255,255,255,0.5)',
                                                        marginBottom: '8px',
                                                        fontWeight: 500
                                                    }}>
                                                        Analysis
                                                    </div>
                                                    <div style={{
                                                        color: 'rgba(255,255,255,0.9)',
                                                        fontSize: '0.875rem',
                                                        lineHeight: '1.6'
                                                    }}>
                                                        {analysis.reasoning}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Metrics Grid */}
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(2, 1fr)',
                                                gap: '12px',
                                                marginBottom: '16px'
                                            }}>
                                                {/* News Sentiment */}
                                                {analysis.newsSentiment && (
                                                    <div style={{
                                                        padding: '16px',
                                                        border: '1px solid rgba(255,255,255,0.08)',
                                                        borderRadius: '8px',
                                                        backgroundColor: 'rgba(255,255,255,0.02)'
                                                    }}>
                                                        <div style={{
                                                            fontSize: '0.75rem',
                                                            color: 'rgba(255,255,255,0.5)',
                                                            marginBottom: '8px',
                                                            fontWeight: 500
                                                        }}>
                                                            News Sentiment
                                                        </div>
                                                        <div style={{
                                                            fontSize: '1.25rem',
                                                            fontWeight: 600,
                                                            color: analysis.newsSentiment === 'positive' ? '#10b981' :
                                                                   analysis.newsSentiment === 'negative' ? '#ef4444' : '#888',
                                                            textTransform: 'uppercase',
                                                            marginBottom: '4px'
                                                        }}>
                                                            {analysis.newsSentiment}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '0.75rem',
                                                            color: 'rgba(255,255,255,0.5)'
                                                        }}>
                                                            Score: {analysis.sentimentScore?.toFixed(2) || '0.00'}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Analyst Recommendation */}
                                                {analysis.analystRecommendation && (
                                                    <div style={{
                                                        padding: '16px',
                                                        border: '1px solid rgba(255,255,255,0.08)',
                                                        borderRadius: '8px',
                                                        backgroundColor: 'rgba(255,255,255,0.02)'
                                                    }}>
                                                        <div style={{
                                                            fontSize: '0.75rem',
                                                            color: 'rgba(255,255,255,0.5)',
                                                            marginBottom: '8px',
                                                            fontWeight: 500
                                                        }}>
                                                            Analysts
                                                        </div>
                                                        <div style={{
                                                            fontSize: '1.1rem',
                                                            fontWeight: 600,
                                                            color: '#fff',
                                                            textTransform: 'uppercase',
                                                            marginBottom: '4px'
                                                        }}>
                                                            {analysis.analystRecommendation.replace('_', ' ')}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '0.75rem',
                                                            color: 'rgba(255,255,255,0.5)'
                                                        }}>
                                                            Confidence: {(analysis.analystConfidence * 100)?.toFixed(0) || '0'}%
                                                        </div>
                                                    </div>
                                                )}

                                                {/* RSI */}
                                                {analysis.rsi && (
                                                    <div style={{
                                                        padding: '16px',
                                                        border: '1px solid rgba(255,255,255,0.08)',
                                                        borderRadius: '8px',
                                                        backgroundColor: 'rgba(255,255,255,0.02)'
                                                    }}>
                                                        <div style={{
                                                            fontSize: '0.75rem',
                                                            color: 'rgba(255,255,255,0.5)',
                                                            marginBottom: '8px',
                                                            fontWeight: 500
                                                        }}>
                                                            RSI (14-period)
                                                        </div>
                                                        <div style={{
                                                            fontSize: '1.25rem',
                                                            fontWeight: 600,
                                                            color: analysis.rsi > 70 ? '#ef4444' :
                                                                   analysis.rsi < 30 ? '#10b981' : '#888',
                                                            marginBottom: '4px'
                                                        }}>
                                                            {analysis.rsi.toFixed(2)}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '0.75rem',
                                                            color: analysis.rsiSignal?.includes('oversold') ? '#10b981' :
                                                                   analysis.rsiSignal?.includes('overbought') ? '#ef4444' : '#888',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {analysis.rsiSignal?.replace('_', ' ')}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Risk Level */}
                                                {analysis.riskLevel && (
                                                    <div style={{
                                                        padding: '16px',
                                                        border: '1px solid rgba(255,255,255,0.08)',
                                                        borderRadius: '8px',
                                                        backgroundColor: 'rgba(255,255,255,0.02)'
                                                    }}>
                                                        <div style={{
                                                            fontSize: '0.75rem',
                                                            color: 'rgba(255,255,255,0.5)',
                                                            marginBottom: '8px',
                                                            fontWeight: 500
                                                        }}>
                                                            Risk Level
                                                        </div>
                                                        <div style={{
                                                            fontSize: '1.1rem',
                                                            fontWeight: 600,
                                                            color: analysis.riskLevel === 'low' ? '#10b981' :
                                                                   analysis.riskLevel === 'very_high' ? '#ef4444' : '#fbbf24',
                                                            textTransform: 'uppercase',
                                                            marginBottom: '4px'
                                                        }}>
                                                            {analysis.riskLevel.replace('_', ' ')}
                                                        </div>
                                                        {analysis.volatility && (
                                                            <div style={{
                                                                fontSize: '0.75rem',
                                                                color: 'rgba(255,255,255,0.5)'
                                                            }}>
                                                                Volatility: {analysis.volatility.toFixed(2)}%
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Disclaimer */}
                                            <div style={{
                                                marginTop: '20px',
                                                padding: '12px 16px',
                                                border: '1px solid rgba(251, 191, 36, 0.3)',
                                                borderRadius: '8px',
                                                backgroundColor: 'rgba(251, 191, 36, 0.05)',
                                                display: 'flex',
                                                gap: '12px',
                                                alignItems: 'start'
                                            }}>
                                                <div style={{ fontSize: '1.2rem', flexShrink: 0 }}>⚠️</div>
                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    color: 'rgba(255,255,255,0.7)',
                                                    lineHeight: '1.5'
                                                }}>
                                                    <strong style={{ color: '#fbbf24' }}>Disclaimer:</strong> This is an AI-generated recommendation for informational purposes only. Investment decisions should not be made solely based on this advice. Please conduct your own research and consider consulting with a financial advisor before making any investment decisions.
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ 
                                            textAlign: 'center', 
                                            padding: '60px 20px',
                                            color: 'rgba(255,255,255,0.5)'
                                        }}>
                                            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🤖</div>
                                            <div>AI recommendation not available</div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Mutual Funds - No AI Tab */
                                <div style={{ 
                                    textAlign: 'center', 
                                    padding: '60px 20px',
                                    color: 'rgba(255,255,255,0.5)'
                                }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📊</div>
                                    <div>AI recommendations are not available for mutual funds</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Success Notification Snackbar */}
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setSnackbar({ ...snackbar, open: false })} 
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Error Dialog */}
            <Dialog
                open={errorDialog.open}
                onClose={() => setErrorDialog({ ...errorDialog, open: false })}
                PaperProps={{
                    style: {
                        backgroundColor: '#1a1a1a',
                        border: '1px solid rgba(244, 67, 54, 0.3)',
                        borderRadius: '12px',
                        padding: '8px'
                    }
                }}
            >
                <DialogTitle style={{ color: '#f44336', fontWeight: 600 }}>
                    {errorDialog.title}
                </DialogTitle>
                <DialogContent>
                    <div style={{ color: 'rgba(255,255,255,0.9)', padding: '8px 0' }}>
                        {errorDialog.message}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setErrorDialog({ ...errorDialog, open: false })}
                        style={{
                            color: '#f44336',
                            textTransform: 'none',
                            fontWeight: 500
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Holdings;
