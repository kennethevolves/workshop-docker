const priceFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

export function formatPrice(pesos: number) {
  return priceFormatter.format(pesos);
}
