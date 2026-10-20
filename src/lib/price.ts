/** Formatea importes en libras esterlinas para la tienda. */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount);
}
