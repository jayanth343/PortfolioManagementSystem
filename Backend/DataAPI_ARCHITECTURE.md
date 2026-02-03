# Simplified Architecture

## Overview
This is a simplified Flask data API that provides financial data using yfinance. The architecture has been streamlined to remove unnecessary complexity while maintaining all core functionality.

## How It Works

### 1. Service Layer (StockService class)
Contains static methods for data fetching:
- `get_stock(ticker)` - Returns stock data as Dict
- `get_crypto(symbol)` - Returns crypto data as Dict
- `get_mutual_fund(symbol)` - Returns mutual fund data as Dict
- `get_stock_history(ticker, period)` - Returns historical data
- `search_assets(query)` - Search functionality
- `_format_news(items)` - Internal helper for news formatting

### 2. Route Layer (Flask Blueprint)
Simple Flask routes defined in the same file:
- `GET /stocks/<symbol>` → calls `StockService.get_stock()`
- `GET /crypto/<symbol>` → calls `StockService.get_crypto()`
- `GET /mutual-funds/<symbol>` → calls `StockService.get_mutual_fund()`
- `GET /history/<symbol>?period=1MO` → calls `StockService.get_stock_history()`
- `GET /search?q=query` → calls `StockService.search_assets()`

### 3. App Registration
In `app.py`:
```python
from services.stock_service import api_bp

app.register_blueprint(api_bp, url_prefix='/api/v1')
```

## API Endpoints

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stocks/<symbol>` | Get stock details |
| GET | `/crypto/<symbol>` | Get crypto details |
| GET | `/mutual-funds/<symbol>` | Get mutual fund details |
| GET | `/history/<symbol>?period=1MO` | Get historical data |
| GET | `/search?q=query` | Search assets |

## Example Usage

```bash
# Get Apple stock
curl http://localhost:5000/api/stocks/AAPL

# Get Bitcoin data
curl http://localhost:5000/api/crypto/BTC

# Get history
curl http://localhost:5000/api/history/AAPL?period=6MO

# Search
curl http://localhost:5000/api/search?q=microsoft
```

## Response Format

All responses return JSON:

**Success (200):**
```json
{
  "tickerSymbol": "AAPL",
  "name": "Apple Inc.",
  "currentPrice": 175.50,
  ...
}
```

**Error (404/500):**
```json
{
  "error": "Stock not found"
}
```

## Development

### Run locally:
```bash
python app.py
```
