# Portfolio Management System

A full-stack portfolio management application with real-time market data, AI-powered recommendations, and comprehensive portfolio analysis.

## 🚀 Quick Start

See [QUICK_START.md](QUICK_START.md) for detailed setup instructions.

### TL;DR
```bash
# 1. Start Flask API
cd Backend && python app.py

# 2. Start Java Backend
mvn spring-boot:run

# 3. Start React Frontend
cd reactpotfolio && npm start
```

## 📁 Architecture

```
React Frontend (Port 3000)
    ↓
Java Spring Boot Proxy (Port 8080)
    ↓
Flask API (Port 5000)
    ↓
yfinance → Yahoo Finance
```

## 🎯 Features

### Market Data
- **Real-time Stock Quotes**: Live data for stocks, crypto, mutual funds, commodities
- **Historical Charts**: Price history with multiple time periods (1D - 2Y)
- **Asset Search**: Search across US, UK, and India exchanges
- **News & Analysis**: Latest news and analyst recommendations

### Portfolio Management
- **Smart Performance Analysis**: 
  - Best/worst performers with ±5% threshold
  - No duplicate stocks in best/worst lists
  - Quantity-weighted calculations
- **Comprehensive Metrics**:
  - Investment value vs current value
  - Total and per-share gains/losses
  - Annualized returns (CAGR)
  - Portfolio weight percentages
  - Asset type detection (Stock, ETF, Crypto, etc.)
- **AI Recommendations**: FinBERT sentiment analysis with buy/sell/hold suggestions

### Frontend Features
- Portfolio overview dashboard
- Holdings management
- Performance charts
- Asset search and details
- Responsive design

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Installation and setup guide
- **[FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)** - React-Backend integration details
- **[API_ENDPOINTS.md](API_ENDPOINTS.md)** - Complete API documentation
- **[Backend/DataAPI_ARCHITECTURE.md](Backend/DataAPI_ARCHITECTURE.md)** - Flask API architecture
- **[Backend/RECOMMENDATION_SYSTEM.md](Backend/RECOMMENDATION_SYSTEM.md)** - AI recommendation system

## 🏗️ Project Structure

### Backend (Python Flask)
```
Backend/
├── app.py                          # Main Flask application
├── services/
│   ├── stock_service.py            # Market data & portfolio analysis
│   └── recommendation_service.py   # AI recommendations
└── sample_portfolio_data.json      # Test data
```

### Proxy (Java Spring Boot)
```
src/main/java/org/hsbc/
└── controller/
    └── StockDataController.java    # Proxy endpoints
```

### Frontend (React)
```
reactpotfolio/src/
├── api/
│   ├── config.js                   # API configuration
│   ├── marketApi.js                # Market data integration
│   ├── assetsApi.js                # Asset management
│   └── portfolioApi.js             # Portfolio operations
├── components/                     # Reusable components
├── pages/                          # Page components
└── App.jsx                         # Main app
```

## 🔧 Technology Stack

### Backend
- **Python 3.8+**: Flask, yfinance
- **AI/ML**: Transformers (FinBERT), PyTorch
- **Java 17+**: Spring Boot, RestTemplate

### Frontend
- **React 18**: Hooks, Context API
- **Styling**: CSS Modules
- **HTTP Client**: Fetch API with timeout handling

## 📊 API Endpoints

### Market Data
- `GET /api/yfdata/stocks/{symbol}` - Stock data
- `GET /api/yfdata/crypto/{symbol}` - Cryptocurrency data
- `GET /api/yfdata/mutual-funds/{symbol}` - Mutual fund data
- `GET /api/yfdata/commodities/{symbol}` - Commodity data
- `GET /api/yfdata/history/{symbol}?period=1MO` - Historical prices
- `GET /api/yfdata/search?q={query}` - Search assets

### Portfolio Analysis
- `POST /api/yfdata/portfolio/performers` - Best/worst performers
- `POST /api/yfdata/portfolio/recommendations` - AI recommendations
- `GET /api/yfdata/stock/{symbol}/analysis` - Stock analysis

See [API_ENDPOINTS.md](API_ENDPOINTS.md) for complete documentation.

## 🧪 Testing

### Sample Portfolio Data

Use `Backend/sample_portfolio_data.json` for testing:

```json
{
  "holdings": [
    { "symbol": "AAPL", "quantity": 50, "buy_price": 150.0, "purchase_date": "2024-01-15" },
    { "symbol": "GOOGL", "quantity": 30, "buy_price": 140.0, "purchase_date": "2024-02-01" }
  ]
}
```

### Test Commands

```bash
# Test portfolio analysis
curl -X POST http://localhost:8080/api/yfdata/portfolio/performers \
  -H "Content-Type: application/json" \
  -d @Backend/sample_portfolio_data.json

# Test search
curl "http://localhost:8080/api/yfdata/search?q=apple"

# Test stock data
curl "http://localhost:8080/api/yfdata/stocks/AAPL"
```

## 🎨 Base Architecture

### Home Page
- Total Portfolio Stats
- Best & Worst Performers (±5% threshold)
- Recent Activities
- Performance Charts

### Buy/Sell Page
- Asset Search (US, UK, India exchanges)
- Detailed Asset View
- Buy/Sell Operations
- Real-time Pricing

### Holdings Page
- Detailed Investment Breakdown
- Comprehensive Metrics
- Portfolio Weight Distribution
- Asset Type Classification

## 🔒 Configuration

### Backend URLs

Update in [reactpotfolio/src/api/config.js](reactpotfolio/src/api/config.js):

```javascript
export const JAVA_API_URL = 'http://localhost:8080/api/yfdata';
export const REQUEST_TIMEOUT = 30000;
```

### CORS

Java backend allows all origins by default. Modify in [StockDataController.java](src/main/java/org/hsbc/controller/StockDataController.java):

```java
@CrossOrigin(origins = "*")  // Change to specific origin for production
```

## 🐛 Troubleshooting

See [QUICK_START.md#common-issues](QUICK_START.md#common-issues) for solutions to common problems.

## 📝 License

This project is for educational purposes.

## 🤝 Contributing

1. Ensure all three services (Flask, Java, React) are running
2. Test changes with sample portfolio data
3. Update documentation for API changes
4. Follow existing code structure and conventions

