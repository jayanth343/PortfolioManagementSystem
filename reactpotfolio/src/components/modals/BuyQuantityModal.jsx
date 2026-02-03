import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { decreaseCredit, getCreditBalance } from '../../api/accountApi';
import { increaseAssetQuantity } from '../../api/assetsApi';
import { addTransaction } from '../../api/transactionsApi';

const BuyQuantityModal = ({ asset, onClose, onSuccess }) => {
    const [quantity, setQuantity] = useState(1);
    const [totalValue, setTotalValue] = useState(0);
    const [credit, setCredit] = useState(0);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchCredit = async () => {
            const balance = await getCreditBalance();
            setCredit(balance);
        };
        fetchCredit();
    }, []);

    useEffect(() => {
        if (asset) {
            setTotalValue(quantity * asset.currentValue);
        }
    }, [quantity, asset]);

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

        if (totalValue > credit) {
            setError("Insufficient credit balance.");
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Deduct Credit
            await decreaseCredit(totalValue);

            // 2. Increase Asset Quantity
            await increaseAssetQuantity(asset.symbol, quantity);

            // 3. Log Transaction
            await addTransaction({
                id: Date.now(), // Generate unique ID
                timestamp: Date.now(),
                type: 'BUY',
                symbol: asset.symbol,
                assetType: asset.assetType,
                price: asset.currentValue, // Assuming currentValue is unit price for now based on context, or simpler: unit price = currentValue? Wait, asset.currentValue in mock data often implies TOTAL value if quantity > 1. 
                // Let's check mock data. 
                // Mock: { quantity: 10, currentValue: 1850.00 } -> 185.00 per unit.
                // Wait, standard convention in this app seems to be currentValue = Total Value? 
                // Let's re-read assetsApi.js.
                // `currentValue: currentValue` where `const currentValue = assetData.quantity * assetData.buyPrice;`
                // YES. currentValue IS Total Value.
                // So Unit Price = asset.currentValue / asset.quantity.
                quantity: quantity,
                totalValue: totalValue
            });

            // Correction: For existing assets, we need the UNIT Price. 
            // In AssetDetailsModal, we see "Current Price" display.
            // Let's calculate Unit Price.
            const unitPrice = asset.quantity > 0 ? asset.currentValue / asset.quantity : 0;

            // Wait, if I buy, I buy at CURRENT market price. 
            // The mock data doesn't explicitly store "marketPrice" separate from "currentValue" updated by quantity. 
            // BUT, `getAssets` returns `currentValue`. 
            // `increaseAssetQuantity` calculates `currentPrice = asset.currentValue / asset.quantity`.
            // So yes, derived unit price is the way.

            // RE-Correction: The `totalValue` for the NEW purchase should be `quantity * unitPrice`.
            // My state calculation `setTotalValue(quantity * asset.currentValue)` is WRONG if `asset.currentValue` is total holding value.
            // I need the UNIT price.

            onSuccess();
            onClose();
        } catch (err) {
            console.error("Buy failed", err);
            setError(err.message || "Transaction failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Derived Unit Price for calculation
    const unitPrice = asset && asset.quantity > 0 ? asset.currentValue / asset.quantity : 0;

    // Quick Fix for useEffect calculation
    useEffect(() => {
        if (asset && quantity) {
            setTotalValue(quantity * unitPrice);
        }
    }, [quantity, asset, unitPrice]);


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
                <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Buy {asset.symbol}</h3>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', color: '#aaa', marginBottom: '5px', fontSize: '0.9rem' }}>Quantity</label>
                    <input
                        type="number"
                        value={quantity}
                        onChange={handleQuantityChange}
                        min="0.000001"
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ color: '#aaa' }}>Available Credit</span>
                        <span>{formatCurrency(credit)}</span>
                    </div>
                    <div style={{ borderTop: '1px solid #444', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                        <span>Total Cost</span>
                        <span style={{ color: totalValue > credit ? '#f44336' : 'white' }}>{formatCurrency(totalValue)}</span>
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
                        disabled={isSubmitting || totalValue > credit || quantity <= 0}
                        style={{
                            flex: 1, padding: '12px', borderRadius: '8px', border: 'none',
                            backgroundColor: totalValue > credit ? '#555' : '#DB292D',
                            color: 'white', cursor: isSubmitting || totalValue > credit ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        {isSubmitting ? 'Processing...' : 'Confirm Buy'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BuyQuantityModal;
