import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const BuyAssetModal = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        companyName: '',
        symbol: '',
        quantity: 0,
        buyPrice: 0.00,
        currentPrice: 0.00,
        assetType: 'Stocks'
    });

    const [buyingValue, setBuyingValue] = useState(0);
    const [priceTimestamp, setPriceTimestamp] = useState(null);

    useEffect(() => {
        setBuyingValue(formData.quantity * formData.buyPrice);
    }, [formData.quantity, formData.buyPrice]);

    // Socket.IO integration for live price updates
    useEffect(() => {
        if (!formData.symbol || formData.symbol.trim() === '') return;

        const socket = io('http://localhost:5000');

        socket.on('connect', () => {
            console.log('BuyModal Socket connected');
            socket.emit('subscribe_ticker_fast', { ticker: formData.symbol.trim().toUpperCase() });
        });

        socket.on('price_update', (data) => {
            console.log('BuyModal Price update:', data);
            if (data.ticker === formData.symbol.trim().toUpperCase()) {
                setFormData(prev => ({
                    ...prev,
                    currentPrice: data.price
                }));
                setPriceTimestamp(data.timestamp);
            }
        });

        socket.on('error', (error) => {
            console.error('BuyModal Socket error:', error);
        });

        return () => {
            if (formData.symbol && formData.symbol.trim() !== '') {
                socket.emit('unsubscribe_ticker', { ticker: formData.symbol.trim().toUpperCase() });
            }
            socket.disconnect();
        };
    }, [formData.symbol]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'quantity' || name === 'buyPrice' || name === 'currentPrice' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ ...formData, buyingValue });
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
        }}>
            <div className="modal-content modal-strict" style={{
                width: '100%',
                maxWidth: '650px',
                position: 'relative',
                padding: '30px 40px'
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
                        backgroundColor: '#DB292D',   // red background
                        color: 'white',           // white text
                        border: 'none',           // clean look
                        borderRadius: '15px',     // squircle shape
                        fontSize: '1.5rem',       // bigger "×"
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#b71c1c'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#DB292D'}
                >
                    ×
                </button>

                <h2 style={{ marginBottom: '30px', fontSize: '1.4rem', fontWeight: 'bold', border: 'none', color: 'white' }}>Execute Purchase</h2>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                    <div className="form-group">
                        <label className="text-muted text-sm" style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem' }}>Company / Asset Name</label>
                        <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            placeholder="e.g. Nvidia"
                            className="input-strict"
                            style={{
                                width: '100%',
                                boxSizing: 'border-box',
                                borderRadius: '50px',     // pill shape
                                backgroundColor: '#ccc',  // grey background
                                padding: '12px 20px',     // comfortable spacing
                                border: '1px solid #999', // subtle border
                                fontSize: '1rem',
                                color: '#000'             // text color for readability
                            }}
                            required
                        />

                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                            <label className="text-muted text-sm" style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem' }}>Ticker Symbol</label>
                            <input
                                type="text"
                                name="symbol"
                                value={formData.symbol}
                                onChange={handleChange}
                                placeholder="NVDA"
                                className="input-strict"
                                style={{
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    borderRadius: '50px',     // pill shape
                                    backgroundColor: '#ccc',  // grey background
                                    padding: '12px 20px',     // comfortable spacing
                                    border: '1px solid #999', // subtle border
                                    fontSize: '1rem',
                                    color: '#000'             // readable text
                                }}
                                required
                            />

                        </div>
                        <div className="form-group">
                            <label className="text-muted text-sm" style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem' }}>Category</label>
                            <select
                                name="assetType"
                                value={formData.assetType}
                                onChange={handleChange}
                                className="input-strict"
                                style={{
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    borderRadius: '50px',     // pill shape
                                    backgroundColor: '#ccc',  // grey background
                                    padding: '12px 20px',
                                    border: '1px solid #999',
                                    fontSize: '1rem',
                                    color: '#000',
                                    appearance: 'none',       // remove default arrow
                                    cursor: 'pointer',
                                    backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='black' height='12' viewBox='0 0 24 24' width='12' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 15px center', // position arrow
                                    backgroundSize: '12px'
                                }}
                            >
                                <option value="Stocks">Stocks</option>
                                <option value="Mutual Funds">Mutual Funds</option>
                                <option value="Commodities">Commodities</option>
                                <option value="Crypto">Crypto</option>
                            </select>

                        </div>
                    </div>

                    {formData.currentPrice > 0 && (
                        <div style={{
                            padding: '12px 20px',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            borderRadius: '8px',
                            marginBottom: '10px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <span style={{ fontSize: '0.8rem', color: '#999' }}>Live Price: </span>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#10b981' }}>
                                        ${formData.currentPrice.toFixed(2)}
                                    </span>
                                </div>
                                {priceTimestamp && (
                                    <div style={{ fontSize: '0.75rem', color: '#999' }}>
                                        Updated: {new Date(priceTimestamp).toLocaleString('en-IN', {
                                            timeZone: 'Asia/Kolkata',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit'
                                        })} IST
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                            <label className="text-muted text-sm" style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem' }}>Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                min="0"
                                step="any"
                                className="input-strict"
                                style={{
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    borderRadius: '50px',     // pill shape
                                    backgroundColor: '#ccc',  // grey background
                                    padding: '12px 20px',     // comfortable spacing
                                    border: '1px solid #999', // subtle border
                                    fontSize: '1rem',
                                    color: '#000'             // readable text
                                }}
                                required
                            />

                        </div>
                        <div className="form-group">
                            <label className="text-muted text-sm" style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem' }}>Entry Price (USD)</label>
                            <input
                                type="number"
                                name="buyPrice"
                                value={formData.buyPrice}
                                onChange={handleChange}
                                min="0"
                                step="any"
                                className="input-strict"
                                style={{
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    borderRadius: '50px',     // pill shape
                                    backgroundColor: '#ccc',  // grey background
                                    padding: '12px 20px',     // comfortable spacing
                                    border: '1px solid #999', // subtle border
                                    fontSize: '1rem',
                                    color: '#000'             // readable text
                                }}
                                required
                            />

                        </div>
                    </div>

                    {/* Button with specific solid red style requested */}
                    <button type="submit" style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        marginTop: '20px',
                        backgroundColor: '#DB292D',
                        color: 'white',
                        border: 'none',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        boxShadow: '0 4px 6px rgba(230, 57, 70, 0.2)'
                    }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#b71c1c'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#DB292D'}
                    >
                        Confirm Purchase Order
                    </button>

                </form>
            </div>
        </div>
    );
};

export default BuyAssetModal;
