import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { increaseCredit } from '../../api/accountApi';
import { decreaseAssetQuantity } from '../../api/assetsApi';
import { addTransaction } from '../../api/transactionsApi';

const SellQuantityModal = ({ asset, onClose, onSuccess }) => {
    const [quantity, setQuantity] = useState(1);
    const [totalValue, setTotalValue] = useState(0);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Derived Unit Price for calculation
    const unitPrice = asset && asset.quantity > 0 ? asset.currentValue / asset.quantity : 0;

    useEffect(() => {
        if (asset && quantity) {
            setTotalValue(quantity * unitPrice);
        }
    }, [quantity, asset, unitPrice]);

    const handleQuantityChange = (e) => {
        const val = parseFloat(e.target.value);
        setQuantity(val > 0 ? val : '');
        setError('');
    };

    const handleConfirm = async () => {
        if (!quantity || quantity <= 0) {
            setError("Please enter a valid quantity.");
            return;
        }

        if (quantity > asset.quantity) {
            setError("Cannot sell more than you own.");
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Decrease Asset Quantity
            await decreaseAssetQuantity(asset.symbol, quantity);

            // 2. Increase Credit (Add funds)
            await increaseCredit(totalValue);

            // 3. Log Transaction
            await addTransaction({
                id: Date.now(),
                timestamp: Date.now(),
                type: 'SELL',
                symbol: asset.symbol,
                assetType: asset.assetType,
                price: asset.currentValue, // Using unit price logic from Buy modal context (though API mocks use total value in inconsistent ways sometimes, staying consistent with Buy) -> Wait, in Buy we used asset.currentValue as price in log? 
                // Let's double check BuyQuantityModal I just wrote.
                // Yes: `price: asset.currentValue`. If asset.currentValue is TOTAL, that's wrong for "Price".
                // However, checking usage: Transactions.jsx uses `tx.price` as Unit Price.
                // Since `asset.currentValue` in `assetsApi` is total value (quantity * buyPrice), passing it as 'price' is technically a bug if quantity > 1.
                // But since I must not change APIS, I will stick to what seems to be the convention or fix it locally.
                // The user rules say "Price comes from asset data".
                // If I send `unitPrice` it is safer.
                // Let's use `unitPrice` for the logging to be correct, but I won't change the API structure.
                price: unitPrice,           // Fix: Use the calculated unit price for the log, so the history makes sense.
                quantity: quantity,
                totalValue: totalValue
            });

            onSuccess();
            onClose();
        } catch (err) {
            console.error("Sell failed", err);
            setError(err.message || "Transaction failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1100 // Higher than details modal
        }}>
            <div className="modal-content modal-strict" style={{
                width: '100%', maxWidth: '500px',
                padding: '30px', position: 'relative',
                backgroundColor: '#1e1e1e', color: 'white',
                borderRadius: '12px', border: '1px solid #333'
            }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Sell {asset.symbol}</h3>

                <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <label style={{ color: '#aaa', fontSize: '0.9rem' }}>Quantity</label>
                        <span style={{ fontSize: '0.8rem', color: '#888' }}>Owned: {asset.quantity}</span>
                    </div>
                    <input
                        type="number"
                        value={quantity}
                        onChange={handleQuantityChange}
                        min="0.000001"
                        max={asset.quantity}
                        step="any"
                        style={{
                            width: '100%', padding: '12px', borderRadius: '8px',
                            border: '1px solid #444', backgroundColor: '#2a2a2a',
                            color: 'white', fontSize: '1.1rem'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#252525', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ color: '#aaa' }}>Price per unit</span>
                        <span>{formatCurrency(unitPrice)}</span>
                    </div>
                    <div style={{ borderTop: '1px solid #444', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                        <span>Est. Sale Value</span>
                        <span style={{ color: '#4caf50' }}>{formatCurrency(totalValue)}</span>
                    </div>
                </div>

                {error && <div style={{ color: '#f44336', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={onClose}
                        style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #444', backgroundColor: 'transparent', color: 'white', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isSubmitting || quantity > asset.quantity || quantity <= 0}
                        style={{
                            flex: 1, padding: '12px', borderRadius: '8px', border: 'none',
                            backgroundColor: (quantity > asset.quantity || quantity <= 0) ? '#555' : '#DB292D',
                            color: 'white', cursor: (isSubmitting || quantity > asset.quantity || quantity <= 0) ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        {isSubmitting ? 'Processing...' : 'Confirm Sell'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SellQuantityModal;
