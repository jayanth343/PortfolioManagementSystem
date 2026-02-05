import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import AssetCard from '../../components/cards/AssetCard';
import BuyAssetModal from '../../components/modals/BuyAssetModal';
import { getAssets, addAsset, sellAsset, updateCurrentPrice } from '../../api/assetsApi';
import { createChart } from 'lightweight-charts';
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

    useEffect(() => {
        fetchAssets();
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
    };

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
        if (!selectedAsset || buyQuantity <= 0) return;
        
        try {
            // currentPrice is already the unit price
            const currentUnitPrice = livePrices[selectedAsset.symbol] || selectedAsset.currentPrice;
            
            // Add to existing quantity
            await addAsset({
                symbol: selectedAsset.symbol,
                companyName: selectedAsset.companyName,
                quantity: selectedAsset.quantity + buyQuantity,
                buyPrice: currentUnitPrice,
                assetType: selectedAsset.assetType
            });
            
            await fetchAssets();
            setShowDetailsModal(false);
            setBuyQuantity(1);
        } catch (error) {
            console.error("Error buying asset:", error);
            alert(error.message || "Failed to buy asset");
        }
    };

    const handleSellAsset = async () => {
        if (!selectedAsset || sellQuantity <= 0 || sellQuantity > selectedAsset.quantity) {
            alert("Invalid sell quantity");
            return;
        }
        
        try {
            if (sellQuantity === selectedAsset.quantity) {
                // Sell entire position
                await sellAsset(selectedAsset.id);
            } else {
                // Reduce quantity - currentPrice is already the unit price
                const currentUnitPrice = livePrices[selectedAsset.symbol] || selectedAsset.currentPrice;
                
                await addAsset({
                    symbol: selectedAsset.symbol,
                    companyName: selectedAsset.companyName,
                    quantity: selectedAsset.quantity - sellQuantity,
                    buyPrice: currentUnitPrice,
                    assetType: selectedAsset.assetType
                });
            }
            
            await fetchAssets();
            setShowDetailsModal(false);
            setSellQuantity(1);
        } catch (error) {
            console.error("Error selling asset:", error);
            alert(error.message || "Failed to sell asset");
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
                    <p>Start building your portfolio by searching and buying assets</p>
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
                        backgroundColor: 'rgba(0,0,0,0.85)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }}
                    onClick={() => setShowDetailsModal(false)}
                >
                    <div 
                        style={{
                            backgroundColor: '#1a1a1a',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '16px',
                            maxWidth: '900px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            padding: '30px'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start',
                            marginBottom: '30px',
                            paddingBottom: '20px',
                            borderBottom: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <div>
                                <div style={{ 
                                    fontSize: '0.85rem', 
                                    color: 'rgba(255,255,255,0.5)',
                                    marginBottom: '8px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    {selectedAsset.assetType}
                                </div>
                                <h2 style={{ 
                                    color: '#fff', 
                                    margin: '0 0 8px 0',
                                    fontSize: '1.8rem'
                                }}>
                                    {selectedAsset.companyName}
                                </h2>
                                <div style={{ 
                                    fontSize: '1.1rem', 
                                    color: 'rgba(255,255,255,0.6)',
                                    fontFamily: 'monospace'
                                }}>
                                    {selectedAsset.symbol}
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    color: '#fff',
                                    fontSize: '1.5rem',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Price Information */}
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '20px',
                            marginBottom: '30px'
                        }}>
                            <div style={{
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: '12px',
                                padding: '20px'
                            }}>
                                <div style={{ 
                                    fontSize: '0.75rem', 
                                    color: 'rgba(255,255,255,0.5)',
                                    marginBottom: '8px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    Current Price
                                </div>
                                <div style={{ 
                                    fontSize: '1.8rem', 
                                    fontWeight: '700',
                                    color: '#10b981'
                                }}>
                                    {formatCurrency(unitPrice)}
                                </div>
                                <div style={{
                                    fontSize: '0.85rem',
                                    color: 'rgba(255,255,255,0.4)',
                                    marginTop: '4px'
                                }}>
                                    Live Update
                                </div>
                            </div>

                            <div style={{
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: '12px',
                                padding: '20px'
                            }}>
                                <div style={{ 
                                    fontSize: '0.75rem', 
                                    color: 'rgba(255,255,255,0.5)',
                                    marginBottom: '8px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    Buy Price
                                </div>
                                <div style={{ 
                                    fontSize: '1.8rem', 
                                    fontWeight: '700',
                                    color: '#3b82f6'
                                }}>
                                    {formatCurrency(buyPrice)}
                                </div>
                                <div style={{
                                    fontSize: '0.85rem',
                                    color: 'rgba(255,255,255,0.4)',
                                    marginTop: '4px'
                                }}>
                                    Purchase Price
                                </div>
                            </div>

                            <div style={{
                                backgroundColor: gainLoss >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                border: `1px solid ${gainLoss >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                                borderRadius: '12px',
                                padding: '20px'
                            }}>
                                <div style={{ 
                                    fontSize: '0.75rem', 
                                    color: 'rgba(255,255,255,0.5)',
                                    marginBottom: '8px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    Gain/Loss
                                </div>
                                <div style={{ 
                                    fontSize: '1.8rem', 
                                    fontWeight: '700',
                                    color: gainLoss >= 0 ? '#10b981' : '#ef4444'
                                }}>
                                    {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)}
                                </div>
                                <div style={{
                                    fontSize: '0.85rem',
                                    color: gainLoss >= 0 ? '#10b981' : '#ef4444',
                                    marginTop: '4px',
                                    fontWeight: '600'
                                }}>
                                    {gainLoss >= 0 ? '+' : ''}{formatPercentage(gainLossPercent)}
                                </div>
                            </div>

                            <div style={{
                                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                borderRadius: '12px',
                                padding: '20px'
                            }}>
                                <div style={{ 
                                    fontSize: '0.75rem', 
                                    color: 'rgba(255,255,255,0.5)',
                                    marginBottom: '8px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    Holdings
                                </div>
                                <div style={{ 
                                    fontSize: '1.8rem', 
                                    fontWeight: '700',
                                    color: '#8b5cf6'
                                }}>
                                    {selectedAsset.quantity}
                                </div>
                                <div style={{
                                    fontSize: '0.85rem',
                                    color: 'rgba(255,255,255,0.4)',
                                    marginTop: '4px'
                                }}>
                                    Total Value: {formatCurrency(totalValue)}
                                </div>
                            </div>
                        </div>

                        {/* Chart Placeholder */}
                        <div style={{
                            backgroundColor: '#111',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            padding: '20px',
                            marginBottom: '30px',
                            height: '200px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'rgba(255,255,255,0.3)'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📊</div>
                                <div>Price Chart (7 Days)</div>
                                <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                                    Click "Details" button for full chart
                                </div>
                            </div>
                        </div>

                        {/* Buy/Sell Actions */}
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr',
                            gap: '20px',
                            marginBottom: '20px'
                        }}>
                            {/* Buy Section */}
                            <div style={{
                                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                borderRadius: '12px',
                                padding: '20px'
                            }}>
                                <h3 style={{ 
                                    color: '#10b981', 
                                    margin: '0 0 15px 0',
                                    fontSize: '1.1rem'
                                }}>
                                    Buy More
                                </h3>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ 
                                        display: 'block',
                                        color: 'rgba(255,255,255,0.6)',
                                        fontSize: '0.85rem',
                                        marginBottom: '8px'
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
                                            padding: '12px',
                                            backgroundColor: '#111',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>
                                <div style={{
                                    color: 'rgba(255,255,255,0.5)',
                                    fontSize: '0.9rem',
                                    marginBottom: '15px'
                                }}>
                                    Total: {formatCurrency(unitPrice * buyQuantity)}
                                </div>
                                <button
                                    onClick={handleBuyAsset}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: '#10b981',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                                >
                                    Buy {buyQuantity} {buyQuantity === 1 ? 'Unit' : 'Units'}
                                </button>
                            </div>

                            {/* Sell Section */}
                            <div style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.05)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '12px',
                                padding: '20px'
                            }}>
                                <h3 style={{ 
                                    color: '#ef4444', 
                                    margin: '0 0 15px 0',
                                    fontSize: '1.1rem'
                                }}>
                                    Sell Position
                                </h3>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ 
                                        display: 'block',
                                        color: 'rgba(255,255,255,0.6)',
                                        fontSize: '0.85rem',
                                        marginBottom: '8px'
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
                                            padding: '12px',
                                            backgroundColor: '#111',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>
                                <div style={{
                                    color: 'rgba(255,255,255,0.5)',
                                    fontSize: '0.9rem',
                                    marginBottom: '15px'
                                }}>
                                    Total: {formatCurrency(unitPrice * sellQuantity)}
                                </div>
                                <button
                                    onClick={handleSellAsset}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: '#ef4444',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                                >
                                    Sell {sellQuantity} {sellQuantity === 1 ? 'Unit' : 'Units'}
                                </button>
                            </div>
                        </div>

                        {/* Details Button */}
                        <button
                            onClick={navigateToDetails}
                            style={{
                                width: '100%',
                                padding: '14px',
                                backgroundColor: '#3b82f6',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                        >
                            View Full Details & Analysis
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Holdings;
