import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const AssetPriceChart = ({ data }) => {
    if (!Array.isArray(data) || data.length === 0) {
        return <div>Loading chart...</div>;
    }

    return (
        <div className="asset-price-chart" style={{ padding: '0', backgroundColor: 'transparent', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#666"
                        tick={{ fill: '#666', fontSize: 10 }}
                        tickLine={false}
                        dy={10}
                    />
                    <YAxis
                        stroke="#666"
                        tick={{ fill: '#666', fontSize: 10 }}
                        width={35}
                        tickLine={false}
                        axisLine={false}
                        domain={['auto', 'auto']}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ color: '#888' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#DB292D"
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AssetPriceChart;
