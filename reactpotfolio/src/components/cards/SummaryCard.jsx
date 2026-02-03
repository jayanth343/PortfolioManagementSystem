import React from 'react';

const SummaryCard = ({ title, value, percentage }) => {
    return (
        <div className="summary-card">
            <h3>{title}</h3>
            <div className="value">{value}</div>
            <div className="percentage">{percentage}</div>
        </div>
    );
};

export default SummaryCard;
