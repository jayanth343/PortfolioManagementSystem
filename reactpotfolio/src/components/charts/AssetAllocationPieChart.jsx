import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';

const AssetAllocationPieChart = ({ data }) => {
    // Colors matching Recharts version
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];
    const [hoverIndex, setHoverIndex] = useState(null);

    if (!data || data.length === 0) {
        return (
            <div className="pie-chart-container" style={{ height: '350px', width: '100%', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a1a', borderRadius: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>No allocation data available</span>
            </div>
        );
    }

    // Calculations for SVG Paths
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativeAngle = 0;

    const getCoordinatesForPercent = (percent) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    }

    const slices = data.map((item, index) => {
        const percent = item.value / total;
        const startAngle = cumulativeAngle;
        const endAngle = cumulativeAngle + percent;
        cumulativeAngle += percent;

        // SVG Circle Logic (rotated -90deg to start at top)
        const [startX, startY] = getCoordinatesForPercent(startAngle);
        const [endX, endY] = getCoordinatesForPercent(endAngle);
        const largeArcFlag = percent > 0.5 ? 1 : 0;

        // Path command
        const pathData = [
            `M ${startX} ${startY}`, // Move
            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc
            `L 0 0`, // Line to center
        ].join(' ');

        return { ...item, pathData, color: COLORS[index % COLORS.length], percent };
    });

    return (
        <div className="pie-chart-container" style={{ height: '350px', width: '100%', marginTop: '20px' }}>
            <h3 style={{ marginBottom: '20px' }}>Asset Allocation</h3>
            <div style={{ height: '100%', width: '100%', backgroundColor: '#1a1a1a', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                {/* SVG Chart */}
                <div style={{ position: 'relative', width: '220px', height: '220px' }}>
                    <svg viewBox="-1.1 -1.1 2.2 2.2" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
                        {slices.map((slice, index) => (
                            <path
                                key={index}
                                d={slice.pathData}
                                fill={slice.color}
                                stroke="#1a1a1a"
                                strokeWidth="0.02"
                                style={{
                                    transition: 'transform 0.2s, opacity 0.2s',
                                    transform: hoverIndex === index ? 'scale(1.05)' : 'scale(1)',
                                    opacity: hoverIndex !== null && hoverIndex !== index ? 0.6 : 1,
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={() => setHoverIndex(index)}
                                onMouseLeave={() => setHoverIndex(null)}
                            />
                        ))}
                    </svg>

                    {/* Tooltip (Center Overlay for Donut effect or absolute) */}
                    {hoverIndex !== null && (
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            pointerEvents: 'none',
                            textAlign: 'center',
                            zIndex: 10
                        }}>
                            <div style={{ backgroundColor: 'rgba(0,0,0,0.8)', padding: '5px 10px', borderRadius: '4px', border: '1px solid #333' }}>
                                <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 'bold' }}>{data[hoverIndex].assetType}</div>
                                <div style={{ fontSize: '0.7rem', color: '#ccc' }}>{formatCurrency(data[hoverIndex].value)}</div>
                                <div style={{ fontSize: '0.7rem', color: slices[hoverIndex].color }}>{(slices[hoverIndex].percent * 100).toFixed(1)}%</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
                    {slices.map((slice, index) => (
                        <div
                            key={index}
                            style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', color: '#ccc', cursor: 'pointer', opacity: hoverIndex !== null && hoverIndex !== index ? 0.5 : 1 }}
                            onMouseEnter={() => setHoverIndex(index)}
                            onMouseLeave={() => setHoverIndex(null)}
                        >
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: slice.color, marginRight: '6px' }}></div>
                            {slice.assetType}
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default AssetAllocationPieChart;
