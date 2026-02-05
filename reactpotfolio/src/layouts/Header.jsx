import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Box, 
    TextField, 
    IconButton, 
    Chip,
    InputAdornment,
    Container
} from '@mui/material';
import { Search, AccountBalanceWallet, TrendingUp } from '@mui/icons-material';
import { getCreditBalance } from '../api/accountApi';
import { formatCurrency } from '../utils/formatCurrency';

const Header = () => {
    const [credit, setCredit] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCredit = async () => {
            try {
                const balance = await getCreditBalance();
                setCredit(balance);
            } catch (error) {
                console.error("Failed to fetch credit balance", error);
            }
        };

        fetchCredit();

        // Listen for transaction updates
        const handleTransactionUpdate = () => {
            fetchCredit();
        };

        window.addEventListener('transactionUpdated', handleTransactionUpdate);

        return () => {
            window.removeEventListener('transactionUpdated', handleTransactionUpdate);
        };
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        }
    };

    const navLinkStyle = (isActive) => ({
        textDecoration: 'none',
        color: isActive ? '#00c853' : 'rgba(255,255,255,0.7)',
        fontWeight: isActive ? '700' : '500',
        fontSize: '0.9rem',
        padding: '8px 16px',
        borderRadius: '6px',
        backgroundColor: isActive ? 'rgba(0, 200, 83, 0.08)' : 'transparent',
        transition: 'all 0.2s',
        '&:hover': {
            color: '#00c853',
            backgroundColor: 'rgba(0, 200, 83, 0.04)'
        }
    });

    return (
        <AppBar 
            position="sticky" 
            sx={{ 
                bgcolor: '#111', 
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
        >
            <Container maxWidth="xl">
                <Toolbar sx={{ py: 1.5, px: 0, gap: 3, flexWrap: 'wrap' }}>
                    {/* Logo/Brand */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUp sx={{ color: '#00c853', fontSize: '2rem' }} />
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                fontWeight: '700', 
                                color: '#fff',
                                fontSize: '1.3rem',
                                letterSpacing: '-0.5px'
                            }}
                        >
                            Portfolio Manager
                        </Typography>
                    </Box>

                    {/* Search Bar */}
                    <Box 
                        component="form" 
                        onSubmit={handleSearch}
                        sx={{ flex: { xs: '1 1 100%', md: '0 1 400px' }, maxWidth: '500px' }}
                    >
                        <TextField
                            size="small"
                            fullWidth
                            placeholder="Search assets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search sx={{ color: 'rgba(255,255,255,0.4)' }} />
                                    </InputAdornment>
                                ),
                                sx: {
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(255,255,255,0.1)'
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(255,255,255,0.2)'
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#00c853',
                                        borderWidth: '1px'
                                    },
                                    '& input::placeholder': {
                                        color: 'rgba(255,255,255,0.4)',
                                        opacity: 1
                                    }
                                }
                            }}
                        />
                    </Box>

                    {/* Spacer */}
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }} />

                    {/* Navigation */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <NavLink to="/" end>
                            {({ isActive }) => (
                                <Box sx={navLinkStyle(isActive)}>
                                    Dashboard
                                </Box>
                            )}
                        </NavLink>
                        <NavLink to="/holdings">
                            {({ isActive }) => (
                                <Box sx={navLinkStyle(isActive)}>
                                    Holdings
                                </Box>
                            )}
                        </NavLink>
                        <NavLink to="/transactions">
                            {({ isActive }) => (
                                <Box sx={navLinkStyle(isActive)}>
                                    Transactions
                                </Box>
                            )}
                        </NavLink>
                    </Box>

                    {/* Credit Balance */}
                    <Chip
                        icon={<AccountBalanceWallet sx={{ color: '#4caf50 !important' }} />}
                        label={formatCurrency(credit)}
                        sx={{
                            bgcolor: 'rgba(76, 175, 80, 0.1)',
                            color: '#4caf50',
                            border: '1px solid rgba(76, 175, 80, 0.3)',
                            fontWeight: '700',
                            fontSize: '0.9rem',
                            px: 1,
                            '& .MuiChip-icon': {
                                color: '#4caf50'
                            },
                            '& .MuiChip-label': {
                                px: 1
                            }
                        }}
                    />
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Header;
