import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AssetCard from '../../components/cards/AssetCard';
import BuyAssetModal from '../../components/modals/BuyAssetModal';
import { getAssets, addAsset, sellAsset } from '../../api/assetsApi';
import './Holdings.css';

const Holdings = () => {
    const navigate = useNavigate();
    const [assets, setAssets] = useState([]);
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchAssets = async () => {
        try {
            const data = await getAssets();
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

    const handleAssetClick = (asset) => {
        // Navigate to the asset details page
        const assetType = asset.assetType?.toLowerCase().replace(' ', '') || 'stock';
        navigate(`/asset/${assetType}/${asset.symbol}`);
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

    const handleSellAsset = async (asset) => {
        try {
            await sellAsset(asset.id);
            await fetchAssets(); // Refresh list
        } catch (error) {
            console.error("Error selling asset:", error);
        }
    };

    const getAssetsByType = (type) => assets.filter(asset => asset.assetType === type);

    const renderSection = (title, type) => {
        const items = getAssetsByType(type);
        if (items.length === 0) return null;
        return (
            <div className="holdings-section" key={type}>
                <h2 style={{ borderLeft: '4px solid var(--accent-red)', paddingLeft: '10px' }}>{title}</h2>
                <div className="holdings-list">
                    {items.map(asset => (
                        <AssetCard
                            key={asset.id}
                            {...asset}
                            onClick={handleAssetClick}
                        />
                    ))}
                </div>
            </div>
        );
    };

    if (loading) {
        return <div className="holdings-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>Loading Holdings...</div>;
    }

    return (
        <div className="holdings-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                            borderRadius: '15px',   // squircle
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            lineHeight: '5',        // helps center vertically
                            paddingTop: '5px'       // nudges arrow upward
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#b71c1c'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#DB292D'}
                    >←
                    </Link>


                    <h1>Your Holdings</h1>
                </div>


            </div>

            {renderSection('Stocks', 'Stocks')}
            {renderSection('Mutual Funds', 'Mutual Funds')}
            {renderSection('Commodities', 'Commodities')}
            {renderSection('Crypto', 'Crypto')}

            {showBuyModal && (
                <BuyAssetModal
                    onClose={() => setShowBuyModal(false)}
                    onSubmit={handleBuySubmit}
                />
            )}
        </div>
    );
};

export default Holdings;
