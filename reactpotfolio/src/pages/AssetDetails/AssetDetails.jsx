import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Chip,
    Card,
    CardContent,
    CardMedia,
    Divider,
    Button,
    CircularProgress,
    Alert,
    IconButton,
    Tab,
    Tabs,
    Stack,
    Modal,
    TextField,
    Link,
} from '@mui/material';
import {
    ArrowBack,
    TrendingUp,
    TrendingDown,
    Business,
    Language,
    People,
    ShowChart,
    OpenInNew,
    ShoppingCart,
    Close,
} from '@mui/icons-material';
import { getStockData, getCryptoData, getMutualFundData, getCommodityData } from '../../api/marketApi';
import PriceChart from '../../components/charts/PriceChart';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatPercentage } from '../../utils/formatPercentage';
import { JAVA_API_URL } from '../../api/config';
import io from 'socket.io-client';

const AssetDetails = () => {
    const { symbol, type = 'stock' } = useParams();
    const navigate = useNavigate();
    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [buyModalOpen, setBuyModalOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [livePrice, setLivePrice] = useState(null);
    const [priceTimestamp, setPriceTimestamp] = useState(null);
    const [buyLoading, setBuyLoading] = useState(false);
    const [buyError, setBuyError] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [analysisError, setAnalysisError] = useState(null);
    const wsRef = useRef(null);

    useEffect(() => {
        const fetchAssetData = async () => {
            if (!symbol) return;

            setLoading(true);
            setError(null);

            try {
                let data;
                switch (type.toLowerCase()) {
                    case 'crypto':
                        data = await getCryptoData(symbol);
                        break;
                    case 'mutualfund':
                        data = await getMutualFundData(symbol);
                        break;
                    case 'commodity':
                        data = await getCommodityData(symbol);
                        break;
                    default:
                        data = await getStockData(symbol);
                }

                if (data.error) {
                    throw new Error(data.error);
                }

                setAsset(data);
                setLivePrice(data.currentPrice || data.nav);
                setPriceTimestamp(new Date());
            } catch (err) {
                console.error('Error fetching asset data:', err);
                setError(err.message || 'Failed to load asset details');
            } finally {
                setLoading(false);
            }
        };

        fetchAssetData();
    }, [symbol, type]);

    // Socket.IO for live price updates
    useEffect(() => {
        if (!asset) return;

        const tickerSymbol = asset.tickerSymbol || asset.symbol;
        console.log('Connecting to Socket.IO for ticker:', tickerSymbol);
        
        // Initialize Socket.IO connection
        const socket = io('http://localhost:5000');
        
        socket.on('connect', () => {
            console.log('Socket.IO connected');
            // Subscribe to ticker updates
            socket.emit('subscribe_ticker', { ticker: tickerSymbol });
        });
        
        socket.on('subscribed', (data) => {
            console.log('Subscribed to ticker:', data.ticker);
        });
        
        socket.on('price_update', (data) => {
            console.log('Price update received:', data);
            setLivePrice(data.price);
            setPriceTimestamp(new Date());
        });
        
        socket.on('error', (data) => {
            console.error('Socket.IO error:', data.message);
        });
        
        socket.on('disconnect', () => {
            console.log('Socket.IO disconnected');
        });
        
        wsRef.current = socket;

        return () => {
            if (wsRef.current) {
                console.log('Unsubscribing and disconnecting Socket.IO');
                wsRef.current.emit('unsubscribe_ticker');
                wsRef.current.disconnect();
                wsRef.current = null;
            }
        };
    }, [asset]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleBuyClick = () => {
        setBuyModalOpen(true);
        setQuantity(1);
        setBuyError(null);
    };

    const handleBuyClose = () => {
        setBuyModalOpen(false);
    };

    const handleBuySubmit = async () => {
        if (quantity <= 0) {
            setBuyError('Quantity must be greater than 0');
            return;
        }

        setBuyLoading(true);
        setBuyError(null);

        try {
            const price = livePrice || asset.currentPrice || asset.nav;
            const totalCost = price * quantity;

            const response = await fetch(`${JAVA_API_URL}/pms/buy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    symbol: asset.tickerSymbol || asset.symbol,
                    name: asset.name,
                    quantity: quantity,
                    price: price,
                    totalCost: totalCost,
                    currency: asset.currency,
                    type: type,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to complete purchase');
            }

            const result = await response.json();
            alert(`Successfully purchased ${quantity} shares of ${asset.name}`);
            handleBuyClose();
        } catch (err) {
            console.error('Buy error:', err);
            setBuyError(err.message || 'Failed to complete purchase');
        } finally {
            setBuyLoading(false);
        }
    };

    const handleFetchAnalysis = async () => {
        setAnalysisLoading(true);
        setAnalysisError(null);

        try {
            const symbolToUse = asset.tickerSymbol || asset.symbol;
            const response = await fetch(`${JAVA_API_URL}/stock/${symbolToUse}/analysis?inPortfolio=false`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch analysis');
            }

            const data = await response.json();
            setAnalysis(data);
        } catch (err) {
            console.error('Analysis error:', err);
            setAnalysisError(err.message || 'Failed to load analysis');
        } finally {
            setAnalysisLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
                    Go Back
                </Button>
            </Container>
        );
    }

    if (!asset) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="warning">Asset not found</Alert>
                <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
                    Go Back
                </Button>
            </Container>
        );
    }

    const priceChange = asset.dayChangePercent || asset.priceChangePercent || asset.priceChangePercent24h || 0;
    const isPositive = priceChange >= 0;

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            bgcolor: '#000000',
            color: '#ffffff',
        }}>
            <Container maxWidth="xl" sx={{ py: 3 }}>
                {/* Header Section - Groww Style */}
                <Box sx={{ mb: 4 }}>
                    {/* Back Button and Action Row */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                        <IconButton 
                            onClick={() => navigate(-1)} 
                            sx={{ 
                                color: '#888',
                                '&:hover': { 
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                    color: '#fff'
                                }
                            }}
                        >
                            <ArrowBack />
                        </IconButton>
                        <Button
                            variant="contained"
                            startIcon={<ShoppingCart />}
                            onClick={handleBuyClick}
                            size="large"
                            sx={{
                                bgcolor: '#10b981',
                                color: '#000',
                                fontWeight: '700',
                                px: 4,
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '1rem',
                                '&:hover': {
                                    bgcolor: '#059669',
                                }
                            }}
                        >
                            Buy
                        </Button>
                    </Stack>

                    {/* Company Name and Symbol */}
                    <Box sx={{ mb: 3 }}>
                        <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                            <Typography variant="h4" component="h1" fontWeight="600" sx={{ color: '#fff' }}>
                                {asset.name || asset.tickerSymbol || asset.symbol}
                            </Typography>
                            {asset.exchange && (
                                <Chip 
                                    label={asset.exchange} 
                                    size="small"
                                    sx={{ 
                                        bgcolor: 'rgba(255,255,255,0.05)',
                                        color: '#888',
                                        border: '1px solid rgba(136,136,136,0.2)',
                                        fontSize: '0.75rem'
                                    }}
                                />
                            )}
                        </Stack>
                        <Typography variant="body2" sx={{ color: '#666', fontWeight: '500' }}>
                            {asset.tickerSymbol || asset.symbol || asset.schemeCode}
                        </Typography>
                    </Box>

                    {/* Price Section */}
                    <Box sx={{ mb: 2 }}>
                        <Stack direction="row" spacing={2} alignItems="baseline" mb={1}>
                            <Typography 
                                variant="h3" 
                                component="div" 
                                fontWeight="700" 
                                sx={{ 
                                    color: '#fff',
                                    fontSize: '2.5rem'
                                }}
                            >
                                {formatCurrency(livePrice || asset.currentPrice || asset.nav, asset.currency)}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                                {isPositive ? <TrendingUp sx={{ fontSize: '1.25rem', color: '#10b981' }} /> : <TrendingDown sx={{ fontSize: '1.25rem', color: '#ef4444' }} />}
                                <Typography 
                                    variant="h6" 
                                    fontWeight="600" 
                                    sx={{ 
                                        color: isPositive ? '#10b981' : '#ef4444'
                                    }}
                                >
                                    {formatPercentage(priceChange)} ({isPositive ? '+' : ''}{formatCurrency(Math.abs((livePrice || asset.currentPrice || asset.nav) - asset.previousClose), asset.currency)})
                                </Typography>
                            </Stack>
                        </Stack>
                        
                        {/* Meta Info */}
                        <Stack direction="row" spacing={3} alignItems="center">
                            {priceTimestamp && (
                                <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                                    As of {priceTimestamp.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}, {priceTimestamp.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric' })} IST
                                </Typography>
                            )}
                            {asset.previousClose && (
                                <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                                    Prev. Close: <Box component="span" sx={{ color: '#fff', fontWeight: '500' }}>{formatCurrency(asset.previousClose, asset.currency)}</Box>
                                </Typography>
                            )}
                        </Stack>
                    </Box>
                </Box>

                {/* Chart and Company Info */}
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} mb={3}>
                    {/* Chart - 5 parts */}
                    <Box sx={{ flex: 5 }}>
                        <Paper 
                            elevation={0}
                            sx={{ 
                                p: 2.5,
                                bgcolor: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 3,
                            }}
                        >
                            <Typography variant="h6" fontWeight="600" sx={{ color: '#fff', mb: 2 }}>
                                Market Price
                            </Typography>
                            <Box sx={{ height: 500 }}>
                                <PriceChart
                                    symbol={asset.tickerSymbol || asset.symbol || asset.schemeCode}
                                    height={500}
                                    color={isPositive ? '#10b981' : '#ef4444'}
                                    initialPeriod="1M"
                                />
                            </Box>
                        </Paper>
                    </Box>

                    {/* Company Info - 3 parts */}
                    <Box sx={{ flex: 3 }}>
                        <Paper 
                            elevation={0}
                            sx={{ 
                                p: 2.5,
                                bgcolor: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 3,
                                height: '100%'
                            }}
                        >
                            <Typography variant="h6" fontWeight="600" mb={2.5} sx={{ color: '#fff' }}>
                                About
                            </Typography>
                            <Stack spacing={2.5}>
                                {asset.sector && (
                                    <InfoRow label="Sector" value={asset.sector} />
                                )}
                                {asset.industry && (
                                    <InfoRow label="Industry" value={asset.industry} />
                                )}
                                {asset.country && (
                                    <InfoRow label="Country" value={asset.country} />
                                )}
                                {asset.employees && (
                                    <InfoRow label="Employees" value={asset.employees.toLocaleString()} />
                                )}
                                {asset.website && (
                                    <Box sx={{ pt: 2 }}>
                                        <Link 
                                            href={asset.website} 
                                            target="_blank"
                                            underline="none"
                                            sx={{ 
                                                color: '#10b981',
                                                fontSize: '0.875rem',
                                                fontWeight: '500',
                                                '&:hover': { color: '#059669' }
                                            }}
                                        >
                                            Visit Website →
                                        </Link>
                                    </Box>
                                )}
                            </Stack>
                        </Paper>
                    </Box>
                </Stack>

                {/* Tabs Section */}
                <Paper 
                    elevation={0}
                    sx={{ 
                        bgcolor: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 3,
                        overflow: 'hidden'
                    }}
                >
                    <Tabs 
                        value={tabValue} 
                        onChange={handleTabChange}
                        sx={{ 
                            borderBottom: 1, 
                            borderColor: 'rgba(255,255,255,0.08)',
                            px: 2,
                            minHeight: 56,
                            '& .MuiTab-root': {
                                color: '#888',
                                fontWeight: '500',
                                textTransform: 'none',
                                fontSize: '0.9375rem',
                                minHeight: 56,
                                px: 3,
                                '&.Mui-selected': {
                                    color: '#fff',
                                    fontWeight: '600'
                                },
                                '&:hover': {
                                    color: '#fff'
                                }
                            },
                            '& .MuiTabs-indicator': {
                                bgcolor: '#10b981',
                                height: 3,
                                borderRadius: '3px 3px 0 0'
                            }
                        }}
                    >
                        <Tab label="Fundamentals" />
                        <Tab label="News" />
                        <Tab label="Analyst Ratings" />
                        <Tab label="AI Analysis" />
                    </Tabs>

                    {/* Fundamentals Tab */}
                    {tabValue === 0 && (
                        <Box sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="600" mb={3} sx={{ color: '#fff' }}>
                                Key Metrics
                            </Typography>
                            <Box sx={{ 
                                display: 'grid', 
                                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
                                gap: 3,
                                mb: 4
                            }}>
                                {asset.volume && <StatCard label="Volume" value={asset.volume.toLocaleString()} />}
                                {asset.marketCap && <StatCard label="Market Cap" value={formatCurrency(asset.marketCap, asset.currency)} />}
                                {asset.fiftyTwoWeekHigh && <StatCard label="52W High" value={formatCurrency(asset.fiftyTwoWeekHigh, asset.currency)} />}
                                {asset.fiftyTwoWeekLow && <StatCard label="52W Low" value={formatCurrency(asset.fiftyTwoWeekLow, asset.currency)} />}
                                {asset.fiftyDayAverage && <StatCard label="50D Avg" value={formatCurrency(asset.fiftyDayAverage, asset.currency)} />}
                                {asset.twoHundredDayAverage && <StatCard label="200D Avg" value={formatCurrency(asset.twoHundredDayAverage, asset.currency)} />}
                                {asset.dividendYield && <StatCard label="Dividend Yield" value={formatPercentage(asset.dividendYield * 100)} />}
                                {asset.analystTargetPrice && <StatCard label="Target Price" value={formatCurrency(asset.analystTargetPrice, asset.currency)} />}
                                {asset.currency && <StatCard label="Currency" value={asset.currency} />}
                                {asset.beta && <StatCard label="Beta" value={asset.beta.toFixed(2)} />}
                                {asset.peRatio && <StatCard label="P/E Ratio" value={asset.peRatio.toFixed(2)} />}
                                {asset.eps && <StatCard label="EPS" value={formatCurrency(asset.eps, asset.currency)} />}
                            </Box>

                            {asset.description && (
                                <>
                                    <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.08)' }} />
                                    <Typography variant="h6" fontWeight="600" mb={2} sx={{ color: '#fff' }}>
                                        About the Company
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#aaa', lineHeight: 1.7, fontSize: '0.9375rem' }}>
                                        {asset.description}
                                    </Typography>
                                </>
                            )}
                        </Box>
                    )}

                    {/* News Tab */}
                    {tabValue === 1 && (
                        <Box sx={{ 
                            p: 3,
                            maxHeight: '800px',
                            overflowY: 'auto',
                            '&::-webkit-scrollbar': {
                                width: '8px',
                            },
                            '&::-webkit-scrollbar-track': {
                                bgcolor: '#0a0a0a',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                bgcolor: '#333',
                                borderRadius: '4px',
                                '&:hover': {
                                    bgcolor: '#444',
                                }
                            }
                        }}>
                            {asset.news && asset.news.length > 0 ? (
                                <Stack spacing={2}>
                                    {asset.news.map((newsItem, index) => (
                                        <Card 
                                            key={index} 
                                            sx={{ 
                                                bgcolor: '#000',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    borderColor: 'rgba(255,255,255,0.1)',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                                }
                                            }}
                                        >
                                            <Stack direction="row" spacing={2}>
                                                {/* Thumbnail */}
                                                {newsItem.thumbnail && (
                                                    <Box
                                                        component="img"
                                                        src={newsItem.thumbnail}
                                                        alt={newsItem.title}
                                                        sx={{
                                                            width: 200,
                                                            height: 150,
                                                            objectFit: 'cover',
                                                            flexShrink: 0
                                                        }}
                                                    />
                                                )}
                                                
                                                {/* Content */}
                                                <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                    <Typography 
                                                        variant="h6" 
                                                        gutterBottom
                                                        sx={{ 
                                                            color: '#fff',
                                                            fontWeight: '600',
                                                            lineHeight: 1.4,
                                                            mb: 2
                                                        }}
                                                    >
                                                        {newsItem.title}
                                                    </Typography>
                                                    {newsItem.summary && (
                                                        <Typography 
                                                            variant="body2" 
                                                            sx={{ 
                                                                color: '#999',
                                                                mb: 2,
                                                                lineHeight: 1.6,
                                                                flex: 1
                                                            }}
                                                        >
                                                            {newsItem.summary}
                                                        </Typography>
                                                    )}
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center" mt="auto">
                                                        <Stack direction="column" spacing={0.5}>
                                                            {newsItem.publisher && (
                                                                <Typography variant="body2" sx={{ color: '#10b981', fontWeight: '500' }}>
                                                                    {newsItem.publisher}
                                                                </Typography>
                                                            )}
                                                            {newsItem.publishedAt && (
                                                                <Typography variant="caption" sx={{ color: '#666' }}>
                                                                    {new Date(newsItem.publishedAt).toLocaleDateString('en-IN', { 
                                                                        timeZone: 'Asia/Kolkata',
                                                                        month: 'short', 
                                                                        day: 'numeric', 
                                                                        year: 'numeric' 
                                                                    })}
                                                                </Typography>
                                                            )}
                                                        </Stack>
                                                        {newsItem.url && (
                                                            <Button 
                                                                href={newsItem.url}
                                                                target="_blank"
                                                                variant="contained"
                                                                size="small" 
                                                                endIcon={<OpenInNew />}
                                                                sx={{
                                                                    bgcolor: '#10b981',
                                                                    color: '#000',
                                                                    fontWeight: '600',
                                                                    textTransform: 'none',
                                                                    '&:hover': {
                                                                        bgcolor: '#0ea472'
                                                                    }
                                                                }}
                                                            >
                                                                Read Article
                                                            </Button>
                                                        )}
                                                    </Stack>
                                                </CardContent>
                                            </Stack>
                                        </Card>
                                    ))}
                                </Stack>
                            ) : (
                                <Typography variant="body1" sx={{ color: '#666', textAlign: 'center', py: 4 }}>
                                    No news available
                                </Typography>
                            )}
                        </Box>
                    )}

                    {/* Recommendations Tab */}
                    {tabValue === 2 && (
                        <Box sx={{ p: 4 }}>
                            <Typography variant="h5" fontWeight="700" mb={3} sx={{ color: '#fff' }}>
                                Analyst Recommendations
                            </Typography>
                            {asset.recommendations && asset.recommendations.length > 0 ? (
                                <Stack spacing={2}>
                                    {asset.recommendations.map((rec, index) => (
                                        <Card 
                                            key={index} 
                                            sx={{ 
                                                p: 3, 
                                                bgcolor: '#000',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                borderRadius: 2,
                                            }}
                                        >
                                            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                                                <Typography variant="h6" sx={{ color: '#fff', fontWeight: '600' }}>
                                                    {rec.firm || 'Analyst'}
                                                </Typography>
                                                {rec.toGrade && (
                                                    <Chip 
                                                        label={rec.toGrade} 
                                                        size="small"
                                                        sx={{ 
                                                            bgcolor: rec.toGrade.toLowerCase().includes('buy') ? 'rgba(16, 185, 129, 0.2)' : 
                                                                     rec.toGrade.toLowerCase().includes('sell') ? 'rgba(239, 68, 68, 0.2)' : 
                                                                     'rgba(255, 255, 255, 0.1)',
                                                            color: rec.toGrade.toLowerCase().includes('buy') ? '#10b981' : 
                                                                   rec.toGrade.toLowerCase().includes('sell') ? '#ef4444' : '#fff',
                                                        }}
                                                    />
                                                )}
                                            </Stack>
                                            <Typography variant="body2" sx={{ color: '#999' }}>
                                                {rec.action && `Action: ${rec.action}`}
                                                {rec.fromGrade && ` | From: ${rec.fromGrade}`}
                                                {rec.epochGradeDate && ` | Date: ${new Date(rec.epochGradeDate * 1000).toLocaleDateString()}`}
                                            </Typography>
                                        </Card>
                                    ))}
                                </Stack>
                            ) : (
                                <Typography variant="body1" sx={{ color: '#666', textAlign: 'center', py: 4 }}>
                                    No analyst recommendations available
                                </Typography>
                            )}
                        </Box>
                    )}

                    {/* AI Analysis Tab */}
                    {tabValue === 3 && (
                        <Box sx={{ p: 4 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                                <Typography variant="h5" fontWeight="700" sx={{ color: '#fff' }}>
                                    AI-Powered Analysis
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={handleFetchAnalysis}
                                    disabled={analysisLoading}
                                    sx={{
                                        bgcolor: '#10b981',
                                        color: '#fff',
                                        '&:hover': { bgcolor: '#059669' },
                                        '&:disabled': { bgcolor: '#333', color: '#666' }
                                    }}
                                >
                                    {analysisLoading ? 'Analyzing...' : 'Generate Analysis'}
                                </Button>
                            </Stack>

                            {analysisError && (
                                <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                                    {analysisError}
                                </Alert>
                            )}

                            {analysis ? (
                                <Stack spacing={3}>
                                    <Card sx={{ p: 3, bgcolor: '#000', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                            <Typography variant="h6" sx={{ color: '#fff', fontWeight: '600' }}>
                                                Recommendation
                                            </Typography>
                                            <Chip 
                                                label={analysis.action || 'N/A'}
                                                sx={{
                                                    bgcolor: analysis.action?.includes('BUY') ? 'rgba(16, 185, 129, 0.2)' : 
                                                             analysis.action?.includes('SELL') ? 'rgba(239, 68, 68, 0.2)' : 
                                                             'rgba(255, 255, 255, 0.1)',
                                                    color: analysis.action?.includes('BUY') ? '#10b981' : 
                                                           analysis.action?.includes('SELL') ? '#ef4444' : '#fff',
                                                    fontWeight: '700',
                                                    fontSize: '1rem',
                                                    px: 2
                                                }}
                                            />
                                        </Stack>
                                        <Typography variant="body1" sx={{ color: '#ccc', mb: 2 }}>
                                            {analysis.reasoning || 'No reasoning provided'}
                                        </Typography>
                                    </Card>

                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                                        <Card sx={{ p: 3, bgcolor: '#000', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2 }}>
                                            <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>News Sentiment</Typography>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                <Typography variant="h4" sx={{ 
                                                    color: analysis.newsSentiment === 'positive' ? '#10b981' : 
                                                           analysis.newsSentiment === 'negative' ? '#ef4444' : '#888',
                                                    fontWeight: '700',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {analysis.newsSentiment || 'Neutral'}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#666' }}>
                                                    Score: {analysis.sentimentScore?.toFixed(2) || '0.00'}
                                                </Typography>
                                            </Stack>
                                        </Card>

                                        <Card sx={{ p: 3, bgcolor: '#000', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2 }}>
                                            <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>Analyst Recommendation</Typography>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                <Typography variant="h5" sx={{ color: '#fff', fontWeight: '600', textTransform: 'uppercase' }}>
                                                    {analysis.analystRecommendation?.replace('_', ' ') || 'N/A'}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#666' }}>
                                                    Confidence: {(analysis.analystConfidence * 100)?.toFixed(0) || '0'}%
                                                </Typography>
                                            </Stack>
                                        </Card>

                                        <Card sx={{ p: 3, bgcolor: '#000', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2 }}>
                                            <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>Composite Score</Typography>
                                            <Typography variant="h3" sx={{ 
                                                color: (analysis.compositeScore || 0) > 0 ? '#10b981' : '#ef4444',
                                                fontWeight: '700'
                                            }}>
                                                {analysis.compositeScore?.toFixed(2) || '0.00'}
                                            </Typography>
                                        </Card>

                                        <Card sx={{ p: 3, bgcolor: '#000', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2 }}>
                                            <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>Current Price</Typography>
                                            <Typography variant="h4" sx={{ color: '#fff', fontWeight: '600' }}>
                                                {formatCurrency(analysis.currentPrice, asset.currency)}
                                            </Typography>
                                        </Card>
                                    </Box>
                                </Stack>
                            ) : (
                                <Typography variant="body1" sx={{ color: '#666', textAlign: 'center', py: 8 }}>
                                    Click &quot;Generate Analysis&quot; to get AI-powered insights using news sentiment and analyst recommendations
                                </Typography>
                            )}
                        </Box>
                    )}
                </Paper>
            </Container>

            {/* Buy Modal */}
            <Modal
                open={buyModalOpen}
                onClose={handleBuyClose}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Paper
                    sx={{
                        bgcolor: '#0a0a0a',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 2,
                        p: 4,
                        maxWidth: 500,
                        width: '90%',
                        position: 'relative',
                    }}
                >
                    <IconButton
                        onClick={handleBuyClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: '#888',
                            '&:hover': { color: '#fff' }
                        }}
                    >
                        <Close />
                    </IconButton>

                    <Typography variant="h5" fontWeight="700" mb={3} sx={{ color: '#fff' }}>
                        Buy {asset?.name}
                    </Typography>

                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="caption" sx={{ color: '#666', mb: 1 }}>
                                Current Price (Live)
                            </Typography>
                            <Typography variant="h4" fontWeight="700" sx={{ color: '#10b981' }}>
                                {formatCurrency(livePrice || asset?.currentPrice || asset?.nav, asset?.currency)}
                            </Typography>
                        </Box>

                        <TextField
                            label="Quantity"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                            inputProps={{ min: 1 }}
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: '#fff',
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                    '&.Mui-focused fieldset': { borderColor: '#10b981' },
                                },
                                '& .MuiInputLabel-root': { color: '#888' },
                            }}
                        />

                        <Box>
                            <Typography variant="caption" sx={{ color: '#666', mb: 1 }}>
                                Total Cost
                            </Typography>
                            <Typography variant="h5" fontWeight="600" sx={{ color: '#fff' }}>
                                {formatCurrency((livePrice || asset?.currentPrice || asset?.nav) * quantity, asset?.currency)}
                            </Typography>
                        </Box>

                        {buyError && (
                            <Alert severity="error" sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                                {buyError}
                            </Alert>
                        )}

                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={handleBuyClose}
                                disabled={buyLoading}
                                sx={{
                                    color: '#fff',
                                    borderColor: 'rgba(255,255,255,0.1)',
                                    '&:hover': {
                                        borderColor: 'rgba(255,255,255,0.3)',
                                    }
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleBuySubmit}
                                disabled={buyLoading || quantity <= 0}
                                sx={{
                                    bgcolor: '#10b981',
                                    '&:hover': { bgcolor: '#059669' },
                                    '&:disabled': { bgcolor: '#333', color: '#666' }
                                }}
                            >
                                {buyLoading ? 'Processing...' : 'Confirm Purchase'}
                            </Button>
                        </Stack>
                    </Stack>
                </Paper>
            </Modal>
        </Box>
    );
};

// Helper components
const StatCard = ({ label, value }) => (
    <Box>
        <Typography variant="caption" sx={{ color: '#888', fontSize: '0.75rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', mb: 0.5 }}>
            {label}
        </Typography>
        <Typography variant="body1" fontWeight="600" sx={{ color: '#fff', fontSize: '1rem' }}>
            {value}
        </Typography>
    </Box>
);

const InfoRow = ({ label, value }) => (
    <Box>
        <Typography variant="caption" sx={{ color: '#888', fontSize: '0.8125rem', display: 'block', mb: 0.5 }}>
            {label}
        </Typography>
        <Typography variant="body2" fontWeight="500" sx={{ color: '#fff', fontSize: '0.9375rem' }}>
            {value}
        </Typography>
    </Box>
);

export default AssetDetails;
