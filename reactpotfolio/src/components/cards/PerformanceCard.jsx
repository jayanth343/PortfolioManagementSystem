import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatPercentage } from '../../utils/formatPercentage';

const PerformanceCard = ({ label, name, value, percentage, hideLabel }) => {
    const isPositive = percentage >= 0;
    const badgeColor = isPositive ? '#4caf50' : '#f44336';
    const badgeBg = isPositive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)';

    return (
        <div className="performance-card card">
            {!hideLabel && <div className="text-muted text-sm">{label}</div>}
            <div style={{ margin: '15px 0' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>{name}</h3>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>{formatCurrency(value)}</span>
                <span style={{
                    fontWeight: 600,
                    padding: '4px 8px',
                    background: badgeBg,
                    color: badgeColor,
                    borderRadius: '4px'
                }}>
                    {formatPercentage(percentage)}
                </span>
            </div>
        </div>
    );
};

export default PerformanceCard;
