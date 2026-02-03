import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const PortfolioChart = ({ data }) => {
    return (
        <div className="portfolio-chart" style={{ height: '350px', width: '100%', marginTop: '20px' }}>
            <h3 style={{ marginBottom: '20px' }}>Portfolio Performance</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 30, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis
                        dataKey="date"
                        stroke="#888"
                        tick={{ fill: '#888' }}
                    />
                    <YAxis
                        stroke="#888"
                        tick={{ fill: '#888' }}
                        width={60}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ color: '#888' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#DB292D"
                        strokeWidth={2}
                        dot={{ fill: '#DB292D', r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PortfolioChart;
