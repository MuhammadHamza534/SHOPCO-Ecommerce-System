export function productImage(product) { return product?.product_images?.slice().sort((a, b) => a.position - b.position)[0]?.url || null; }
export function price(product) { return Number(product?.sale_price ?? product?.regular_price ?? 0); }
export function oldPrice(product) { return product?.sale_price ? Number(product.regular_price) : null; }
export function formatMoney(amount, currency = "USD") {
  const value = Number(amount || 0);
  if (String(currency).toUpperCase() === "PKR") return `Rs. ${value.toLocaleString("en-PK", { maximumFractionDigits: 2 })}`;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD", maximumFractionDigits: 2 }).format(value);
}
export function discountPercent(product) {
  const original = oldPrice(product);
  return original && original > 0 ? Math.round(((original - price(product)) / original) * 100) : 0;
}
