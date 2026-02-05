// Mock credit balance store
let creditBalance = 250000;

export const getCreditBalance = async () => {
    try {
        const response = await fetch('http://localhost:8080/wallet/balance');
        if (!response.ok) {
            throw new Error('Failed to fetch credit balance');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching credit balance:', error);
        return 0;
    }
};

export const increaseCredit = async (amount) => {
    try {
        const response = await fetch(`http://localhost:8080/wallet/add?amount=${amount}`, {
            method: 'POST',
        });
        if (!response.ok) {
            throw new Error('Failed to add credit');
        }
        return await response.json();
    } catch (error) {
        console.error('Error adding credit:', error);
        throw error;
    }
};

export const decreaseCredit = async (amount) => {
    try {
        const response = await fetch(`http://localhost:8080/wallet/deduct?amount=${amount}`, {
            method: 'POST',
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Insufficient funds' }));
            throw new Error(error.message || 'Failed to deduct credit');
        }
        return await response.json();
    } catch (error) {
        console.error('Error deducting credit:', error);
        throw error;
    }
};

export const getWalletSummary = async () => {
    try {
        const response = await fetch('http://localhost:8080/wallet/summary');
        if (!response.ok) {
            throw new Error('Failed to fetch wallet summary');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching wallet summary:', error);
        throw error;
    }
};
