/**
 * Get all transactions from backend
 */
export const getTransactions = async () => {
    try {
        const response = await fetch('http://localhost:8080/transactions/all');
        if (!response.ok) {
            throw new Error('Failed to fetch transactions');
        }
        const data = await response.json();
        
        // Transform backend data to match frontend format
        return data.map(tx => ({
            id: tx.transactionId,
            timestamp: new Date(tx.transactionDate).getTime(),
            type: tx.transactionType,
            symbol: tx.symbol,
            price: tx.buyPrice,
            quantity: tx.quantity,
            totalValue: tx.buyPrice * tx.quantity,
            date: tx.transactionDate
        }));
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw error;
    }
};

export const addTransaction = async (transaction) => {
    try {
        const response = await fetch('http://localhost:8080/transactions/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transaction),
        });
        if (!response.ok) {
            throw new Error('Failed to add transaction');
        }
        return await response.json();
    } catch (error) {
        console.error('Error adding transaction:', error);
        throw error;
    }
};

export const getTransactionsBySymbol = async (symbol) => {
    try {
        const response = await fetch(`http://localhost:8080/transactions/symbol/${symbol}`);
        if (!response.ok) {
            throw new Error('Failed to fetch transactions by symbol');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching transactions by symbol:', error);
        return [];
    }
};
