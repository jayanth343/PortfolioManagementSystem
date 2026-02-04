export const formatCurrency = (value) => {
    if (value === null || value === undefined) return "$0.00";
    const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, "")) : value;
    if (isNaN(num)) return "$0.00";
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
