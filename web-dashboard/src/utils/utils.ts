// Various functions that might be used frequently

// Utility function to calculate the percentage of a value
export const calculatePercentage = (value: number, total: number) => {
    return ((value / total) * 100).toFixed(1);
};
