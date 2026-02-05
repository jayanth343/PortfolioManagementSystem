import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatPercentage } from '../../utils/formatPercentage';
import PriceChart from '../charts/PriceChart';
import BuyQuantityModal from './BuyQuantityModal';
import SellQuantityModal from './SellQuantityModal';

const AssetDetailsModal = ({ asset, onClose, historyData, onSell, onBuy, onSuccess }) => {
    const [showBuyQuantityModal, setShowBuyQuantityModal] = useState(false);
    const [showSellQuantityModal, setShowSellQuantityModal] = useState(false);

    if (!asset || (Array.isArray(asset) && asset.length === 0)) return null;

    // Direct usage of numeric value
    const numericChange = asset.percentageChange || 0;
    const changeColor = numericChange >= 0 ? '#4caf50' : '#f44336';
    const formattedChange = formatPercentage(numericChange);


    return (
        <>
            <div className="modal-overlay" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.95)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
                padding: '40px'
            }}>
                <div className="modal-content modal-dark" style={{
                    width: '100%',
                    maxWidth: '1000px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    position: 'relative',
                    padding: '30px'
                }}>
                    <button
                        onClick={onClose}
                        className="btn-close-square"
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            width: '50px',
                            height: '50px',
                            backgroundColor: '#DB292D',   // custom red
                            color: 'white',
                            border: 'none',
                            borderRadius: '15px',         // squircle shape
                            fontSize: '1.5rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            boxShadow: '0 4px 6px rgba(219, 41, 45, 0.2)'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#b71c1c'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#DB292D'}
                    >
                        ×
                    </button>

                    <h2 style={{ fontSize: '1.8rem', marginBottom: '30px', fontWeight: 'bold' }}>
                        {asset.companyName} <span className="text-muted" style={{ fontSize: '0.6em', fontWeight: 'normal', marginLeft: '10px' }}>{asset.symbol}</span>
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '40px', alignItems: 'start' }}>
                        {/* Left Column */}
                        <div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
                                <div className="stat-card-dark">
                                    <div className="text-muted text-sm" style={{ fontSize: '0.7em', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Price</div>
                                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginTop: '5px' }}>{formatCurrency(asset.currentValue / asset.quantity)}</div>
                                </div>
                                <div className="stat-card-dark">
                                    <div className="text-muted text-sm" style={{ fontSize: '0.7em', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AVG Buy Price</div>
                                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginTop: '5px' }}>$150.00</div>
                                </div>
                                <div className="stat-card-dark">
                                    <div className="text-muted text-sm" style={{ fontSize: '0.7em', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Holdings Value</div>
                                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginTop: '5px', color: '#DB292D' }}>{formatCurrency(asset.currentValue)}</div>
                                </div>
                                <div className="stat-card-dark">
                                    <div className="text-muted text-sm" style={{ fontSize: '0.7em', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Return</div>
                                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginTop: '5px', color: changeColor }}>
                                        {formattedChange}
                                    </div>
                                </div>
                            </div>

                            <div className="stat-card-dark" style={{ marginBottom: '30px' }}>
                                <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1rem', borderBottom: '1px solid #333', paddingBottom: '10px' }}>Technical Overview</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.9rem' }}>
                                    <span className="text-muted">Symbol</span>
                                    <span style={{ fontWeight: 600 }}>{asset.symbol}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.9rem' }}>
                                    <span className="text-muted">Asset Class</span>
                                    <span style={{ fontWeight: 600 }}>{asset.assetType}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.9rem' }}>
                                    <span className="text-muted">Volume (Holdings)</span>
                                    <span style={{ fontWeight: 600 }}>{asset.quantity} units</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '15px', marginTop: 'auto' }}>
                                <button
                                    onClick={() => setShowBuyQuantityModal(true)}
                                    className="btn"
                                    style={{
                                        flex: 1,
                                        padding: '15px',
                                        fontSize: '1em',
                                        fontWeight: '600',
                                        borderRadius: '50px',
                                        backgroundColor: '#DB292D',  // Primary Brand Red
                                        color: 'white',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s, transform 0.1s',
                                        boxShadow: '0 4px 12px rgba(219, 41, 45, 0.3)'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.backgroundColor = '#b71c1c';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor = '#DB292D';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    Buy
                                </button>
                                <button
                                    onClick={() => {
                                        if (asset.quantity > 0) setShowSellQuantityModal(true);
                                    }}
                                    disabled={!asset.quantity || asset.quantity <= 0}
                                    className="btn"
                                    style={{
                                        flex: 1,
                                        padding: '15px',
                                        fontSize: '1em',
                                        fontWeight: '600',
                                        borderRadius: '50px',
                                        backgroundColor: 'transparent', // Secondary / Outline
                                        color: (!asset.quantity || asset.quantity <= 0) ? '#666' : 'white',
                                        border: (!asset.quantity || asset.quantity <= 0) ? '2px solid #666' : '2px solid #333',
                                        cursor: (!asset.quantity || asset.quantity <= 0) ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s',
                                        opacity: (!asset.quantity || asset.quantity <= 0) ? 0.5 : 1
                                    }}
                                    onMouseOver={(e) => {
                                        if (asset.quantity > 0) {
                                            e.currentTarget.style.borderColor = '#DB292D';
                                            e.currentTarget.style.color = '#DB292D';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        if (asset.quantity > 0) {
                                            e.currentTarget.style.borderColor = '#333';
                                            e.currentTarget.style.color = 'white';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }
                                    }}
                                >
                                    Sell
                                </button>
                            </div>

                        </div>

                        {/* Right Column */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                <span style={{ color: '#DB292D', marginRight: '10px' }}>📈</span>
                                <span style={{ fontWeight: 'bold' }}>Asset Price History</span>
                            </div>

                            <div className="asset-price-chart" style={{ height: '300px', width: '100%', backgroundColor: '#1e1e1e', borderRadius: '8px', overflow: 'hidden' }}>
                                <PriceChart
                                    symbol={asset.tickerSymbol || asset.symbol}
                                    height={300}
                                    color="#DB292D"
                                    initialPeriod="1M"
                                />
                            </div>

                            <div className="stat-card-dark" style={{ marginTop: '20px', fontSize: '0.85em', color: 'var(--text-secondary)', lineHeight: '1.6', border: '1px solid #333' }}>
                                Market Analysis: This asset is currently testing resistance levels. Volatility indices suggest a stable trend for the upcoming fiscal quarter.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showBuyQuantityModal && (
                <BuyQuantityModal
                    asset={asset}
                    onClose={() => setShowBuyQuantityModal(false)}
                    onSuccess={() => {
                        window.dispatchEvent(new Event('transactionUpdated'));
                        if (onSuccess) onSuccess();
                    }}
                />
            )}

            {showSellQuantityModal && (
                <SellQuantityModal
                    asset={asset}
                    onClose={() => setShowSellQuantityModal(false)}
                    onSuccess={() => {
                        window.dispatchEvent(new Event('transactionUpdated'));
                        if (onSuccess) onSuccess();
                    }}
                />
            )}
        </>
    );
};

export default AssetDetailsModal;
