// Mock credit balance store
let creditBalance = 250000;

export const getCreditBalance = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(creditBalance);
        }, 400);
    });
};

export const increaseCredit = async (amount) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            creditBalance += Number(amount);
            resolve(creditBalance);
        }, 400);
    });
};

export const decreaseCredit = async (amount) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (creditBalance >= amount) {
                creditBalance -= Number(amount);
                resolve(creditBalance);
            } else {
                reject(new Error("Insufficient funds"));
            }
        }, 400);
    });
};
