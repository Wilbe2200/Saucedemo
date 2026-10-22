"use client";

export const STORE_EVENT_KEY = "sauce-demo-store-update";
let sessionReady: Promise<void> | null = null;

/** Completes the first-party session handshake before store requests are sent. */
export function ensureStoreSession(): Promise<void> {
  if (!sessionReady) {
    sessionReady = fetch("/api/store/session", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Could not initialize your store session.");
      })
      .catch((error: unknown) => {
        sessionReady = null;
        throw error;
      });
  }
  return sessionReady;
}

export function dispatchStoreEvent(eventName: "sauce-cart-updated" | "sauce-wishlist-updated"): void {
  window.dispatchEvent(new Event(eventName));
  try {
    window.localStorage.setItem(STORE_EVENT_KEY, `${eventName}:${Date.now()}:${window.crypto.randomUUID()}`);
  } catch (error: unknown) {
    console.error("Could not broadcast the store update to other tabs.", error);
  }
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount);
}
