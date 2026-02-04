import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
            setSearchQuery(''); // Optional: clear after search
        }
    };

    return (
        <header className="app-header" style={{ display: 'flex', flexDirection: 'column', padding: '20px 40px', backgroundColor: '#1e1e1e', borderBottom: '1px solid #333' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>Portfolio Manager</h1>
                <div className="search-container" style={{ width: '400px' }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Search assets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-dark"
                            style={{
                                flex: 1,
                                backgroundColor: '#121212',
                                border: '1px solid #333',
                                color: 'white',
                                borderRadius: '8px',
                                padding: '10px 15px'
                            }}
                        />
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ padding: '10px 20px', borderRadius: '8px' }}
                        >
                            Search
                        </button>
                    </form>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <nav style={{ display: 'flex', gap: '30px' }}>
                    <NavLink
                        to="/"
                        end
                        style={({ isActive }) => ({
                            textDecoration: 'none',
                            color: isActive ? '#DB292D' : 'var(--text-primary, #e0e0e0)',
                            fontWeight: 'bold',
                            borderBottom: isActive ? '2px solid #DB292D' : '2px solid transparent',
                            paddingBottom: '4px',
                            transition: 'color 0.2s, border-color 0.2s'
                        })}
                    >
                        Dashboard
                    </NavLink>
                    <NavLink
                        to="/holdings"
                        style={({ isActive }) => ({
                            textDecoration: 'none',
                            color: isActive ? '#DB292D' : 'var(--text-primary, #e0e0e0)',
                            fontWeight: 'bold',
                            borderBottom: isActive ? '2px solid #DB292D' : '2px solid transparent',
                            paddingBottom: '4px',
                            transition: 'color 0.2s, border-color 0.2s'
                        })}
                    >
                        Holdings
                    </NavLink>
                    <NavLink
                        to="/transactions"
                        style={({ isActive }) => ({
                            textDecoration: 'none',
                            color: isActive ? '#DB292D' : 'var(--text-primary, #e0e0e0)',
                            fontWeight: 'bold',
                            borderBottom: isActive ? '2px solid #DB292D' : '2px solid transparent',
                            paddingBottom: '4px',
                            transition: 'color 0.2s, border-color 0.2s'
                        })}
                    >
                        Transactions
                    </NavLink>
                </nav>

                <div className="credit-balance" style={{ textAlign: 'right' }}>
                    <div className="text-muted text-sm" style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '2px' }}>Credit Balance</div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{formatCurrency(credit)}</div>
                </div>
            </div>
        </header>
    );
};

export default Header;
