import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, AreaSeries } from 'lightweight-charts';
import { JAVA_API_URL } from '../../api/config';

// Period configurations with their intervals
const PERIOD_CONFIGS = [
    { label: '1D', period: '1d', interval: '1m' },
    { label: '5D', period: '5d', interval: '5m' },
    { label: '1M', period: '1mo', interval: '1h' },
    { label: '3M', period: '3mo', interval: '1d' },
    { label: '6M', period: '6mo', interval: '1d' },
    { label: '1Y', period: '1y', interval: '1d' },
    { label: '5Y', period: '5y', interval: '1d' },
    { label: 'Max', period: 'max', interval: '1mo' },
];

/**
 * Helper: Normalize data to
 *  { time: 'YYYY-MM-DD' | number, value: number }
 * Handles:
 * - { date: ... } or { time: ... }
 * - Unix timestamps (numbers) for intraday data
 * - Date strings for daily data
 * - Strings ('Mon'), invalid dates (generates fallback)
 * - Deduplication and sorting
 */
const normalizeData = (inputData) => {
    if (!Array.isArray(inputData) || inputData.length === 0) return [];

    // 1. Standardize keys and values
    const raw = inputData.map(d => {
        const val = d.value !== undefined ? d.value : (d.price !== undefined ? d.price : d.close);
        const t = d.time !== undefined ? d.time : d.date;
        return { originalTime: t, value: val };
    }).filter(d => d.value !== undefined && d.value !== null && !isNaN(d.value));

    if (raw.length === 0) return [];

    // 2. Check if data is intraday (Unix timestamps) or daily (date strings)
    const firstTime = raw[0].originalTime;
    let isIntradayData = typeof firstTime === 'number' && firstTime > 1000000000; // Unix timestamp check
    
    let needsGeneration = false;

    if (!firstTime) {
        needsGeneration = true;
    } else if (!isIntradayData) {
        // Check if date string is valid
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
    } else if (isIntradayData) {
        // Intraday data: use Unix timestamps as-is
        normalized = raw.map(item => ({
            time: item.originalTime, // Already a Unix timestamp (seconds)
            value: parseFloat(item.value)
        }));
    } else {
        // Daily data: parse dates to 'YYYY-MM-DD' format
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


const PriceChart = ({ symbol, height = 400, color = '#DB292D', initialPeriod = '1M' }) => {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);
    const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch historical data from API
    const fetchHistoryData = async (periodLabel) => {
        if (!symbol) {
            console.log('PriceChart: No symbol provided');
            return;
        }

        const config = PERIOD_CONFIGS.find(p => p.label === periodLabel);
        if (!config) {
            console.log('PriceChart: Invalid period config');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const url = `${JAVA_API_URL}/history/${symbol}?period=${config.period}&interval=${config.interval}`;
            console.log('PriceChart: Fetching from', url, 'with', config);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('PriceChart: API error', response.status, errorText);
                throw new Error(`Failed to fetch history data: ${response.status}`);
            }

            const data = await response.json();
            console.log('PriceChart: Received data', data);
            
            // Transform data for chart (use close price as value)
            const transformed = data.data?.map(item => ({
                time: item.time,
                value: item.close,
            })) || [];

            console.log('PriceChart: Transformed data points:', transformed.length);
            if (transformed.length > 0) {
                console.log('PriceChart: First point:', transformed[0]);
                console.log('PriceChart: Last point:', transformed[transformed.length - 1]);
            }

            setChartData(transformed);
        } catch (err) {
            console.error('PriceChart: Error fetching history:', err);
            setError(err.message);
            setChartData([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data when symbol or period changes
    useEffect(() => {
        fetchHistoryData(selectedPeriod);
    }, [symbol, selectedPeriod]);

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
                tickMarkFormatter: (time, tickMarkType, locale) => {
                    // Will be updated dynamically based on data
                    return '';
                },
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
        if (!seriesRef.current) {
            console.log('PriceChart: Series not ready yet');
            return;
        }

        console.log('PriceChart: Processing chartData', chartData.length, 'points');
        const validData = normalizeData(chartData);

        if (validData.length > 0) {
            console.log('PriceChart: Setting', validData.length, 'normalized points');
            console.log('PriceChart: First normalized:', validData[0]);
            console.log('PriceChart: Last normalized:', validData[validData.length - 1]);
            
            seriesRef.current.setData(validData);
            if (chartRef.current) {
                chartRef.current.timeScale().fitContent();
                
                // Configure time scale based on selected period
                const currentConfig = PERIOD_CONFIGS.find(p => p.label === selectedPeriod);
                const isIntradayData = typeof validData[0].time === 'number';
                
                // Only show time for 1D period, all others show dates
                if (selectedPeriod === '1D' && isIntradayData) {
                    // 1D period: show time (HH:MM)
                    chartRef.current.applyOptions({
                        timeScale: {
                            timeVisible: true,
                            secondsVisible: false,
                            tickMarkFormatter: (time) => {
                                const date = new Date(time * 1000);
                                const hours = date.getHours().toString().padStart(2, '0');
                                const minutes = date.getMinutes().toString().padStart(2, '0');
                                return `${hours}:${minutes}`;
                            },
                        },
                    });
                } else {
                    // All other periods: show date/month/year (no time)
                    const intervalMap = {
                        '1d': 'day',
                        '1mo': 'month',
                    };
                    const interval = currentConfig?.interval || '1d';
                    const formatType = intervalMap[interval] || 'day';
                    
                    chartRef.current.applyOptions({
                        timeScale: {
                            timeVisible: false,
                            secondsVisible: false,
                            tickMarkFormatter: (time) => {
                                let date;
                                if (typeof time === 'number') {
                                    // Unix timestamp (for 5D period with 5m intervals)
                                    date = new Date(time * 1000);
                                } else if (typeof time === 'string') {
                                    date = new Date(time);
                                } else {
                                    return time.toString();
                                }
                                
                                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                
                                if (formatType === 'month') {
                                    // For monthly intervals (Max period), show month + year
                                    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
                                } else {
                                    // For daily intervals, show Mon DD or Mon DD, YYYY
                                    const currentYear = new Date().getFullYear();
                                    const showYear = date.getFullYear() !== currentYear;
                                    return showYear 
                                        ? `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
                                        : `${monthNames[date.getMonth()]} ${date.getDate()}`;
                                }
                            },
                        },
                    });
                }
            }
        } else {
            console.log('PriceChart: No valid data after normalization');
        }
    }, [chartData, selectedPeriod]);

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
        <div style={{ width: '100%', position: 'relative' }}>
            {/* Period Tabs */}
            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '12px',
                flexWrap: 'wrap',
                justifyContent: 'center',
            }}>
                {PERIOD_CONFIGS.map(config => (
                    <button
                        key={config.label}
                        onClick={() => setSelectedPeriod(config.label)}
                        disabled={loading}
                        style={{
                            padding: '6px 16px',
                            border: selectedPeriod === config.label 
                                ? `2px solid ${color}` 
                                : '2px solid rgba(197, 203, 206, 0.3)',
                            borderRadius: '6px',
                            background: selectedPeriod === config.label 
                                ? `${color}15` 
                                : 'transparent',
                            color: selectedPeriod === config.label 
                                ? color 
                                : '#d1d4dc',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '13px',
                            fontWeight: selectedPeriod === config.label ? '600' : '500',
                            transition: 'all 0.2s ease',
                            opacity: loading ? 0.5 : 1,
                        }}
                    >
                        {config.label}
                    </button>
                ))}
            </div>

            {/* Loading/Error State */}
            {loading && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#d1d4dc',
                    fontSize: '14px',
                    zIndex: 10,
                }}>
                    Loading chart data...
                </div>
            )}

            {error && (
                <div style={{
                    padding: '12px',
                    background: 'rgba(219, 41, 45, 0.1)',
                    border: '1px solid rgba(219, 41, 45, 0.3)',
                    borderRadius: '6px',
                    color: '#DB292D',
                    fontSize: '14px',
                    marginBottom: '12px',
                }}>
                    {error}
                </div>
            )}

            {/* Chart Container */}
            <div 
                ref={chartContainerRef} 
                style={{ 
                    width: '100%', 
                    height: height,
                    opacity: loading ? 0.5 : 1,
                    transition: 'opacity 0.2s ease',
                }} 
            />
        </div>
    );
};

export default PriceChart;
