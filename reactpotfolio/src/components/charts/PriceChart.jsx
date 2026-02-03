import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, AreaSeries } from 'lightweight-charts';

/**
 * Helper: Normalize data to { time: 'YYYY-MM-DD', value: number }
 * Handles:
 * - { date: ... } or { time: ... }
 * - Strings ('Mon'), invalid dates (generates fallback)
 * - Timestamps
 * - Deduplication and sorting
 */
const normalizeData = (inputData) => {
    if (!Array.isArray(inputData) || inputData.length === 0) return [];

    // 1. Standardize keys and values
    const raw = inputData.map(d => {
        const val = d.value !== undefined ? d.value : d.price;
        const t = d.time !== undefined ? d.time : d.date;
        return { originalTime: t, value: val };
    }).filter(d => d.value !== undefined && d.value !== null && !isNaN(d.value));

    if (raw.length === 0) return [];

    // 2. Check if generation is needed (heuristics for invalid/missing dates)
    const firstTime = raw[0].originalTime;
    let needsGeneration = false;

    if (!firstTime) {
        needsGeneration = true;
    } else {
        const d = new Date(firstTime);
        if (isNaN(d.getTime())) needsGeneration = true;
        // If string is short (e.g. "Mon" = 3 chars), strictly treat as label -> generate dates
        if (typeof firstTime === 'string' && firstTime.length < 8) needsGeneration = true;
    }

    let normalized = [];

    if (needsGeneration) {
        // Generate sequence ending today
        const today = new Date();
        normalized = raw.map((item, i) => {
            const d = new Date(today);
            d.setDate(d.getDate() - (raw.length - 1 - i));
            return {
                time: d.toISOString().split('T')[0],
                value: parseFloat(item.value)
            };
        });
    } else {
        // Parse dates
        normalized = raw.map(item => {
            let timeStr = null;
            const t = item.originalTime;

            if (t instanceof Date) {
                timeStr = t.toISOString().split('T')[0];
            } else if (typeof t === 'number') {
                const d = new Date(t);
                if (!isNaN(d.getTime())) timeStr = d.toISOString().split('T')[0];
            } else if (typeof t === 'string') {
                const d = new Date(t);
                if (!isNaN(d.getTime())) timeStr = d.toISOString().split('T')[0];
            }

            if (!timeStr) return null;
            return { time: timeStr, value: parseFloat(item.value) };
        }).filter(Boolean);
    }

    // 3. Sort and Deduplicate
    // lightweight-charts REQUIRES strictly ascending time
    normalized.sort((a, b) => (a.time > b.time ? 1 : -1));

    const unique = [];
    const seen = new Set();
    for (const item of normalized) {
        if (!seen.has(item.time)) {
            seen.add(item.time);
            unique.push(item);
        }
    }

    return unique;
};


const PriceChart = ({ data, height = 300, color = '#DB292D' }) => {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);

    // 1. Creation Effect - Runs ONCE
    useEffect(() => {
        if (!chartContainerRef.current) return;
        if (chartRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#d1d4dc',
            },
            width: chartContainerRef.current.clientWidth,
            height: height,
            grid: {
                vertLines: { color: 'rgba(42, 46, 57, 0)' },
                horzLines: { color: 'rgba(42, 46, 57, 0.2)' },
            },
            timeScale: {
                borderColor: 'rgba(197, 203, 206, 0.4)',
                timeVisible: true,
                secondsVisible: false,
            },
            rightPriceScale: {
                borderColor: 'rgba(197, 203, 206, 0.4)',
                visible: true,
            },
            crosshair: {
                vertLine: {
                    color: color,
                    width: 1,
                    style: 3,
                    labelBackgroundColor: color,
                },
                horzLine: {
                    color: color,
                    width: 1,
                    style: 3,
                    labelBackgroundColor: color,
                },
            },
        });

        chartRef.current = chart;

        // V4 API Compatible Series Creation
        const newSeries = chart.addSeries(AreaSeries, {
            lineColor: color,
            topColor: `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.4)`,
            bottomColor: `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.0)`,
            lineWidth: 2,
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

    // 2. Data Update Effect with Normalization
    useEffect(() => {
        if (!seriesRef.current) return;

        const validData = normalizeData(data);

        if (validData.length > 0) {
            if (process.env.NODE_ENV === 'development') {
                console.log('PriceChart Normalized Data:', validData[0], '... total:', validData.length);
            }
            seriesRef.current.setData(validData);
            if (chartRef.current) {
                chartRef.current.timeScale().fitContent();
            }
        } else {
            // Check if we should clear
        }

    }, [data]);

    // 3. Style Update
    useEffect(() => {
        if (!chartRef.current || !seriesRef.current) return;
        chartRef.current.applyOptions({ height: height });
        seriesRef.current.applyOptions({
            lineColor: color,
            topColor: `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.4)`,
            bottomColor: `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.0)`,
        });
    }, [height, color]);

    return (
        <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
    );
};

export default PriceChart;
