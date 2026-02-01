import React from 'react';

import AssetPriceChart from '../charts/AssetPriceChart';

const AssetDetailsModal = ({ asset, onClose, historyData, onSell }) => {
    if (!asset || (Array.isArray(asset) && asset.length === 0)) return null;

    // Parse percentageChange safely (treat as number)
    let numericChange = 0;
    if (asset.percentageChange) {
        numericChange = parseFloat(String(asset.percentageChange).replace('%', ''));
    }
    if (isNaN(numericChange)) numericChange = 0;

    const changeColor = numericChange >= 0 ? '#4caf50' : '#f44336';
    const formattedChange = (numericChange > 0 ? '+' : '') + numericChange.toFixed(2) + '%';


    return (
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
                                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginTop: '5px' }}>{asset.currentValue}</div>
                            </div>
                            <div className="stat-card-dark">
                                <div className="text-muted text-sm" style={{ fontSize: '0.7em', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AVG Buy Price</div>
                                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginTop: '5px' }}>$150.00</div>
                            </div>
                            <div className="stat-card-dark">
                                <div className="text-muted text-sm" style={{ fontSize: '0.7em', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Holdings Value</div>
                                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginTop: '5px', color: '#DB292D' }}>{asset.currentValue}</div>
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

                        <button
                            onClick={onSell}
                            className="btn btn-danger"
                            style={{
                                width: '100%',
                                padding: '15px',
                                fontSize: '1em',
                                fontWeight: '600',
                                borderRadius: '50px',        // pill shape
                                backgroundColor: '#DB292D',  // consistent red
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                boxShadow: '0 4px 6px rgba(219, 41, 45, 0.2)'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#b71c1c'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#DB292D'}
                        >
                            Liquidate Position (Sell)
                        </button>

                    </div>

                    {/* Right Column */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ color: '#DB292D', marginRight: '10px' }}>📈</span>
                            <span style={{ fontWeight: 'bold' }}>Asset Price History</span>
                        </div>

                        {Array.isArray(historyData) && historyData.length > 0 ? (
                            <AssetPriceChart data={historyData} />
                        ) : (
                            <div className="stat-card-dark" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                                Loading Chart Data...
                            </div>
                        )}
                        <div className="stat-card-dark" style={{ marginTop: '20px', fontSize: '0.85em', color: 'var(--text-secondary)', lineHeight: '1.6', border: '1px solid #333' }}>
                            Market Analysis: This asset is currently testing resistance levels. Volatility indices suggest a stable trend for the upcoming fiscal quarter.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssetDetailsModal;
