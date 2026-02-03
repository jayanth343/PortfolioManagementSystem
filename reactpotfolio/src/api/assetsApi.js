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
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...mockAssets]);
        }, 400);
    });
};

export const addAsset = async (assetData) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const currentValue = assetData.quantity * assetData.buyPrice;
            const newAsset = {
                id: Date.now(), // Normalized unique ID
                companyName: assetData.companyName,
                symbol: assetData.symbol.toUpperCase(),
                quantity: assetData.quantity,
                currentValue: currentValue,
                percentageChange: 0, // Initial change
                assetType: assetData.assetType
            };
            mockAssets.push(newAsset);
            resolve(newAsset);
        }, 600);
    });
};

export const sellAsset = async (assetId) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            mockAssets = mockAssets.filter(asset => asset.id !== assetId);
            resolve(true);
        }, 600);
    });
};

// Helper function to increase asset quantity (for future transaction integration)
export const increaseAssetQuantity = async (symbol, quantity) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const assetIndex = mockAssets.findIndex(a => a.symbol === symbol.toUpperCase());
            if (assetIndex !== -1) {
                const asset = mockAssets[assetIndex];
                const currentPrice = asset.currentValue / asset.quantity;
                asset.quantity += quantity;
                asset.currentValue = asset.quantity * currentPrice;
                resolve(asset);
            } else {
                reject(new Error("Asset not found"));
            }
        }, 200);
    });
};

// Helper function to decrease asset quantity (for future transaction integration)
export const decreaseAssetQuantity = async (symbol, quantity) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const assetIndex = mockAssets.findIndex(a => a.symbol === symbol.toUpperCase());
            if (assetIndex !== -1) {
                const asset = mockAssets[assetIndex];
                if (asset.quantity >= quantity) {
                    const currentPrice = asset.currentValue / asset.quantity;
                    asset.quantity -= quantity;
                    asset.currentValue = asset.quantity * currentPrice;
                    resolve(asset);
                } else {
                    reject(new Error("Insufficient quantity"));
                }
            } else {
                reject(new Error("Asset not found"));
            }
        }, 200);
    });
};
