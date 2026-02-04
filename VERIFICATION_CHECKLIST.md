# Integration Verification Checklist

Use this checklist to verify the frontend-backend integration is working correctly.

## Prerequisites

- [ ] Java 17+ installed
- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] Maven 3.6+ installed

## Installation Verification

### Backend Dependencies
- [ ] Flask dependencies installed: `cd Backend && pip install -r requirements.txt`
- [ ] Java project built: `mvn clean install`
- [ ] React dependencies installed: `cd reactpotfolio && npm install`

## Service Startup

### 1. Flask API (Port 5000)
- [ ] Started: `cd Backend && python app.py`
- [ ] Verify: http://localhost:5000/api/stocks/AAPL returns JSON
- [ ] Console shows: "Running on http://127.0.0.1:5000"

### 2. Java Backend (Port 8080)
- [ ] Started: `mvn spring-boot:run`
- [ ] Verify: http://localhost:8080/api/yfdata/stocks/AAPL returns JSON
- [ ] Console shows: "Started PortfolioManagementSystemApplication"

### 3. React Frontend (Port 3000)
- [ ] Started: `cd reactpotfolio && npm start`
- [ ] Browser opens at: http://localhost:3000
- [ ] No console errors

## API Integration Tests

### Market Data Endpoints

Test in browser console:

```javascript
// Copy these into browser console at http://localhost:3000
```

#### Stock Data
- [ ] Test AAPL:
```javascript
fetch('http://localhost:8080/api/yfdata/stocks/AAPL')
  .then(r => r.json())
  .then(d => console.log('✓ Stock Data:', d));
```

Expected: JSON with `name`, `symbol`, `current_price`, `market_cap`, etc.

#### Crypto Data
- [ ] Test Bitcoin:
```javascript
fetch('http://localhost:8080/api/yfdata/crypto/BTC-USD')
  .then(r => r.json())
  .then(d => console.log('✓ Crypto Data:', d));
```

Expected: JSON with Bitcoin data

#### Search
- [ ] Test search:
```javascript
fetch('http://localhost:8080/api/yfdata/search?q=microsoft')
  .then(r => r.json())
  .then(d => console.log('✓ Search Results:', d));
```

Expected: Array of search results

#### Historical Data
- [ ] Test history:
```javascript
fetch('http://localhost:8080/api/yfdata/history/AAPL?period=1MO')
  .then(r => r.json())
  .then(d => console.log('✓ Historical Data:', d));
```

Expected: JSON with `data` array containing price history

### Portfolio Analysis Endpoints

#### Portfolio Performers
- [ ] Test with sample data:
```bash
curl -X POST http://localhost:8080/api/yfdata/portfolio/performers \
  -H "Content-Type: application/json" \
  -d @Backend/sample_portfolio_data.json
```

Expected: JSON with `best_performers` and `worst_performers` arrays

Or in browser console:
```javascript
fetch('http://localhost:8080/api/yfdata/portfolio/performers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    holdings: [
      { symbol: 'AAPL', quantity: 10, buy_price: 150, purchase_date: '2024-01-15' },
      { symbol: 'GOOGL', quantity: 5, buy_price: 140, purchase_date: '2024-02-01' }
    ]
  })
}).then(r => r.json()).then(d => console.log('✓ Performers:', d));
```

#### Portfolio Recommendations
- [ ] Test recommendations:
```javascript
fetch('http://localhost:8080/api/yfdata/portfolio/recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    holdings: [
      { symbol: 'AAPL', quantity: 10, buy_price: 150, purchase_date: '2024-01-15' }
    ]
  })
}).then(r => r.json()).then(d => console.log('✓ Recommendations:', d));
```

Expected: JSON with AI recommendations

#### Stock Analysis
- [ ] Test analysis:
```javascript
fetch('http://localhost:8080/api/yfdata/stock/AAPL/analysis?inPortfolio=true&buyPrice=150')
  .then(r => r.json())
  .then(d => console.log('✓ Stock Analysis:', d));
```

Expected: JSON with sentiment analysis and recommendations

## React API Integration Tests

### Using marketApi Functions

Add ApiExampleComponent to test:

- [ ] In App.jsx, import:
```javascript
import ApiExampleComponent from './components/ApiExampleComponent';
```

- [ ] Add to render:
```jsx
<ApiExampleComponent />
```

- [ ] Open http://localhost:3000 and test buttons:
  - [ ] "Get Apple Stock" - should display stock data
  - [ ] "Search apple" - should show search results
  - [ ] "Analyze Sample Portfolio" - should show performers

### In Browser Console at http://localhost:3000

Import and test functions:

```javascript
// Note: These require the functions to be exported globally
// or you can test via the ApiExampleComponent UI
```

If you've added the component:
- [ ] Stock data displays correctly
- [ ] Search returns results
- [ ] Portfolio analysis shows best/worst performers
- [ ] Error messages appear when backends are stopped

## Error Handling Tests

### Test Timeout
- [ ] Stop Flask backend
- [ ] Try API call in frontend
- [ ] Should show: "Cannot connect to server"

### Test Invalid Symbol
- [ ] Try: `getStockData('INVALID123')`
- [ ] Should return: `{ error: "Stock not found" }`

### Test Network Error
- [ ] Stop Java backend
- [ ] Try API call
- [ ] Should show connection error

## Performance Tests

- [ ] API calls complete within 30 seconds (timeout)
- [ ] No hanging requests
- [ ] Loading states show during fetch
- [ ] Error states clear on retry

## CORS Tests

- [ ] No CORS errors in browser console
- [ ] Requests from http://localhost:3000 succeed
- [ ] Response headers include CORS headers

## Code Quality Checks

### API Configuration
- [ ] `reactpotfolio/src/api/config.js` exists
- [ ] `JAVA_API_URL` points to http://localhost:8080/api/yfdata
- [ ] `REQUEST_TIMEOUT` is set to 30000

### Market API
- [ ] `reactpotfolio/src/api/marketApi.js` imports config
- [ ] All functions use `fetchWithTimeout`
- [ ] All functions have error handling
- [ ] Functions return `{ error }` on failure

### Exports
- [ ] `reactpotfolio/src/api/index.js` exports all functions
- [ ] Can import via: `import { getStockData } from '../api'`

## Documentation Checks

- [ ] README.md has architecture diagram
- [ ] QUICK_START.md has setup instructions
- [ ] FRONTEND_INTEGRATION.md has integration guide
- [ ] API_ENDPOINTS.md has endpoint documentation
- [ ] INTEGRATION_SUMMARY.md summarizes changes

## Final Verification

### All Services Running
- [ ] Flask: http://localhost:5000 ✓
- [ ] Java: http://localhost:8080 ✓
- [ ] React: http://localhost:3000 ✓

### No Console Errors
- [ ] Flask: No Python errors
- [ ] Java: No Spring Boot errors
- [ ] React: No browser console errors

### API Calls Work
- [ ] Stock data loads
- [ ] Crypto data loads
- [ ] Search works
- [ ] Portfolio analysis works
- [ ] Historical data loads

### Error Handling Works
- [ ] Timeouts handled
- [ ] Invalid symbols handled
- [ ] Network errors handled
- [ ] User-friendly error messages

## Success Criteria

✅ All three services start without errors
✅ All API endpoints return data
✅ React can fetch data from Java backend
✅ Java proxy forwards to Flask successfully
✅ Error handling prevents crashes
✅ Loading states work correctly
✅ Documentation is complete

## If Issues Occur

1. **Port conflicts**: Change ports in config files
2. **Module errors**: Reinstall dependencies
3. **CORS errors**: Verify @CrossOrigin in Java controller
4. **Timeout errors**: Increase timeout or check backend performance
5. **Connection errors**: Verify all services are running

## Next Steps After Verification

Once all checks pass:

1. Start building real UI components
2. Replace mock data in assetsApi.js
3. Implement portfolio CRUD operations
4. Add loading skeletons
5. Enhance error UI
6. Add real-time updates

## Contact & Support

Refer to:
- **Quick Start**: QUICK_START.md
- **Integration Guide**: FRONTEND_INTEGRATION.md
- **API Docs**: API_ENDPOINTS.md
- **Summary**: INTEGRATION_SUMMARY.md
