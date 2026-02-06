import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';

const TransactionDetailsModal = ({ transaction, onClose }) => {
    if (!transaction) return null;

    const isBuy = transaction.type === 'BUY';
    const statusColor = isBuy ? '#4caf50' : '#f44336';
    const statusBg = isBuy ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)';

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
            <div className="modal-content modal-dark" style={{
                width: '100%',
                maxWidth: '600px',
                position: 'relative',
                padding: '30px',
                animation: 'modalFadeIn 0.3s ease-out forwards'
            }}>
                <button
                    onClick={onClose}
                    className="btn-close-square"
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        backgroundColor: '#DB292D',
                        border: 'none',
                        color: 'white',
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#b71c1c'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#DB292D'}
                >
                    ×
                </button>

                <h2 style={{ fontSize: '1.5rem', marginBottom: '25px', fontWeight: 'bold' }}>
                    Transaction Details
                    <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 'normal',
                        color: 'var(--text-secondary)',
                        marginLeft: '15px',
                        fontFamily: 'monospace'
                    }}>
                        #{transaction.id || 'N/A'}
                    </span>
                </h2>

                <div style={{ display: 'grid', gap: '20px' }}>
                    {/* Main Status Card */}
                    <div className="stat-card-dark" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
                        <div>
                            <div className="text-muted text-sm" style={{ textTransform: 'uppercase' }}>Total Value</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginTop: '5px' }}>
                                {formatCurrency(transaction.totalValue)}
                            </div>
                        </div>
                        <div style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            backgroundColor: statusBg,
                            color: statusColor,
                            fontWeight: 'bold',
                            border: `1px solid ${statusColor}40`
                        }}>
                            {transaction.type}
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className="stat-card-dark">
                            <div className="text-muted text-sm">Symbol</div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginTop: '5px' }}>{transaction.symbol}</div>
                        </div>
                        <div className="stat-card-dark">
                            <div className="text-muted text-sm">Date</div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginTop: '5px' }}>
                                {transaction.date ? new Date(transaction.date).toLocaleDateString() : 
                                 transaction.timestamp ? new Date(transaction.timestamp).toLocaleDateString() : 'Just now'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                {transaction.date ? new Date(transaction.date).toLocaleTimeString() :
                                 transaction.timestamp ? new Date(transaction.timestamp).toLocaleTimeString() : ''}
                            </div>
                        </div>
                        <div className="stat-card-dark">
                            <div className="text-muted text-sm">Quantity</div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginTop: '5px' }}>
                                {transaction.quantity} <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>units</span>
                            </div>
                        </div>
                        <div className="stat-card-dark">
                            <div className="text-muted text-sm">Price per Unit</div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginTop: '5px' }}>
                                {formatCurrency(transaction.price)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionDetailsModal;
