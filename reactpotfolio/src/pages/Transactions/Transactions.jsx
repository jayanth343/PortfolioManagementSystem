import React, { useEffect, useState } from 'react';
import { getTransactions } from '../../api/transactionsApi';
import { formatCurrency } from '../../utils/formatCurrency';
import TransactionDetailsModal from '../../components/modals/TransactionDetailsModal';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const data = await getTransactions();
                setTransactions(data);
            } catch (error) {
                console.error("Failed to fetch transactions", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    if (loading) {
        return (
            <div className="transactions-page" style={{
                padding: '40px',
                maxWidth: '1200px',
                margin: '0 auto',
                minHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white'
            }}>
                <h2 style={{ marginBottom: '20px' }}>Transaction History</h2>
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Loading transactions...
                </div>
            </div>
        );
    }

    return (
        <div className="transactions-page" style={{
            padding: '40px',
            maxWidth: '1200px',
            margin: '0 auto',
            minHeight: '80vh'
        }}>
            <h1 style={{ marginBottom: '40px', fontSize: '2rem' }}>Transaction History</h1>

            {transactions.length === 0 ? (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '60px',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '12px',
                    textAlign: 'center',
                    border: '1px solid #333',
                    minHeight: '400px'
                }}>
                    <span style={{ fontSize: '4rem', display: 'block', marginBottom: '20px' }}>📝</span>
                    <h3 style={{ marginTop: 0, marginBottom: '10px', fontSize: '1.5rem' }}>No transactions yet</h3>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1.1rem' }}>
                        Buy or sell assets to see your history here.
                    </p>
                </div>
            ) : (
                <div className="transactions-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Header Row */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1.2fr',
                        padding: '10px 20px',
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        <div>Symbol</div>
                        <div>Type</div>
                        <div style={{ textAlign: 'right' }}>Price</div>
                        <div style={{ textAlign: 'right' }}>Quantity</div>
                        <div style={{ textAlign: 'right' }}>Total Value</div>
                        <div style={{ textAlign: 'right' }}>Date</div>
                    </div>

                    {/* Data Rows */}
                    {transactions.map((tx, index) => {
                        const transactionDate = new Date(tx.timestamp);
                        const formattedDate = transactionDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        });
                        const formattedTime = transactionDate.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                        
                        return (
                        <div
                            key={tx.id || index}
                            onClick={() => setSelectedTransaction(tx)}
                            className="transaction-card"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1.2fr',
                                padding: '20px',
                                backgroundColor: '#1a1a1a',
                                borderRadius: '12px',
                                alignItems: 'center',
                                border: '1px solid transparent',
                                transition: 'transform 0.2s, background-color 0.2s, box-shadow 0.2s',
                                cursor: 'pointer'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#252525';
                                e.currentTarget.style.transform = 'scale(1.01)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = '#1a1a1a';
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.borderColor = 'transparent';
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{tx.symbol}</div>
                            </div>
                            <div>
                                <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    backgroundColor: tx.type === 'BUY' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                                    color: tx.type === 'BUY' ? '#4caf50' : '#f44336'
                                }}>
                                    {tx.type}
                                </span>
                            </div>
                            <div style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(tx.price)}</div>
                            <div style={{ textAlign: 'right' }}>{tx.quantity}</div>
                            <div style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(tx.totalValue)}</div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.9rem' }}>{formattedDate}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formattedTime}</div>
                            </div>
                        </div>
                        );
                    })}
                </div>
            )}

            {selectedTransaction && (
                <TransactionDetailsModal
                    transaction={selectedTransaction}
                    onClose={() => setSelectedTransaction(null)}
                />
            )}
        </div>
    );
};

export default Transactions;
