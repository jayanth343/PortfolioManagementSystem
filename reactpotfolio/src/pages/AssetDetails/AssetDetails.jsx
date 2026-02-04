import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Grid,
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
    useTheme,
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
} from '@mui/icons-material';
import { getStockData, getCryptoData, getMutualFundData, getCommodityData } from '../../api/marketApi';
import PriceChart from '../../components/charts/PriceChart';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatPercentage } from '../../utils/formatPercentage';

const AssetDetails = () => {
    const { symbol, type = 'stock' } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tabValue, setTabValue] = useState(0);

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
            } catch (err) {
                console.error('Error fetching asset data:', err);
                setError(err.message || 'Failed to load asset details');
            } finally {
                setLoading(false);
            }
        };

        fetchAssetData();
    }, [symbol, type]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
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
            <Container maxWidth="xl" sx={{ py: 4 }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <IconButton 
                        onClick={() => navigate(-1)} 
                        sx={{ 
                            mb: 3,
                            color: '#888',
                            '&:hover': { 
                                bgcolor: 'rgba(255,255,255,0.05)',
                                color: '#fff'
                            }
                        }}
                    >
                        <ArrowBack />
                    </IconButton>
                    
                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" mb={2}>
                        <Typography variant="h3" component="h1" fontWeight="700" sx={{ color: '#fff' }}>
                            {asset.name || asset.tickerSymbol || asset.symbol}
                        </Typography>
                        <Chip 
                            label={asset.tickerSymbol || asset.symbol || asset.schemeCode}
                            sx={{ 
                                bgcolor: 'rgba(255,255,255,0.1)',
                                color: '#fff',
                                fontSize: '1rem',
                                fontWeight: '600',
                                px: 1,
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                            size="large"
                        />
                        {asset.exchange && (
                            <Chip 
                                label={asset.exchange} 
                                sx={{ 
                                    bgcolor: 'transparent',
                                    color: '#888',
                                    border: '1px solid rgba(136,136,136,0.3)'
                                }}
                            />
                        )}
                    </Stack>

                    {/* Price Display */}
                    <Stack direction="row" spacing={3} alignItems="baseline" mb={1}>
                        <Typography variant="h2" component="div" fontWeight="700" sx={{ color: '#fff' }}>
                            {formatCurrency(asset.currentPrice || asset.nav, asset.currency)}
                        </Typography>
                        <Chip
                            icon={isPositive ? <TrendingUp /> : <TrendingDown />}
                            label={formatPercentage(priceChange)}
                            sx={{
                                bgcolor: isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: isPositive ? '#10b981' : '#ef4444',
                                border: `1px solid ${isPositive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                                fontWeight: '600',
                                fontSize: '1rem',
                            }}
                            size="large"
                        />
                    </Stack>
                    {asset.previousClose && (
                        <Typography variant="body1" sx={{ color: '#666' }}>
                            Previous Close: {formatCurrency(asset.previousClose, asset.currency)}
                        </Typography>
                    )}
                </Box>

                <Grid container spacing={3}>
                    {/* Main Chart Section */}
                    <Grid item xs={12} lg={8}>
                        <Paper 
                            elevation={0}
                            sx={{ 
                                p: 3,
                                bgcolor: '#0a0a0a',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: 2,
                            }}
                        >
                            <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                                <ShowChart sx={{ color: '#888' }} />
                                <Typography variant="h5" fontWeight="700" sx={{ color: '#fff' }}>
                                    Price History
                                </Typography>
                            </Stack>
                            <Box sx={{ mt: 2, height: 600 }}>
                                <PriceChart
                                    symbol={asset.tickerSymbol || asset.symbol || asset.schemeCode}
                                    height={600}
                                    color={isPositive ? '#10b981' : '#ef4444'}
                                    initialPeriod="1M"
                                />
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Company Info Sidebar */}
                    <Grid item xs={12} lg={4}>
                        {(asset.sector || asset.industry || asset.country || asset.employees) && (
                            <Paper 
                                elevation={0}
                                sx={{ 
                                    p: 3,
                                    bgcolor: '#0a0a0a',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: 2,
                                    height: '100%'
                                }}
                            >
                                <Typography variant="h6" fontWeight="700" mb={3} sx={{ color: '#fff' }}>
                                    Company Info
                                </Typography>
                                <Stack spacing={2}>
                                    {asset.sector && (
                                        <InfoRow icon={<Business sx={{ color: '#888' }} />} label="Sector" value={asset.sector} />
                                    )}
                                    {asset.industry && (
                                        <InfoRow icon={<Business sx={{ color: '#888' }} />} label="Industry" value={asset.industry} />
                                    )}
                                    {asset.country && (
                                        <InfoRow icon={<Language sx={{ color: '#888' }} />} label="Country" value={asset.country} />
                                    )}
                                    {asset.employees && (
                                        <InfoRow icon={<People sx={{ color: '#888' }} />} label="Employees" value={asset.employees.toLocaleString()} />
                                    )}
                                    {asset.website && (
                                        <Button 
                                            variant="outlined" 
                                            fullWidth 
                                            href={asset.website} 
                                            target="_blank"
                                            startIcon={<Language />}
                                            sx={{
                                                mt: 2,
                                                color: '#fff',
                                                borderColor: 'rgba(255,255,255,0.1)',
                                                '&:hover': {
                                                    borderColor: 'rgba(255,255,255,0.3)',
                                                    bgcolor: 'rgba(255,255,255,0.05)'
                                                }
                                            }}
                                        >
                                            Visit Website
                                        </Button>
                                    )}
                                </Stack>
                            </Paper>
                        )}
                    </Grid>

                    {/* Stats Grid - Full Width */}
                    <Grid item xs={12}>
                        <Paper 
                            elevation={0}
                            sx={{ 
                                p: 3,
                                bgcolor: '#0a0a0a',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: 2,
                            }}
                        >
                            <Typography variant="h6" fontWeight="700" mb={3} sx={{ color: '#fff' }}>
                                Key Statistics
                            </Typography>
                            <Grid container spacing={3}>
                                {asset.volume && (
                                    <Grid item xs={6} sm={4} md={3}>
                                        <StatCard label="Volume" value={asset.volume.toLocaleString()} />
                                    </Grid>
                                )}
                                {asset.marketCap && (
                                    <Grid item xs={6} sm={4} md={3}>
                                        <StatCard label="Market Cap" value={formatCurrency(asset.marketCap, asset.currency)} />
                                    </Grid>
                                )}
                                {asset.fiftyTwoWeekHigh && (
                                    <Grid item xs={6} sm={4} md={3}>
                                        <StatCard label="52W High" value={formatCurrency(asset.fiftyTwoWeekHigh, asset.currency)} />
                                    </Grid>
                                )}
                                {asset.fiftyTwoWeekLow && (
                                    <Grid item xs={6} sm={4} md={3}>
                                        <StatCard label="52W Low" value={formatCurrency(asset.fiftyTwoWeekLow, asset.currency)} />
                                    </Grid>
                                )}
                                {asset.fiftyDayAverage && (
                                    <Grid item xs={6} sm={4} md={3}>
                                        <StatCard label="50D Avg" value={formatCurrency(asset.fiftyDayAverage, asset.currency)} />
                                    </Grid>
                                )}
                                {asset.dividendYield && (
                                    <Grid item xs={6} sm={4} md={3}>
                                        <StatCard label="Dividend Yield" value={formatPercentage(asset.dividendYield * 100)} />
                                    </Grid>
                                )}
                                {asset.analystTargetPrice && (
                                    <Grid item xs={6} sm={4} md={3}>
                                        <StatCard label="Target Price" value={formatCurrency(asset.analystTargetPrice, asset.currency)} />
                                    </Grid>
                                )}
                                {asset.currency && (
                                    <Grid item xs={6} sm={4} md={3}>
                                        <StatCard label="Currency" value={asset.currency} />
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Tabs Section */}
                    <Grid item xs={12}>
                        <Paper 
                            elevation={0}
                            sx={{ 
                                bgcolor: '#0a0a0a',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: 2,
                                overflow: 'hidden'
                            }}
                        >
                            <Tabs 
                                value={tabValue} 
                                onChange={handleTabChange}
                                sx={{ 
                                    borderBottom: 1, 
                                    borderColor: 'rgba(255,255,255,0.05)',
                                    px: 3,
                                    '& .MuiTab-root': {
                                        color: '#666',
                                        fontWeight: '600',
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        '&.Mui-selected': {
                                            color: '#fff',
                                        }
                                    },
                                    '& .MuiTabs-indicator': {
                                        bgcolor: '#fff',
                                        height: 2
                                    }
                                }}
                            >
                                {asset.description && <Tab label="About" />}
                                {asset.news && asset.news.length > 0 && <Tab label={`News (${asset.news.length})`} />}
                                {asset.recommendations && asset.recommendations.length > 0 && <Tab label="Analyst Ratings" />}
                            </Tabs>

                            {/* About Tab */}
                            {asset.description && tabValue === 0 && (
                                <Box sx={{ p: 4 }}>
                                    <Typography variant="body1" sx={{ color: '#ccc', lineHeight: 1.8, fontSize: '1rem' }}>
                                        {asset.description}
                                    </Typography>
                                </Box>
                            )}

                            {/* News Tab with Thumbnails and Scroll */}
                            {asset.news && asset.news.length > 0 && (
                                <Box sx={{ 
                                    display: tabValue === (asset.description ? 1 : 0) ? 'block' : 'none',
                                    maxHeight: '600px',
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
                                    <Stack spacing={2} p={3}>
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
                                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0}>
                                                    {newsItem.thumbnail && (
                                                        <CardMedia
                                                            component="img"
                                                            sx={{ 
                                                                width: { xs: '100%', sm: 200 },
                                                                height: { xs: 200, sm: 150 },
                                                                objectFit: 'cover',
                                                            }}
                                                            image={newsItem.thumbnail}
                                                            alt={newsItem.title}
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    )}
                                                    <CardContent sx={{ flex: 1, p: 2.5 }}>
                                                        <Typography 
                                                            variant="h6" 
                                                            gutterBottom
                                                            sx={{ 
                                                                color: '#fff',
                                                                fontWeight: '600',
                                                                lineHeight: 1.4,
                                                                mb: 1
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
                                                                    lineHeight: 1.6
                                                                }}
                                                            >
                                                                {newsItem.summary}
                                                            </Typography>
                                                        )}
                                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                            <Typography variant="caption" sx={{ color: '#666' }}>
                                                                {newsItem.publisher && `${newsItem.publisher} • `}
                                                                {newsItem.publishedAt && new Date(newsItem.publishedAt).toLocaleDateString()}
                                                            </Typography>
                                                            {newsItem.url && (
                                                                <Button 
                                                                    size="small" 
                                                                    href={newsItem.url} 
                                                                    target="_blank"
                                                                    endIcon={<OpenInNew />}
                                                                    sx={{
                                                                        color: '#888',
                                                                        '&:hover': {
                                                                            color: '#fff',
                                                                            bgcolor: 'rgba(255,255,255,0.05)'
                                                                        }
                                                                    }}
                                                                >
                                                                    Read More
                                                                </Button>
                                                            )}
                                                        </Stack>
                                                    </CardContent>
                                                </Stack>
                                            </Card>
                                        ))}
                                    </Stack>
                                </Box>
                            )}

                            {/* Recommendations Tab */}
                            {asset.recommendations && asset.recommendations.length > 0 && (
                                <Box sx={{ 
                                    p: 3, 
                                    display: tabValue === ((asset.description ? 1 : 0) + (asset.news?.length ? 1 : 0)) ? 'block' : 'none' 
                                }}>
                                    <Stack spacing={2}>
                                        {asset.recommendations.map((rec, index) => (
                                            <Card 
                                                key={index} 
                                                sx={{ 
                                                    p: 2, 
                                                    bgcolor: '#000',
                                                    border: '1px solid rgba(255,255,255,0.05)',
                                                    borderRadius: 2,
                                                }}
                                            >
                                                <Typography variant="body1" sx={{ color: '#ccc' }}>
                                                    {JSON.stringify(rec)}
                                                </Typography>
                                            </Card>
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

// Helper components
const StatCard = ({ label, value }) => (
    <Box>
        <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {label}
        </Typography>
        <Typography variant="h6" fontWeight="700" sx={{ color: '#fff', mt: 0.5 }}>
            {value}
        </Typography>
    </Box>
);

const InfoRow = ({ icon, label, value }) => (
    <Stack direction="row" alignItems="center" spacing={1.5}>
        {icon}
        <Box>
            <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                {label}
            </Typography>
            <Typography variant="body2" fontWeight="600" sx={{ color: '#fff' }}>
                {value}
            </Typography>
        </Box>
    </Stack>
);

export default AssetDetails;
