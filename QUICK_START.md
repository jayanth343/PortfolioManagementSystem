# Quick Start Guide - Portfolio Management System

## Prerequisites

- Java 17 or higher
- Python 3.8 or higher
- Node.js 16 or higher
- Maven 3.6 or higher

## Installation & Setup

### 1. Install Backend Dependencies

#### Python (Flask API)
```bash
cd Backend
pip install -r requirements.txt
```

Required packages:
- Flask
- flask-cors
- yfinance
- transformers (for FinBERT sentiment analysis)
- torch (for FinBERT)

#### Java (Spring Boot)
```bash
# From project root
mvn clean install
```

### 2. Install Frontend Dependencies

```bash
cd reactpotfolio
npm install
```

## Running the Application

**Important:** Start the backends in this order:

### Step 1: Start Flask API (Python)

```bash
cd Backend
python app.py
```

Expected output:
```
 * Running on http://127.0.0.1:5000
```

### Step 2: Start Java Spring Boot Backend

```bash
# From project root
mvn spring-boot:run
```

Or if you prefer to run the JAR:
```bash
mvn clean package
java -jar target/PortfolioManagementSystem-0.0.1-SNAPSHOT.jar
```

Expected output:
```
Started PortfolioManagementSystemApplication in X.XXX seconds
```

### Step 3: Start React Frontend

```bash
cd reactpotfolio
npm start
```

The application will automatically open in your browser at `http://localhost:3000`

## Verify Everything is Running

### Check Backend Services

1. **Flask API**: http://localhost:5000/api/stocks/AAPL
2. **Java Proxy**: http://localhost:8080/api/yfdata/stocks/AAPL
3. **React App**: http://localhost:3000

### Test in Browser Console

```javascript
// Test stock data
fetch('http://localhost:8080/api/yfdata/stocks/AAPL')
  .then(r => r.json())
  .then(console.log);

// Test search
fetch('http://localhost:8080/api/yfdata/search?q=apple')
  .then(r => r.json())
  .then(console.log);
```

## Quick Feature Test

### 1. Test Portfolio Analysis

Using sample data from `Backend/sample_portfolio_data.json`:

```bash
curl -X POST http://localhost:8080/api/yfdata/portfolio/performers \
  -H "Content-Type: application/json" \
  -d @Backend/sample_portfolio_data.json
```

### 2. Test Stock Search

```bash
curl "http://localhost:8080/api/yfdata/search?q=microsoft"
```

### 3. Test Stock Analysis

```bash
curl "http://localhost:8080/api/yfdata/stock/AAPL/analysis?inPortfolio=true&buyPrice=150"
```

## Using the Frontend API

### In React Components

```javascript
import { 
    getStockData, 
    searchAssets, 
    getPortfolioPerformers 
} from './api';

// Get stock information
const appleStock = await getStockData('AAPL');

// Search for assets
const results = await searchAssets('microsoft');

// Analyze portfolio
const analysis = await getPortfolioPerformers([
    { symbol: 'AAPL', quantity: 10, buy_price: 150, purchase_date: '2024-01-15' }
]);
```

## Common Issues

### Port Already in Use

If port 5000, 8080, or 3000 is already in use:

**Flask (5000):**
```python
# In Backend/app.py, change:
app.run(debug=True, port=5001)
```

**Java (8080):**
```properties
# In src/main/resources/application.properties, add:
server.port=8081
```

**React (3000):**
```bash
# Set environment variable before starting
PORT=3001 npm start
```

### CORS Errors

If you see CORS errors, verify:
1. Java backend has `@CrossOrigin(origins = "*")` in StockDataController.java
2. Flask has `CORS(app)` enabled in app.py

### Module Not Found Errors

**Python:**
```bash
pip install -r Backend/requirements.txt
```

**Node:**
```bash
cd reactpotfolio
rm -rf node_modules package-lock.json
npm install
```

### Backend Connection Errors

Verify all services are running:
```bash
# Check Flask
curl http://localhost:5000/api/stocks/AAPL

# Check Java
curl http://localhost:8080/api/yfdata/stocks/AAPL

# Check React
curl http://localhost:3000
```

## Project Structure

```
PortfolioManagementSystem/
├── Backend/                    # Flask API
│   ├── app.py                 # Main Flask application
│   ├── services/              # Business logic
│   └── sample_portfolio_data.json
├── src/main/java/             # Java Spring Boot
│   └── org/hsbc/
│       └── controller/
│           └── StockDataController.java
├── reactpotfolio/             # React Frontend
│   └── src/
│       ├── api/               # API integration layer
│       ├── components/        # React components
│       └── pages/             # Page components
└── pom.xml                    # Maven configuration
```

## Next Steps

1. **Explore the API**: See [API_ENDPOINTS.md](API_ENDPOINTS.md) for complete documentation
2. **Frontend Integration**: See [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) for integration guide
3. **Sample Data**: Use data from `Backend/sample_portfolio_data.json` for testing

## Available Features

### Market Data
- Real-time stock quotes
- Cryptocurrency prices
- Mutual fund data
- Commodity prices
- Historical price charts
- Asset search (US, UK, India exchanges)

### Portfolio Analysis
- Best/worst performers (±5% threshold)
- Comprehensive metrics (CAGR, portfolio weights, gains)
- AI-powered recommendations (FinBERT sentiment)
- Stock analysis with buy/sell/hold suggestions

### Frontend Features
- Portfolio overview dashboard
- Holdings management
- Performance charts
- Asset search and details

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review [API_ENDPOINTS.md](API_ENDPOINTS.md) for API documentation
3. Review [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) for integration details
