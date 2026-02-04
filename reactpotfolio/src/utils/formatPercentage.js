export const formatPercentage = (value) => {
    if (value === null || value === undefined) return "0.00%";
    const num = typeof value === 'string' ? parseFloat(value.replace('%', '')) : value;
    if (isNaN(num)) return "0.00%";
    return (num >= 0 ? '+' : '') + `${num.toFixed(2)}%`;
};
