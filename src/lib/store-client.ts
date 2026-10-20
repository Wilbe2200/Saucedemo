"use client";

const CART_KEY = "sauce-demo-cart-id";
const SESSION_KEY = "sauce-demo-session-id";

/** Recupera un identificador de sesión aleatorio persistido en el navegador. */
export function browserSessionId(kind: "cart" | "wishlist"): string {
  const storageKey = kind === "cart" ? CART_KEY : SESSION_KEY;
  let value = window.localStorage.getItem(storageKey);
  if (!value) {
    value = crypto.randomUUID();
    window.localStorage.setItem(storageKey, value);
  }
  return value;
}

export function dispatchStoreEvent(eventName: "sauce-cart-updated" | "sauce-wishlist-updated"): void {
  window.dispatchEvent(new Event(eventName));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount);
}
