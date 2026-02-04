// Mock transactions store
// Mock transactions store
const transactions = [
    {
        id: 101,
        timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
        type: 'BUY',
        symbol: 'AAPL',
        assetType: 'Stocks',
        price: 185.50,
        quantity: 10,
        totalValue: 1855.00
    },
    {
        id: 102,
        timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
        type: 'BUY',
        symbol: 'BTC',
        assetType: 'Crypto',
        price: 42000.00,
        quantity: 0.5,
        totalValue: 21000.00
    },
    {
        id: 103,
        timestamp: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
        type: 'SELL',
        symbol: 'TSLA',
        assetType: 'Stocks',
        price: 240.00,
        quantity: 5,
        totalValue: 1200.00
    },
    {
        id: 104,
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
        type: 'BUY',
        symbol: 'VFIAX',
        assetType: 'Mutual Funds',
        price: 450.00,
        quantity: 20,
        totalValue: 9000.00
    },
    {
        id: 105,
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 7, // 1 week ago
        type: 'BUY',
        symbol: 'GC=F',
        assetType: 'Commodities',
        price: 2030.00,
        quantity: 2,
        totalValue: 4060.00
    },
    {
        id: 106,
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 10, // 10 days ago
        type: 'SELL',
        symbol: 'BTC',
        assetType: 'Crypto',
        price: 44000.00,
        quantity: 0.1,
        totalValue: 4400.00
    },
    {
        id: 107,
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 14, // 2 weeks ago
        type: 'BUY',
        symbol: 'GOOGL',
        assetType: 'Stocks',
        price: 140.00,
        quantity: 15,
        totalValue: 2100.00
    },
    {
        id: 108,
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 30, // 1 month ago
        type: 'BUY',
        symbol: 'ETH',
        assetType: 'Crypto',
        price: 2200.00,
        quantity: 5,
        totalValue: 11000.00
    }
];

export const getTransactions = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...transactions]);
        }, 400);
    });
};

export const addTransaction = async (transaction) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            transactions.unshift(transaction); // Add to beginning of list
            resolve(transaction);
        }, 400);
    });
};
