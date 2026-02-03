import React from 'react';

const PerformanceCard = ({ label, name, value, percentage }) => {
    return (
        <div className="performance-card card">
            <div className="text-muted text-sm">{label}</div>
            <div style={{ margin: '15px 0' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{name}</h3>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{value}</span>
                <span className="text-positive" style={{ fontWeight: 600, padding: '4px 8px', background: 'rgba(76, 175, 80, 0.1)', borderRadius: '4px' }}>
                    {percentage}
                </span>
            </div>
        </div>
    );
};

export default PerformanceCard;
