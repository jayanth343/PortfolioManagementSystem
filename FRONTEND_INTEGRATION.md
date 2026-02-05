# Frontend-Backend Integration Guide

## Overview
This React application integrates with a Java Spring Boot backend that acts as a proxy to a Flask API, which fetches real-time financial data using yfinance.

## Architecture

```
React Frontend (Port 3000)
    ↓
Java Spring Boot Backend (Port 8080)
    ↓
Flask API (Port 5000)
    ↓
yfinance Library → Yahoo Finance
```

## Backend Setup

### 1. Start Flask API (Python Backend)

```bash
cd Backend
pip install -r requirements.txt
python app.py
```

The Flask API will run on `http://localhost:5000`

### 2. Start Java Spring Boot Backend

```bash
# From project root
mvn clean install
mvn spring-boot:run
```

The Java proxy will run on `http://localhost:8080`

### 3. Start React Frontend

```bash
cd reactpotfolio
npm install
npm start
```

The React app will run on `http://localhost:3000`

## API Integration

### Market Data API ([marketApi.js](reactpotfolio/src/api/marketApi.js))

All functions now call the Java backend proxy at `http://localhost:8080/api/yfdata`:

#### Available Functions

1. **getStockData(symbol)** - Get stock information
   ```javascript
   const stockData = await getStockData('AAPL');
   ```

2. **getCryptoData(symbol)** - Get cryptocurrency data
   ```javascript
   const cryptoData = await getCryptoData('BTC-USD');
   ```

3. **getMutualFundData(symbol)** - Get mutual fund data
   ```javascript
   const fundData = await getMutualFundData('VOO');
   ```

4. **getCommodityData(symbol)** - Get commodity data
   ```javascript
   const goldData = await getCommodityData('GC=F');
   ```

5. **getAssetPriceHistory(symbol, period)** - Get historical prices
   ```javascript
   const history = await getAssetPriceHistory('AAPL', '1MO');
   // Periods: 1D, 5D, 1W, 1MO, 3MO, 6MO, 1Y, 2Y
   ```

6. **searchAssets(query)** - Search for assets
   ```javascript
   const results = await searchAssets('apple');
   ```

7. **getPortfolioPerformers(holdings)** - Analyze portfolio performance
   ```javascript
   const performers = await getPortfolioPerformers([
       { symbol: 'AAPL', quantity: 10, buy_price: 150, purchase_date: '2024-01-15' }
   ]);
   ```

8. **getPortfolioRecommendations(holdings)** - Get AI recommendations
   ```javascript
   const recommendations = await getPortfolioRecommendations(holdings);
   ```

9. **getStockAnalysis(symbol, inPortfolio, buyPrice)** - Get sentiment analysis
   ```javascript
   const analysis = await getStockAnalysis('AAPL', true, 150);
   ```

### Configuration ([config.js](reactpotfolio/src/api/config.js))

Configure backend URLs and settings:

```javascript
export const JAVA_API_URL = 'http://localhost:8080/api/yfdata';
export const REQUEST_TIMEOUT = 30000; // 30 seconds
```

Features:
- Request timeout handling
- Error handling with user-friendly messages
- Fetch helper with timeout support

### Error Handling

All API functions now include comprehensive error handling:

```javascript
try {
    const data = await getStockData('AAPL');
    if (data.error) {
        console.error('API Error:', data.error);
        // Handle error in UI
    } else {
        // Use data
    }
} catch (error) {
    console.error('Unexpected error:', error);
}
```

## CORS Configuration

The Java backend is configured to allow CORS from `http://localhost:3000`. If you need to allow other origins, update the `@CrossOrigin` annotation in [StockDataController.java](src/main/java/org/hsbc/controller/StockDataController.java):

```java
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/yfdata")
public class StockDataController {
    // ...
}
```

## Example Usage in Components

### Fetching Stock Data

```javascript
import { getStockData } from '../api';

function StockCard({ symbol }) {
    const [stock, setStock] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStock = async () => {
            setLoading(true);
            const data = await getStockData(symbol);
            
            if (data.error) {
                setError(data.error);
            } else {
                setStock(data);
            }
            setLoading(false);
        };
        
        fetchStock();
    }, [symbol]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    
    return (
        <div>
            <h2>{stock.name}</h2>
            <p>Price: ${stock.current_price}</p>
        </div>
    );
}
```

### Portfolio Analysis

```javascript
import { getPortfolioPerformers } from '../api';

function PortfolioAnalysis({ holdings }) {
    const analyzePortfolio = async () => {
        const result = await getPortfolioPerformers(holdings);
        
        if (!result.error) {
            console.log('Best Performers:', result.best_performers);
            console.log('Worst Performers:', result.worst_performers);
        }
    };
    
    return (
        <button onClick={analyzePortfolio}>
            Analyze Portfolio
        </button>
    );
}
```

## Testing the Integration

### 1. Health Check

Test the API connection:

```javascript
import { checkApiHealth } from '../api/marketApi';

const health = await checkApiHealth();
console.log('API Status:', health);
```

### 2. Test Individual Endpoints

Use browser console or create a test component:

```javascript
// Test stock data
const aapl = await getStockData('AAPL');
console.log('Apple Stock:', aapl);

// Test search
const results = await searchAssets('microsoft');
console.log('Search Results:', results);

// Test portfolio analysis
const performers = await getPortfolioPerformers([
    { symbol: 'AAPL', quantity: 10, buy_price: 150, purchase_date: '2024-01-15' },
    { symbol: 'GOOGL', quantity: 5, buy_price: 140, purchase_date: '2024-02-01' }
]);
console.log('Performers:', performers);
```

## Sample Data

For testing portfolio features, you can use the sample data from [Backend/sample_portfolio_data.json](Backend/sample_portfolio_data.json):

```json
{
  "holdings": [
    { "symbol": "AAPL", "quantity": 50, "buy_price": 150.0, "purchase_date": "2024-01-15" },
    { "symbol": "GOOGL", "quantity": 30, "buy_price": 140.0, "purchase_date": "2024-02-01" }
  ]
}
```

## Troubleshooting

### Backend Not Running
Error: `Cannot connect to server. Please ensure the backend is running.`

**Solution:**
1. Ensure Flask API is running on port 5000
2. Ensure Java backend is running on port 8080
3. Check console for startup errors

### CORS Errors
Error: `Access to fetch has been blocked by CORS policy`

**Solution:**
Update the `@CrossOrigin` annotation in StockDataController.java to include your frontend URL.

### Request Timeout
Error: `Request timeout`

**Solution:**
1. Increase timeout in [config.js](reactpotfolio/src/api/config.js)
2. Check if the backend is responding slowly
3. Verify network connection

### Invalid Symbol
Error: `Stock not found` or `No data found`

**Solution:**
- Verify the symbol is correct (e.g., 'AAPL' not 'Apple')
- For crypto, use format like 'BTC-USD'
- For commodities, use format like 'GC=F' for gold futures
- Search is limited to US, UK, and India exchanges

## Next Steps

1. **Replace Mock Data**: Update [assetsApi.js](reactpotfolio/src/api/assetsApi.js) to use backend endpoints instead of mock data
2. **Portfolio Management**: Implement portfolio CRUD operations with backend persistence
3. **Real-time Updates**: Add WebSocket support for live price updates
4. **Caching**: Implement client-side caching to reduce API calls
5. **Error Boundaries**: Add React error boundaries for better error handling

## API Documentation

For complete API documentation, see [API_ENDPOINTS.md](API_ENDPOINTS.md)
