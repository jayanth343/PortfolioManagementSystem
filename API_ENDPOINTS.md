# Portfolio Management System - API Endpoints

## Base URLs
- **Java Backend**: `http://localhost:8080`
- **Flask Data API**: `http://localhost:5000`

---

## 📊 Market Data Endpoints

### 1. Get Stock Data
**Endpoint**: `GET /api/yfdata/stocks/{symbol}`

**Description**: Get comprehensive stock data including price, volume, news, and analyst recommendations.

**Parameters**:
- `symbol` (path): Stock ticker symbol (e.g., AAPL, MSFT, GOOGL)

**Example**:
```bash
GET http://localhost:8080/api/yfdata/stocks/AAPL
```

**Response**: Stock data with current price, previous close, day change %, sector, industry, volume, 52-week high/low, news, recommendations, analyst target price.

---

### 2. Get Cryptocurrency Data
**Endpoint**: `GET /api/yfdata/crypto/{symbol}`

**Description**: Get cryptocurrency data including price, market cap, and volume.

**Parameters**:
- `symbol` (path): Crypto symbol (e.g., BTC, ETH, BNB, SOL)

**Example**:
```bash
GET http://localhost:8080/api/yfdata/crypto/BTC
```

**Response**: Crypto data with current price, 24h/7d/30d price changes, market cap, volume, all-time high/low.

---

### 3. Get Mutual Fund Data
**Endpoint**: `GET /api/yfdata/mutual-funds/{symbol}`

**Description**: Get mutual fund data including NAV, returns, holdings, and sector weightings.

**Parameters**:
- `symbol` (path): Mutual fund symbol (e.g., VFIAX, VTSAX, FXAIX)

**Example**:
```bash
GET http://localhost:8080/api/yfdata/mutual-funds/VFIAX
```

**Response**: Fund NAV, returns (1m, 3m, 6m, 1y, 3y, 5y), risk level, ratings, top holdings, sector weightings.

---

### 4. Get Commodity/Futures Data
**Endpoint**: `GET /api/yfdata/commodities/{symbol}`

**Description**: Get commodity or futures data including price and volume.

**Parameters**:
- `symbol` (path): Commodity symbol (e.g., GC=F for Gold, CL=F for Crude Oil, SI=F for Silver)

**Example**:
```bash
GET http://localhost:8080/api/yfdata/commodities/GC=F
```

**Response**: Commodity price, volume, 7d/30d price changes, 52-week high/low.

---

### 5. Get Historical Price Data
**Endpoint**: `GET /api/yfdata/history/{symbol}`

**Description**: Get historical OHLCV (Open, High, Low, Close, Volume) data.

**Parameters**:
- `symbol` (path): Asset symbol
- `period` (query, optional): Time period - `1D`, `5D`, `1W`, `1MO`, `3MO`, `6MO`, `1Y`, `2Y` (default: `1MO`)

**Example**:
```bash
GET http://localhost:8080/api/yfdata/history/AAPL?period=1Y
```

**Response**: Array of OHLCV data points with timestamps.

---

### 6. Get News
**Endpoint**: `GET /api/yfdata/news/{symbol}`

**Description**: Get latest news articles for a specific symbol.

**Parameters**:
- `symbol` (path): Asset symbol

**Example**:
```bash
GET http://localhost:8080/api/yfdata/news/TSLA
```

**Response**: Array of news articles with title, summary, publisher, date, link, thumbnail.

---

### 7. Search Assets
**Endpoint**: `GET /api/yfdata/search`

**Description**: Search for assets across stocks, cryptos, mutual funds, and commodities.

**Parameters**:
- `q` (query): Search query string

**Example**:
```bash
GET http://localhost:8080/api/yfdata/search?q=apple
```

**Response**: Categorized results with stocks, mutual funds, cryptos, and commodities.

---

## 📈 Portfolio Analysis Endpoints

### 8. Get Portfolio Performers
**Endpoint**: `POST /api/yfdata/portfolio/performers`

**Description**: Analyze portfolio and get top 5 best and worst performing assets with comprehensive metrics.

**Request Body**:
```json
{
  "holdings": [
    {
      "ticker": "AAPL",
      "buyPrice": 150.00,
      "quantity": 10,
      "purchaseDate": "2024-01-15"
    },
    {
      "ticker": "BTC-USD",
      "buyPrice": 40000.00,
      "quantity": 0.5,
      "purchaseDate": "2024-02-10"
    }
  ]
}
```

**Response**:
- Best/worst performers (meeting ±5% threshold)
- Investment value vs current value
- Total/per-share gain/loss
- Portfolio weight
- Asset type, sector, industry
- Annualized return (if purchase date provided)
- Portfolio summary with total investment, current value, overall gain/loss

**Thresholds**:
- Best performers: ≥ 5% gain
- Worst performers: ≤ -5% loss

---

### 9. Get Portfolio Recommendations (AI-Powered)
**Endpoint**: `POST /api/yfdata/portfolio/recommendations`

**Description**: Get AI-powered buy/sell/hold recommendations using FinBERT sentiment analysis and analyst ratings.

**Request Body**:
```json
{
  "holdings": [
    {
      "ticker": "AAPL",
      "buyPrice": 150.00,
      "quantity": 10
    },
    {
      "ticker": "TSLA",
      "buyPrice": 250.00,
      "quantity": 5
    }
  ]
}
```

**Response**:
- Action: `STRONG BUY`, `BUY`, `HOLD`, `SELL`, `STRONG SELL`
- Composite score (performance 30% + sentiment 35% + analysts 35%)
- News sentiment (positive/negative/neutral)
- Analyst recommendations
- Human-readable reasoning
- Top opportunities and concerned holdings
- Summary statistics

**Analysis Weights**:
- Performance: 30%
- News Sentiment (FinBERT): 35%
- Analyst Recommendations: 35%

---

### 10. Get Stock Analysis
**Endpoint**: `GET /api/yfdata/stock/{symbol}/analysis`

**Description**: Get comprehensive analysis for a single stock with sentiment and recommendations.

**Parameters**:
- `symbol` (path): Stock ticker symbol
- `inPortfolio` (query, optional): Whether stock is in portfolio (default: `false`)
- `buyPrice` (query, required if inPortfolio=true): Purchase price

**Example - For existing holding**:
```bash
GET http://localhost:8080/api/yfdata/stock/AAPL/analysis?inPortfolio=true&buyPrice=150.00
```

**Example - For potential investment**:
```bash
GET http://localhost:8080/api/yfdata/stock/NVDA/analysis?inPortfolio=false
```

**Response**:
- Action recommendation
- News sentiment analysis
- Analyst recommendations
- Composite score
- Performance metrics (if in portfolio)
- Detailed reasoning

**Analysis Modes**:
- **In Portfolio**: Performance (30%) + Sentiment (35%) + Analysts (35%)
- **Not In Portfolio**: Sentiment (50%) + Analysts (50%)

---

## 🏥 System Health

### 11. Health Check
**Endpoint**: `GET /api/yfdata/health`

**Description**: Check if the Flask Data API is reachable and functioning.

**Example**:
```bash
GET http://localhost:8080/api/yfdata/health
```

**Response**: Health status of the data API service.

---

## 📝 Request/Response Examples

### Portfolio Performers - Full Example

**Request**:
```bash
POST http://localhost:8080/api/yfdata/portfolio/performers
Content-Type: application/json

{
  "holdings": [
    {
      "ticker": "AAPL",
      "buyPrice": 150.00,
      "quantity": 10,
      "purchaseDate": "2024-01-15"
    },
    {
      "ticker": "TSLA",
      "buyPrice": 250.00,
      "quantity": 5,
      "purchaseDate": "2023-12-01"
    },
    {
      "ticker": "BTC-USD",
      "buyPrice": 40000.00,
      "quantity": 0.5,
      "purchaseDate": "2024-01-05"
    }
  ]
}
```

**Response**:
```json
{
  "datetime": "2026-02-04 10:30:00",
  "bestCount": 2,
  "worstCount": 1,
  "thresholds": {
    "best": 5.0,
    "worst": -5.0
  },
  "portfolioSummary": {
    "totalInvestment": 22500.00,
    "totalCurrentValue": 28750.50,
    "totalGainLoss": 6250.50,
    "totalGainLossPercent": 27.78,
    "totalAssets": 3
  },
  "data": [
    {
      "symbol": "BTC-USD",
      "name": "Bitcoin USD",
      "assetType": "Crypto",
      "price": 98500.00,
      "buyPrice": 40000.00,
      "quantity": 0.5,
      "investmentValue": 20000.00,
      "currentValue": 49250.00,
      "gainLossPerShare": 58500.00,
      "totalGainLoss": 29250.00,
      "gainLossPercent": 146.25,
      "daysHeld": 395,
      "annualizedReturn": 92.34,
      "portfolioWeight": 62.5,
      "type": "best"
    }
  ]
}
```

---

### Portfolio Recommendations - Full Example

**Request**:
```bash
POST http://localhost:8080/api/yfdata/portfolio/recommendations
Content-Type: application/json

{
  "holdings": [
    {
      "ticker": "AAPL",
      "buyPrice": 150.00,
      "quantity": 10
    },
    {
      "ticker": "TSLA",
      "buyPrice": 250.00,
      "quantity": 5
    }
  ]
}
```

**Response**:
```json
{
  "datetime": "2026-02-04 10:45:00",
  "totalAnalyzed": 2,
  "summary": {
    "strongBuys": 1,
    "buys": 0,
    "holds": 1,
    "sells": 0,
    "strongSells": 0
  },
  "recommendations": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "currentPrice": 185.50,
      "buyPrice": 150.00,
      "gainLoss": 35.50,
      "gainLossPercent": 23.67,
      "newsSentiment": "positive",
      "sentimentScore": 0.65,
      "analystRecommendation": "buy",
      "analystConfidence": 0.72,
      "compositeScore": 0.58,
      "action": "STRONG BUY",
      "reasoning": "Strong performance (+23.7%), positive news sentiment, analysts buy",
      "inPortfolio": true
    }
  ],
  "topOpportunities": [...],
  "concernedHoldings": [...]
}
```

---

## 🔧 Error Responses

All endpoints return standardized error responses:

```json
{
  "error": "Description of what went wrong"
}
```

**Common HTTP Status Codes**:
- `200 OK`: Success
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Flask API not reachable

---

## 📦 Sample Data

Sample portfolio data is available in: `Backend/sample_portfolio_data.json`

This file contains 40 diversified holdings across:
- 20 Stocks (Tech, Finance, Healthcare, Consumer, Industrial)
- 7 Cryptocurrencies
- 5 Mutual Funds
- 3 Commodities/Futures

---

## 🚀 Quick Start

1. **Start Flask Data API**:
```bash
cd Backend
python app.py
```

2. **Start Java Backend**:
```bash
mvn spring-boot:run
```

3. **Test Endpoints**:
```bash
# Get stock data
curl http://localhost:8080/api/yfdata/stocks/AAPL

# Analyze portfolio
curl -X POST http://localhost:8080/api/yfdata/portfolio/performers \
  -H "Content-Type: application/json" \
  -d @Backend/sample_portfolio_data.json
```

---

## 📊 Key Features

- **Real-time Market Data**: Live prices from Yahoo Finance
- **Multi-Asset Support**: Stocks, Crypto, Mutual Funds, Commodities
- **AI Sentiment Analysis**: FinBERT-powered news analysis
- **Portfolio Analytics**: Performance tracking with comprehensive metrics
- **Smart Recommendations**: Buy/sell/hold actions based on multiple factors
- **Historical Data**: OHLCV data with customizable periods
- **Diversification Tracking**: Asset type, sector, and industry breakdown
- **Annualized Returns**: CAGR calculations for time-based performance

---

## 📚 Additional Resources

- **Architecture**: See `Backend/DataAPI_ARCHITECTURE.md`
- **Recommendations**: See `Backend/RECOMMENDATION_SYSTEM.md`
- **Sample Data**: See `Backend/sample_portfolio_data.json`
