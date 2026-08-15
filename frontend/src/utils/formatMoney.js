/**
 * Global money formatter for Safar-E-Life.
 * Formats numbers into clean Indian Rupee strings: ₹1,000.00, ₹30,254.00, etc.
 * Eliminates floating-point garbage like ₹6377.003333333334.
 */
export function formatMoney(amount, showDecimals = true) {
  const num = Number(amount);
  if (isNaN(num) || num === null || num === undefined) {
    return "₹0.00";
  }

  const rounded = Math.round(num * 100) / 100;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  })
    .format(rounded)
    .replace("INR", "₹")
    .trim();
}

export function formatCompactMoney(amount) {
  const num = Number(amount);
  if (isNaN(num)) return "₹0";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  })
    .format(num)
    .replace("INR", "₹")
    .trim();
}
