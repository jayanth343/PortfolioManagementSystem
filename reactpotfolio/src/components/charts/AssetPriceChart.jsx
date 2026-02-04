import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, LineSeries } from 'lightweight-charts';

// Reuse normalization logic to be safe, or import it if extracted
const normalizeData = (inputData) => {
    if (!Array.isArray(inputData) || inputData.length === 0) return [];

    // Auto-generate dates if simple mock data (Mon, Tue...)
    const needsGeneration = inputData.some(d => !d.date && !d.time) || inputData[0]?.date?.length < 8;

    if (needsGeneration) {
        const today = new Date();
        return inputData.map((item, i) => {
            const d = new Date(today);
            d.setDate(d.getDate() - (inputData.length - 1 - i));
            return {
                time: d.toISOString().split('T')[0],
                value: parseFloat(item.price || item.value)
            };
        }).sort((a, b) => (a.time > b.time ? 1 : -1));
    }

    // Standard parse
    return inputData.map(d => {
        let t = d.time || d.date;
        if (typeof t === 'string' && t.length > 5) {
            const dt = new Date(t);
            if (!isNaN(dt.getTime())) t = dt.toISOString().split('T')[0];
        }
        return {
            time: t,
            value: parseFloat(d.price || d.value)
        };
    }).filter(d => d.time && !isNaN(d.value))
        .sort((a, b) => (a.time > b.time ? 1 : -1))
        .filter((item, index, self) => index === self.findIndex(t => t.time === item.time)); // Unique
};

const AssetPriceChart = ({ data }) => {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;
        if (chartRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#666',
            },
            width: chartContainerRef.current.clientWidth,
            height: 300,
            grid: {
                vertLines: { visible: false },
                horzLines: { color: 'rgba(42, 46, 57, 0.1)', style: 2 },
            },
            timeScale: {
                borderColor: '#333',
                timeVisible: true,
                secondsVisible: false,
            },
            rightPriceScale: {
                borderColor: '#333',
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1,
                },
            },
            crosshair: {
                vertLine: {
                    color: '#666',
                    width: 1,
                    style: 3,
                    labelBackgroundColor: '#666',
                },
                horzLine: {
                    color: '#666',
                    width: 1,
                    style: 3,
                    labelBackgroundColor: '#666',
                },
            },
        });

        chartRef.current = chart;

        // Line Series for Asset Price
        const newSeries = chart.addSeries(LineSeries, {
            color: '#DB292D',
            lineWidth: 2,
            crosshairMarkerVisible: true,
            crosshairMarkerRadius: 4,
            crosshairMarkerBorderColor: '#DB292D',
            crosshairMarkerBackgroundColor: 'white',
        });

        seriesRef.current = newSeries;

        const resizeObserver = new ResizeObserver(entries => {
            if (entries.length === 0 || !chartRef.current) return;
            const newRect = entries[0].contentRect;
            chartRef.current.applyOptions({ width: newRect.width });
        });

        resizeObserver.observe(chartContainerRef.current);

        return () => {
            resizeObserver.disconnect();
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
                seriesRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!seriesRef.current || !data) return;
        const validData = normalizeData(data);
        if (validData.length > 0) {
            seriesRef.current.setData(validData);
            if (chartRef.current) chartRef.current.timeScale().fitContent();
        }
    }, [data]);

    return (
        <div className="asset-price-chart" style={{ padding: '0', backgroundColor: 'transparent', height: '300px', width: '100%' }}>
            <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
};

export default AssetPriceChart;
