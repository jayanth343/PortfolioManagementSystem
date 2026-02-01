# Simplified Architecture

## Overview
This is a simplified Flask data API that provides financial data using yfinance. The architecture has been streamlined to remove unnecessary complexity while maintaining all core functionality.

## Key Changes

### ✅ What Was Removed
- ❌ `models/` folder - No dataclass models (returns plain dictionaries)
- ❌ `routes/` folder - Routes moved directly into service file
- ❌ `utils/` folder - No helper decorators (simple error handling in routes)
- ❌ Complex route structure with nested blueprints

### ✅ What Remains
- ✔️ `app.py` - Simple Flask app factory
- ✔️ `config.py` - Configuration settings
- ✔️ `services/stock_service.py` - **All business logic + routes in one file**
- ✔️ `services/yfinance_search_service.py` - Optional search functionality

## Architecture Benefits

1. **Simplicity** - Everything is in one place
2. **No Abstraction Overhead** - Direct service-to-route connection
3. **Easy to Understand** - Linear code flow without layers
4. **Fewer Files** - Reduced complexity
5. **Maintained Functionality** - All core features intact

## File Structure

```
PFM/
├── app.py                          # Flask app with blueprint registration
├── config.py                       # Environment configuration
├── requirements.txt                # Dependencies
└── services/
    ├── stock_service.py            # Core service + Flask routes
    └── yfinance_search_service.py  # Optional search (can be removed)
```

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

### Production:
```bash
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
```

## Core Functionality Preserved

✅ Stock data (BSE/NASDAQ/NYSE)
✅ Crypto data with price changes
✅ Mutual fund data with returns
✅ Historical data for charting
✅ News integration
✅ Search functionality
✅ Error handling
✅ CORS support
✅ Logging

## What Makes This "Simple"

1. **Single Responsibility per File** - Each file has one clear purpose
2. **No Over-Engineering** - No decorators, validators, or complex middleware
3. **Direct Calls** - Route → Service method (no intermediary layers)
4. **Plain Dicts** - No dataclass conversion overhead
5. **Minimal Dependencies** - Flask, yfinance, CORS, that's it

This architecture is perfect for:
- Learning Flask
- Microservice architecture
- Quick prototyping
- Integration with Spring Boot backend
- Small to medium-scale applications
