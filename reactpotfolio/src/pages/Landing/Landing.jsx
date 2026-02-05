import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-content">
                    <div className="hero-badge">
                        <span className="badge-icon">📈</span>
                        <span>Portfolio Management Reimagined</span>
                    </div>
                    
                    <h1 className="hero-title">
                        Track, Analyze, and Grow
                        <br />
                        <span className="hero-title-gradient">Your Investments</span>
                    </h1>
                    
                    <p className="hero-description">
                        Professional-grade portfolio management with real-time market data,
                        AI-powered insights, and comprehensive analytics—all in one place.
                    </p>
                    
                    <div className="hero-cta">
                        <button 
                            className="btn-primary-large"
                            onClick={() => navigate('/dashboard')}
                        >
                            Open Dashboard
                            <span className="btn-arrow">→</span>
                        </button>
                        <button 
                            className="btn-secondary-large"
                            onClick={() => navigate('/search')}
                        >
                            Explore Assets
                        </button>
                    </div>

                    {/* Stats Row */}
                    <div className="stats-row">
                        <div className="stat-item">
                            <div className="stat-value">Real-Time</div>
                            <div className="stat-label">Market Data</div>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <div className="stat-value">AI-Powered</div>
                            <div className="stat-label">Recommendations</div>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <div className="stat-value">Multi-Asset</div>
                            <div className="stat-label">Support</div>
                        </div>
                    </div>
                </div>

                {/* Animated Background Grid */}
                <div className="grid-background">
                    <div className="grid-line grid-line-h" style={{ top: '20%' }}></div>
                    <div className="grid-line grid-line-h" style={{ top: '40%' }}></div>
                    <div className="grid-line grid-line-h" style={{ top: '60%' }}></div>
                    <div className="grid-line grid-line-h" style={{ top: '80%' }}></div>
                    <div className="grid-line grid-line-v" style={{ left: '20%' }}></div>
                    <div className="grid-line grid-line-v" style={{ left: '40%' }}></div>
                    <div className="grid-line grid-line-v" style={{ left: '60%' }}></div>
                    <div className="grid-line grid-line-v" style={{ left: '80%' }}></div>
                </div>

                {/* Floating Chart Preview */}
                <div className="chart-preview">
                    <div className="chart-preview-header">
                        <div className="chart-preview-title">Live Market Data</div>
                        <div className="chart-preview-badge positive">+12.4%</div>
                    </div>
                    <svg className="chart-preview-graph" viewBox="0 0 300 120" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="rgba(76, 175, 80, 0.3)" />
                                <stop offset="100%" stopColor="rgba(76, 175, 80, 0)" />
                            </linearGradient>
                        </defs>
                        <path
                            d="M0,80 Q30,70 60,75 T120,65 T180,55 T240,45 T300,35"
                            fill="none"
                            stroke="#4caf50"
                            strokeWidth="2"
                        />
                        <path
                            d="M0,80 Q30,70 60,75 T120,65 T180,55 T240,45 T300,35 L300,120 L0,120 Z"
                            fill="url(#chartGradient)"
                        />
                    </svg>
                    <div className="chart-preview-footer">
                        <span className="chart-ticker">S&P 500</span>
                        <span className="chart-price">$4,783.45</span>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="features-section">
                <div className="section-header">
                    <h2 className="section-title">Everything you need to manage your portfolio</h2>
                    <p className="section-description">
                        Built with modern technology stack for speed, reliability, and accuracy
                    </p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3 className="feature-title">Real-Time Analytics</h3>
                        <p className="feature-description">
                            Track your portfolio performance with live updates and comprehensive charts
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🤖</div>
                        <h3 className="feature-title">AI Recommendations</h3>
                        <p className="feature-description">
                            Get intelligent buy/sell signals based on advanced technical analysis
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">💹</div>
                        <h3 className="feature-title">Multi-Asset Support</h3>
                        <p className="feature-description">
                            Manage stocks, crypto, commodities, and mutual funds all in one place
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">📈</div>
                        <h3 className="feature-title">Performance Tracking</h3>
                        <p className="feature-description">
                            Monitor gains, losses, and returns across your entire investment portfolio
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🔔</div>
                        <h3 className="feature-title">Live Price Updates</h3>
                        <p className="feature-description">
                            Stay updated with real-time price feeds via WebSocket connections
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">📱</div>
                        <h3 className="feature-title">Responsive Design</h3>
                        <p className="feature-description">
                            Access your portfolio anywhere with a seamless mobile experience
                        </p>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="cta-section">
                <div className="cta-content">
                    <h2 className="cta-title">Ready to take control of your investments?</h2>
                    <p className="cta-description">
                        Start managing your portfolio with professional-grade tools today
                    </p>
                    <button 
                        className="btn-cta"
                        onClick={() => navigate('/dashboard')}
                    >
                        Get Started
                        <span className="btn-arrow">→</span>
                    </button>
                </div>
            </div>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-logo">Portfolio Manager</div>
                    <div className="footer-links">
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>Dashboard</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/holdings'); }}>Holdings</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/transactions'); }}>Transactions</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/search'); }}>Search</a>
                    </div>
                    <div className="footer-copyright">
                        © 2026 Portfolio Management System. Built with React & Spring Boot.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
