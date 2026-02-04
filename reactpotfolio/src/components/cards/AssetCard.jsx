import { formatCurrency } from '../../utils/formatCurrency';
import { formatPercentage } from '../../utils/formatPercentage';

const AssetCard = ({ companyName, symbol, quantity, currentValue, percentageChange, assetType, onClick }) => {
    const handleClick = () => {
        if (onClick) {
            onClick({
                companyName,
                symbol,
                quantity,
                currentValue,
                percentageChange,
                assetType
            });
        }
    };

    return (
        <div className="asset-card" onClick={handleClick}>
            <div className="asset-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{companyName} <span style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>{symbol}</span></h3>
                <span className={percentageChange >= 0 ? 'text-positive' : 'text-negative'} style={{ fontWeight: 'bold' }}>{formatPercentage(percentageChange)}</span>
            </div>
            <div className="asset-details" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <div className="text-muted text-sm">Value</div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{formatCurrency(currentValue)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className="text-muted text-sm">Holdings</div>
                    <div style={{ fontWeight: 'bold' }}>{quantity} units</div>
                </div>
            </div>
        </div>
    );
};

export default AssetCard;
