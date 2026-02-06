import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { 
    Box, 
    Container, 
    Typography, 
    Card, 
    CardContent, 
    Grid, 
    Stack,
    Divider,
    Chip
} from '@mui/material';
import { TrendingUp, TrendingDown, AccountBalance, ShowChart, AccountBalanceWallet } from '@mui/icons-material';
import PortfolioChart from '../../components/charts/PortfolioChart';
import PerformanceCard from '../../components/cards/PerformanceCard';
import { getPortfolioSummary, getPortfolioPerformance, getAssetAllocation, getInvestmentBreakdown, getPerformers } from '../../api/portfolioApi';
import { getAssets, updateCurrentPrice } from '../../api/assetsApi';
import AssetAllocationPieChart from '../../components/charts/AssetAllocationPieChart';
import './Home.css';

import { formatCurrency } from '../../utils/formatCurrency';
import { formatPercentage } from '../../utils/formatPercentage';

const Home = () => {
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [allocationData, setAllocationData] = useState(null);
    const [assets, setAssets] = useState([]);
    const [breakdown, setBreakdown] = useState([]);
    const [performers, setPerformers] = useState({ topPerformers: [], lowestPerformers: [] });
    const [loading, setLoading] = useState(true);
    const [livePrices, setLivePrices] = useState({});
    const [lastUpdateTime, setLastUpdateTime] = useState(null);



    useEffect(() => {
        const fetchData = async () => {
            try {
                const summaryData = await getPortfolioSummary();
                const performanceData = await getPortfolioPerformance();
                const allocation = await getAssetAllocation();
                const assetsData = await getAssets();
                const breakdownData = await getInvestmentBreakdown();
                const performersData = await getPerformers();
                
                console.log("Portfolio Performance Data:", performanceData);
                console.log("Performance Data Length:", performanceData?.length);
                console.log("Performers Data:", performersData);
                console.log("Top Performers:", performersData?.topPerformers);
                console.log("Lowest Performers:", performersData?.lowestPerformers);
                
                setSummary(summaryData);
                setChartData(performanceData || []);
                setAllocationData(allocation);
                setAssets(assetsData);
                setBreakdown(breakdownData);
                setPerformers(performersData);
            } catch (error) {
                console.error("Failed to fetch portfolio data", error);
                setChartData([]); // Set empty array on error
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Socket.IO for live portfolio prices (updates every 3 minutes)
    useEffect(() => {
        if (!assets || assets.length === 0) return;

        const socket = io('http://localhost:5000');

        socket.on('connect', () => {
            console.log('Portfolio Socket connected');
            // Subscribe to assets based on type
            assets.forEach(asset => {
                if (asset.assetType?.toLowerCase().includes('fund') || asset.assetType?.toLowerCase().includes('mutual')) {
                    // For mutual funds, use different endpoint or skip live updates
                    // Mutual funds update once a day, so we can skip socket subscription
                    console.log(`Skipping socket for mutual fund: ${asset.symbol}`);
                } else {
                    // For stocks, crypto, commodities
                    socket.emit('subscribe_ticker', { ticker: asset.symbol });
                }
            });
        });

        socket.on('price_update', (data) => {
            console.log('Portfolio Price update:', data);
            setLivePrices(prev => ({
                ...prev,
                [data.ticker]: data.price
            }));
            setLastUpdateTime(data.timestamp);
            
            // Update database with new price
            updateCurrentPrice(data.ticker, data.price)
                .then(() => {
                    console.log(`Database updated for ${data.ticker}: ${data.price}`);
                })
                .catch((error) => {
                    console.error(`Failed to update database for ${data.ticker}:`, error);
                });
        });

        socket.on('error', (error) => {
            console.error('Portfolio Socket error:', error);
        });

        return () => {
            assets.forEach(asset => {
                if (!asset.assetType?.toLowerCase().includes('fund')) {
                    socket.emit('unsubscribe_ticker', { ticker: asset.symbol });
                }
            });
            socket.disconnect();
        };
    }, [assets]);

    const handleCardClick = (asset) => {
        // Navigate to the asset details page
        const assetType = asset.assetType?.toLowerCase().replace(' ', '') || 'stock';
        navigate(`/asset/${assetType}/${asset.symbol}`);
    };

    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '80vh'
            }}>
                <Typography sx={{ color: '#fff', fontSize: '1.2rem' }}>Loading...</Typography>
            </Box>
        );
    }

    // Map breakdown data with icons and colors
    const iconMap = {
        'Stocks': { icon: <ShowChart />, color: '#10b981' },
        'Mutual Funds': { icon: <AccountBalance />, color: '#3b82f6' },
        'Crypto': { icon: <TrendingUp />, color: '#f59e0b' },
        'Commodities': { icon: <TrendingDown />, color: '#8b5cf6' }
    };

    const investmentBreakdown = breakdown.map(item => ({
        type: item.type,
        value: item.value,
        icon: iconMap[item.type]?.icon || <ShowChart />,
        color: iconMap[item.type]?.color || '#10b981'
    }));

    // Calculate live portfolio value and gain/loss
    const livePortfolioValue = assets.reduce((total, asset) => {
        const currentPrice = livePrices[asset.symbol] || asset.currentPrice;
        return total + (currentPrice * asset.quantity);
    }, 0);

    const totalInvestedValue = summary?.totalInvested || 0;
    const liveGain = livePortfolioValue - totalInvestedValue;
    const liveGainPercentage = totalInvestedValue > 0 ? (liveGain / totalInvestedValue) * 100 : 0;

    const isPositive = liveGain >= 0;

    // Format time since last update
    const formatUpdateTime = (timestamp) => {
        if (!timestamp) return 'Updating...';
        const now = new Date();
        const updateTime = new Date(timestamp);
        const diffMs = now - updateTime;
        const diffSeconds = Math.floor(diffMs / 1000);
        
        if (diffSeconds < 60) {
            return `${diffSeconds} second${diffSeconds !== 1 ? 's' : ''} ago`;
        } else if (diffSeconds < 3600) {
            const minutes = Math.floor(diffSeconds / 60);
            return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        } else if (diffSeconds < 86400) {
            const hours = Math.floor(diffSeconds / 3600);
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(diffSeconds / 86400);
            return `${days} day${days !== 1 ? 's' : ''} ago`;
        }
    };

    return (
        <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh', pb: 6 }}>
            <Container maxWidth="xl" sx={{ pt: 3 }}>
                {/* Hero Section */}
                <Box sx={{ mb: 3 }}>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            color: '#fff', 
                            fontWeight: '600',
                            mb: 0.5,
                            fontSize: { xs: '1.5rem', md: '2rem' }
                        }}
                    >
                        Portfolio Dashboard
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        Welcome back, {summary?.userName || 'User'}
                    </Typography>
                </Box>

                {/* Portfolio Value Card */}
                <Card sx={{ 
                    bgcolor: '#111', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    mb: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                }}>
                    <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" spacing={4} alignItems="center" flexWrap="wrap">
                            <Box>
                                <Chip 
                                    icon={<AccountBalanceWallet sx={{ color: '#4caf50 !important' }} />}
                                    label="Total Portfolio Value"
                                    sx={{ 
                                        bgcolor: 'rgba(76, 175, 80, 0.1)',
                                        color: '#4caf50',
                                        border: '1px solid rgba(76, 175, 80, 0.3)',
                                        fontWeight: '600',
                                        fontSize: '0.75rem',
                                        mb: 1.5,
                                        '& .MuiChip-icon': {
                                            color: '#4caf50'
                                        }
                                    }}
                                />
                                <Typography 
                                    variant="h3" 
                                    sx={{ 
                                        color: '#fff', 
                                        fontWeight: '700',
                                        fontSize: { xs: '2rem', md: '2.75rem' }
                                    }}
                                >
                                    {formatCurrency(livePortfolioValue || summary?.portfolioValue || 0)}
                                </Typography>
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        color: 'rgba(255,255,255,0.4)',
                                        fontSize: '0.7rem',
                                        mt: 0.5,
                                        display: 'block'
                                    }}
                                >
                                    Last updated: {formatUpdateTime(lastUpdateTime)}
                                </Typography>
                            </Box>
                            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                            <Box>
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        color: 'rgba(255,255,255,0.6)', 
                                        textTransform: 'uppercase',
                                        letterSpacing: 1.2,
                                        fontSize: '0.7rem',
                                        fontWeight: '500',
                                        mb: 0.5,
                                        display: 'block'
                                    }}
                                >
                                    Total Invested
                                </Typography>
                                <Typography 
                                    variant="h4" 
                                    sx={{ 
                                        color: 'rgba(255,255,255,0.8)',
                                        fontWeight: '600',
                                        fontSize: { xs: '1.5rem', md: '2rem' }
                                    }}
                                >
                                    {formatCurrency(summary?.totalInvested || 0)}
                                </Typography>
                            </Box>
                            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                            <Box>
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        color: 'rgba(255,255,255,0.6)', 
                                        textTransform: 'uppercase',
                                        letterSpacing: 1.2,
                                        fontSize: '0.7rem',
                                        fontWeight: '500',
                                        mb: 0.5,
                                        display: 'block'
                                    }}
                                >
                                    Total Gain/Loss
                                </Typography>
                                <Stack direction="row" spacing={1.5} alignItems="baseline">
                                    <Typography 
                                        variant="h4" 
                                        sx={{ 
                                            color: isPositive ? '#00c853' : '#ff1744',
                                            fontWeight: '700',
                                            fontSize: { xs: '1.5rem', md: '2rem' }
                                        }}
                                    >
                                        {isPositive ? '+' : ''}{formatCurrency(liveGain || summary?.totalGain || 0)}
                                    </Typography>
                                    <Typography 
                                        variant="h6" 
                                        sx={{ 
                                            color: isPositive ? '#00c853' : '#ff1744',
                                            fontWeight: '600',
                                            fontSize: { xs: '1rem', md: '1.25rem' }
                                        }}
                                    >
                                        ({isPositive ? '+' : ''}{formatPercentage(liveGainPercentage || summary?.gainPercentage || 0)})
                                    </Typography>
                                </Stack>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>

                {/* Charts Section */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: '1 1 48%', minWidth: '400px' }}>
                        <Card sx={{ 
                            bgcolor: '#111', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 2,
                            height: '100%',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                        }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Typography 
                                    variant="subtitle1" 
                                    sx={{ 
                                        color: '#fff', 
                                        fontWeight: '600',
                                        mb: 2,
                                        fontSize: '1rem'
                                    }}
                                >
                                    Asset Allocation
                                </Typography>
                                <AssetAllocationPieChart data={allocationData} />
                            </CardContent>
                        </Card>
                    </Box>
                    <Box sx={{ flex: '1 1 48%', minWidth: '400px' }}>
                        <Card sx={{ 
                            bgcolor: '#111', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 2,
                            height: '100%',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                        }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Typography 
                                    variant="subtitle1" 
                                    sx={{ 
                                        color: '#fff', 
                                        fontWeight: '600',
                                        mb: 2,
                                        fontSize: '1rem'
                                    }}
                                >
                                    Portfolio Performance
                                </Typography>
                                <PortfolioChart data={chartData} />
                            </CardContent>
                        </Card>
                    </Box>
                </Box>

                {/* Investment Breakdown */}
                <Box sx={{ mb: 3 }}>
                    <Typography 
                        variant="subtitle1" 
                        sx={{ 
                            color: '#fff', 
                            fontWeight: '600',
                            mb: 2,
                            fontSize: '1rem'
                        }}
                    >
                        Investment Breakdown
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {investmentBreakdown.map((item) => (
                            <Box key={item.type} sx={{ flex: '1 1 23%', minWidth: '200px' }}>
                                <Card 
                                    onClick={() => navigate('/holdings')}
                                    sx={{ 
                                        bgcolor: '#111', 
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 2,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            borderColor: item.color,
                                            boxShadow: `0 4px 12px ${item.color}20`
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 2.5 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                                            <Typography 
                                                variant="caption" 
                                                sx={{ 
                                                    color: 'rgba(255,255,255,0.5)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: 1,
                                                    fontSize: '0.65rem',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                {item.type}
                                            </Typography>
                                            <Box sx={{ color: item.color, opacity: 0.9, fontSize: '1.25rem' }}>
                                                {item.icon}
                                            </Box>
                                        </Stack>
                                        <Typography 
                                            variant="h5" 
                                            sx={{ 
                                                color: item.value > 0 ? '#fff' : 'rgba(255,255,255,0.2)',
                                                fontWeight: '700',
                                                fontSize: '1.5rem'
                                            }}
                                        >
                                            {formatCurrency(item.value)}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Performance Section */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {/* Top Performers */}
                    <Box sx={{ flex: '1 1 48%', minWidth: '400px' }}>
                        <Card sx={{ 
                            bgcolor: '#111', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 2,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                        }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Stack direction="row" spacing={1} alignItems="center" mb={2.5}>
                                    <Box sx={{ 
                                        width: 3, 
                                        height: 20, 
                                        bgcolor: '#00c853', 
                                        borderRadius: 1 
                                    }} />
                                    <Typography 
                                        variant="subtitle1" 
                                        sx={{ 
                                            color: '#fff', 
                                            fontWeight: '600',
                                            fontSize: '1rem'
                                        }}
                                    >
                                        Top Performers
                                    </Typography>
                                </Stack>
                                <Stack spacing={1.5}>
                                    {performers.topPerformers && performers.topPerformers.length > 0 ? (
                                        performers.topPerformers.map(asset => (
                                            <Box 
                                                key={`top-${asset.id}`} 
                                                onClick={() => handleCardClick(asset)}
                                                sx={{ cursor: 'pointer' }}
                                            >
                                                <PerformanceCard
                                                    label="Top Performer"
                                                    name={asset.companyName}
                                                    value={asset.currentValue}
                                                    percentage={asset.percentageChange}
                                                    hideLabel={true}
                                                />
                                            </Box>
                                        ))
                                    ) : (
                                        <Typography sx={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', py: 3, fontSize: '0.9rem' }}>
                                            No assets available
                                        </Typography>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Box>

                    {/* Lowest Performers */}
                    <Box sx={{ flex: '1 1 48%', minWidth: '400px' }}>
                        <Card sx={{ 
                            bgcolor: '#111', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 2,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                        }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Stack direction="row" spacing={1} alignItems="center" mb={2.5}>
                                    <Box sx={{ 
                                        width: 3, 
                                        height: 20, 
                                        bgcolor: '#ff1744', 
                                        borderRadius: 1 
                                    }} />
                                    <Typography 
                                        variant="subtitle1" 
                                        sx={{ 
                                            color: '#fff', 
                                            fontWeight: '600',
                                            fontSize: '1rem'
                                        }}
                                    >
                                        Lowest Performers
                                    </Typography>
                                </Stack>
                                <Stack spacing={1.5}>
                                    {performers.lowestPerformers && performers.lowestPerformers.length > 0 ? (
                                        performers.lowestPerformers.map(asset => (
                                            <Box 
                                                key={`low-${asset.id}`} 
                                                onClick={() => handleCardClick(asset)}
                                                sx={{ cursor: 'pointer' }}
                                            >
                                                <PerformanceCard
                                                    label="Lowest Performer"
                                                    name={asset.companyName}
                                                    value={asset.currentValue}
                                                    percentage={asset.percentageChange}
                                                    hideLabel={true}
                                                />
                                            </Box>
                                        ))
                                    ) : (
                                        <Typography sx={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', py: 3, fontSize: '0.9rem' }}>
                                            No assets available
                                        </Typography>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default Home;
