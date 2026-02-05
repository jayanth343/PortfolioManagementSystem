let mockAssets = [
    {
        id: 1,
        companyName: 'Apple Inc.',
        symbol: 'AAPL',
        quantity: 10,
        currentValue: 1850.00,
        percentageChange: 23.33,
        assetType: 'Stocks'
    },
    {
        id: 2,
        companyName: 'Tesla Inc.',
        symbol: 'TSLA',
        quantity: 5,
        currentValue: 1200.00,
        percentageChange: -5.12,
        assetType: 'Stocks'
    },
    {
        id: 3,
        companyName: 'Vanguard 500',
        symbol: 'VOO',
        quantity: 20,
        currentValue: 9000.00,
        percentageChange: 18.42,
        assetType: 'Mutual Funds'
    },
    {
        id: 4,
        companyName: 'Gold ETF',
        symbol: 'GLD',
        quantity: 50,
        currentValue: 10750.00,
        percentageChange: 26.47,
        assetType: 'Commodities'
    },
    {
        id: 5,
        companyName: 'Bitcoin',
        symbol: 'BTC',
        quantity: 0.5,
        currentValue: 31000.00,
        percentageChange: 106.67,
        assetType: 'Crypto'
    }
];

export const getAssets = async () => {
    try {
        const response = await fetch('http://localhost:8080/api/pms/all');
        if (!response.ok) {
            throw new Error('Failed to fetch assets');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching assets:', error);
        return [];
    }
};

export const addAsset = async (assetData) => {
    try {
        const response = await fetch('http://localhost:8080/api/pms/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                symbol: assetData.symbol.toUpperCase(),
                companyName: assetData.companyName,
                quantity: assetData.quantity,
                buyPrice: assetData.buyPrice,
                currentPrice: assetData.buyPrice,
                assetType: assetData.assetType
            }),
        });
        if (!response.ok) {
            throw new Error('Failed to add asset');
        }
        return await response.json();
    } catch (error) {
        console.error('Error adding asset:', error);
        throw error;
    }
};

export const sellAsset = async (assetId) => {
    try {
        const response = await fetch(`http://localhost:8080/api/pms/remove/${assetId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to remove asset');
        }
        return true;
    } catch (error) {
        console.error('Error removing asset:', error);
        throw error;
    }
};

// Helper function to increase asset quantity (for future transaction integration)
export const increaseAssetQuantity = async (assetId, quantity) => {
    try {
        const response = await fetch(`http://localhost:8080/api/pms/update-quantity/${assetId}?quantity=${quantity}`, {
            method: 'PUT',
        });
        if (!response.ok) {
            throw new Error('Failed to update asset quantity');
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating asset quantity:', error);
        throw error;
    }
};

// Note: To decrease quantity, use increaseAssetQuantity with negative value or remove the asset
// Backend only supports update-quantity endpoint which sets the quantity
export const getAssetPL = async (assetId) => {
    try {
        const response = await fetch(`http://localhost:8080/api/pms/pl/${assetId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch P/L');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching P/L:', error);
        throw error;
    }
};

export const getTotalPortfolioValue = async () => {
    try {
        const response = await fetch('http://localhost:8080/api/pms/total-value');
        if (!response.ok) {
            throw new Error('Failed to fetch total portfolio value');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching total portfolio value:', error);
        throw error;
    }
};

export const updateCurrentPrice = async (symbol, price) => {
    try {
        const response = await fetch(`http://localhost:8080/api/pms/update-price/${symbol}?price=${price}`, {
            method: 'PUT',
        });
        if (!response.ok) {
            throw new Error('Failed to update current price');
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating current price:', error);
        throw error;
    }
};
