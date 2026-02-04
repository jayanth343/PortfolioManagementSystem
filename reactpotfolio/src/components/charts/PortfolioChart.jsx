import React from 'react';
import PriceChart from './PriceChart';

const PortfolioChart = ({ data }) => {
    // Map data to { time, value } if necessary, or pass directly if API aligns.
    // Assuming portfolio API returns { date: 'YYYY-MM-DD', value: number }
    // PriceChart normalization handles 'date' key.

    return (
        <div className="portfolio-chart" style={{ height: '350px', width: '100%', marginTop: '20px' }}>
            <h3 style={{ marginBottom: '20px' }}>Portfolio Performance</h3>
            <div style={{ height: '320px', width: '100%', backgroundColor: '#1e1e1e', borderRadius: '12px', padding: '10px', overflow: 'hidden' }}>
                {data && data.length > 0 ? (
                    <PriceChart data={data} height={300} />
                ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                        Loading Performance Data...
                    </div>
                )}
            </div>
        </div>
    );
};

export default PortfolioChart;
