/**
 * CurrencyFormatter.js
 *
 * A simple utility for consistent currency formatting.
<<<<<<< HEAD
 *
 * IMPORTANT: All amounts are stored in PAISE (smallest currency unit).
 * - formatCurrency(amount) expects amount in paise and converts to rupees.
 * - formatCurrencyRaw(amount) formats any number as-is (for display of
 *   values that aren't in paise).
 */

/**
 * Format a paise value for display by converting to rupees (divide by 100).
 * Example: formatCurrency(50000) => "₹500.00"
 *
 * @param {number} amount - Amount in paise
 * @param {string} currency - Currency code (default: "INR")
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = "INR") => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(0);
  }
  // Convert paise to rupees by dividing by 100
  const rupees = Number(amount) / 100;
=======
 */
export const formatCurrency = (amount, currency = "INR") => {
>>>>>>> origin/main
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
<<<<<<< HEAD
  }).format(rupees);
};

/**
 * Format a number that is already in rupees (not paise).
 * Use this for displaying values that are already in the base unit.
 *
 * Example: formatCurrencyRaw(500) => "₹500.00"
 *
 * @param {number} amount - Amount already in rupees
 * @param {string} currency - Currency code (default: "INR")
 * @returns {string} Formatted currency string
 */
export const formatCurrencyRaw = (amount, currency = "INR") => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(0);
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount));
=======
  }).format(amount);
>>>>>>> origin/main
};
