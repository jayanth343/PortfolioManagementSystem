import React from 'react';
import PriceChart from './PriceChart';

const PortfolioChart = ({ data }) => {
    // Map data to { time, value } if necessary, or pass directly if API aligns.
    // Assuming portfolio API returns { date: 'YYYY-MM-DD', value: number }
    // PriceChart normalization handles 'date' key.

    console.log("PortfolioChart received data:", data);
    console.log("Data type:", typeof data, "Is Array:", Array.isArray(data), "Length:", data?.length);

    return (
        <div className="portfolio-chart" style={{ height: '350px', width: '100%' }}>
            <div style={{ height: '320px', width: '100%', backgroundColor: 'transparent', borderRadius: '12px', padding: '10px', overflow: 'hidden' }}>
                {data && Array.isArray(data) && data.length > 0 ? (
                    <PriceChart data={data} height={300} />
                ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', flexDirection: 'column', gap: '10px' }}>
                        <div>Loading Performance Data...</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            {data === null ? 'Waiting for data...' : 
                             data === undefined ? 'Data undefined' : 
                             !Array.isArray(data) ? `Invalid data type: ${typeof data}` : 
                             'No data available'}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PortfolioChart;
