let mockAssets = [
    {
        id: 1,
        companyName: 'Apple Inc.',
        symbol: 'AAPL',
        quantity: 10,
        currentValue: '$1,850.00',
        percentageChange: '+23.33%',
        assetType: 'Stocks'
    },
    {
        id: 2,
        companyName: 'Tesla Inc.',
        symbol: 'TSLA',
        quantity: 5,
        currentValue: '$1,200.00',
        percentageChange: '-5.12%',
        assetType: 'Stocks'
    },
    {
        id: 3,
        companyName: 'Vanguard 500',
        symbol: 'VOO',
        quantity: 20,
        currentValue: '$9,000.00',
        percentageChange: '+18.42%',
        assetType: 'Mutual Funds'
    },
    {
        id: 4,
        companyName: 'Gold ETF',
        symbol: 'GLD',
        quantity: 50,
        currentValue: '$10,750.00',
        percentageChange: '+26.47%',
        assetType: 'Commodities'
    },
    {
        id: 5,
        companyName: 'Bitcoin',
        symbol: 'BTC',
        quantity: 0.5,
        currentValue: '$31,000.00',
        percentageChange: '+106.67%',
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
            const newAsset = {
                id: mockAssets.length + 1,
                companyName: assetData.companyName,
                symbol: assetData.symbol.toUpperCase(),
                quantity: assetData.quantity,
                currentValue: `$${(assetData.quantity * assetData.buyPrice).toFixed(2)}`,
                percentageChange: '+0.00%', // Initial change
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
