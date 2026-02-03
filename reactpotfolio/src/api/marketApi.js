export const getAssetPriceHistory = async (symbol) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate slightly different data for different assets or just return generic data
            resolve([
                { date: 'Mon', price: Math.random() * 100 + 100 },
                { date: 'Tue', price: Math.random() * 100 + 100 },
                { date: 'Wed', price: Math.random() * 100 + 100 },
                { date: 'Thu', price: Math.random() * 100 + 100 },
                { date: 'Fri', price: Math.random() * 100 + 100 },
                { date: 'Sat', price: Math.random() * 100 + 100 },
                { date: 'Sun', price: Math.random() * 100 + 100 }
            ]);
        }, 300);
    });
};
