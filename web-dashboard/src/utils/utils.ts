// Various functions that might be used frequently

// Utility function to calculate the percentage of a value
export const calculatePercentage = (value: number, total: number) => {
    const percentage = ((value / total) * 100);
    if (percentage > 0.01) {
        return percentage.toFixed(1);
    } else {
        return percentage.toPrecision(1);
    }
};
