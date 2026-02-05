# Buy/Sell Implementation with Transaction Recording

## Overview
Complete implementation of buy/sell asset functionality with automatic transaction recording in the database.

## Backend Implementation

### 1. PmsService Interface (PmsService.java)
Added two new methods:
```java
PmsEntity buyAsset(String symbol, String companyName, int quantity, double price, String assetType);
PmsEntity sellAsset(String symbol, int quantity);
```

### 2. PmsServiceimp Implementation (PmsServiceimp.java)

#### Buy Asset Logic
- **If asset exists**: 
  - Adds to existing quantity
  - Calculates weighted average buy price: `(oldPrice × oldQty + newPrice × newQty) / totalQty`
  - Updates buyingValue and currentPrice
- **If asset doesn't exist**:
  - Creates new PmsEntity
  - Sets all required fields
  - Sets purchaseDate to current date
- **Transaction Recording**: 
  - Creates TransactionEntity with type "BUY"
  - Records symbol, quantity, price, and timestamp

#### Sell Asset Logic
- **Validation**: Checks if quantity to sell ≤ owned quantity
- **Full sale** (quantity == owned):
  - Deletes entire PmsEntity from database
  - Returns null
- **Partial sale** (quantity < owned):
  - Reduces quantity
  - Recalculates buyingValue
  - Returns updated PmsEntity
- **Transaction Recording**:
  - Creates TransactionEntity with type "SELL"
  - Records symbol, quantity, current price, and timestamp

### 3. PmsController Endpoints (PmsController.java)

#### POST /api/pms/buy
```java
@PostMapping("/buy")
public PmsEntity buyAsset(
    @RequestParam String symbol,
    @RequestParam String companyName,
    @RequestParam int quantity,
    @RequestParam double price,
    @RequestParam String assetType
)
```
**Parameters**:
- `symbol`: Stock symbol (e.g., "AAPL")
- `companyName`: Company name
- `quantity`: Number of units to buy
- `price`: Current unit price
- `assetType`: Type (stock, fund, crypto, commodity)

**Returns**: Updated or newly created PmsEntity

#### POST /api/pms/sell
```java
@PostMapping("/sell")
public PmsEntity sellAsset(
    @RequestParam String symbol,
    @RequestParam int quantity
)
```
**Parameters**:
- `symbol`: Stock symbol
- `quantity`: Number of units to sell

**Returns**: 
- Updated PmsEntity if partial sale
- null if entire position sold
- 400 Bad Request if quantity > owned
- 404 Not Found if symbol doesn't exist

## Frontend Implementation

### 1. Assets API (assetsApi.js)

#### buyAsset Function
```javascript
export const buyAsset = async (symbol, companyName, quantity, price, assetType) => {
    const response = await fetch(
        `http://localhost:8080/api/pms/buy?symbol=${symbol}&companyName=${companyName}&quantity=${quantity}&price=${price}&assetType=${assetType}`,
        { method: 'POST' }
    );
    return await response.json();
};
```

#### sellAssetQuantity Function
```javascript
export const sellAssetQuantity = async (symbol, quantity) => {
    const response = await fetch(
        `http://localhost:8080/api/pms/sell?symbol=${symbol}&quantity=${quantity}`,
        { method: 'POST' }
    );
    const text = await response.text();
    return text ? JSON.parse(text) : null;
};
```

### 2. Holdings Page (Holdings.jsx)

#### handleBuyAsset
- Gets current price from live prices or database
- Calls `buyAsset()` with symbol, company name, quantity, price, and asset type
- Backend automatically handles add/update logic
- Refreshes asset list after successful purchase

#### handleSellAsset
- Validates sell quantity
- Calls `sellAssetQuantity()` with symbol and quantity
- Backend automatically handles full/partial sale
- Refreshes asset list after successful sale
- Closes modal

## Transaction Recording

### TransactionEntity Fields
- `transactionId`: Auto-generated ID
- `symbol`: Asset symbol
- `quantity`: Number of units bought/sold
- `buyPrice`: Price per unit (for BUY) or current price (for SELL)
- `transactionDate`: LocalDateTime of transaction
- `transactionType`: "BUY" or "SELL"

### Automatic Recording
Every buy/sell operation automatically creates a transaction record in the `transactions` table. This provides:
- Complete audit trail
- Historical transaction data
- Support for portfolio analytics
- Transaction history per symbol

## Database Schema Impact

### pms_entity Table
- **Buy**: INSERT (new asset) or UPDATE (existing asset)
  - Updates: quantity, buyPrice (weighted avg), buyingValue, currentPrice
- **Sell**: DELETE (full sale) or UPDATE (partial sale)
  - Updates: quantity, buyingValue

### transactions Table
- **Buy/Sell**: INSERT new transaction record
- Fields: symbol, quantity, buyPrice, transactionDate, transactionType

## Key Features

1. **Weighted Average Buy Price**: When buying more of an existing asset, the buy price is calculated as a weighted average
2. **Transaction Integrity**: Every operation is recorded in transactions table
3. **Validation**: Prevents selling more than owned
4. **Atomic Operations**: Each buy/sell includes both PMS update and transaction recording
5. **Error Handling**: Proper HTTP status codes and error messages
6. **Frontend Integration**: Seamless integration with live price updates

## Testing

### Test Buy Operation
```bash
curl -X POST "http://localhost:8080/api/pms/buy?symbol=AAPL&companyName=Apple%20Inc.&quantity=10&price=150.50&assetType=stock"
```

### Test Sell Operation
```bash
curl -X POST "http://localhost:8080/api/pms/sell?symbol=AAPL&quantity=5"
```

### Verify Transactions
```bash
curl http://localhost:8080/api/transactions/all
curl http://localhost:8080/api/transactions/symbol/AAPL
```

## Usage Flow

### Buying Assets
1. User clicks "Buy" in Holdings modal
2. Enters quantity
3. Clicks "Buy X Units"
4. Frontend calls `buyAsset()` with live/current price
5. Backend checks if asset exists:
   - Exists: Updates quantity and weighted average price
   - New: Creates new entry
6. Transaction recorded with type "BUY"
7. Frontend refreshes asset list
8. Modal closes

### Selling Assets
1. User clicks "Sell" in Holdings modal
2. Enters quantity (validated against max)
3. Clicks "Sell X Units"
4. Frontend calls `sellAssetQuantity()`
5. Backend validates quantity
6. Full sale: Deletes entity
7. Partial sale: Reduces quantity
8. Transaction recorded with type "SELL"
9. Frontend refreshes asset list
10. Modal closes

## Benefits

✅ **Simplified Logic**: No need to check existence in frontend  
✅ **Accurate Pricing**: Weighted average for multiple purchases  
✅ **Complete History**: All transactions recorded automatically  
✅ **Data Integrity**: Prevents invalid operations (overselling)  
✅ **Audit Trail**: Track all buy/sell operations  
✅ **Future Analytics**: Transaction data enables advanced portfolio analysis  

## Notes

- The old `addAsset` endpoint remains for manual asset entry (not via buy/sell)
- Buy price is weighted average for existing assets
- Sell uses current price for transaction recording
- All operations are atomic (PMS update + transaction recording)
- Frontend automatically handles edge cases (null response for full sale)
