function formatCurrency(amount) {
  const num = Number(amount);
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }) + " VNĐ";
}

export { formatCurrency };

export const parseCurrency = (value) => {
  if (!value) return 0;
  return parseInt(value.replace(/[^\d]/g, ''));
};