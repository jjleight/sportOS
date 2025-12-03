/**
 * Calculates the total outstanding debt from a list of ledger items.
 * @param {Array} items - List of ledger objects with an 'amount' property
 * @returns {String} - Formatted string (e.g. "105.00")
 */
export function calculateTotalDebt(items) {
  if (!items || items.length === 0) return '0.00';

  const total = items.reduce((sum, item) => {
    // Ensure we are doing math on numbers, not strings
    const val = parseFloat(item.amount);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  return total.toFixed(2);
}
