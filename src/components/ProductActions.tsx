"use client";

import { useState } from "react";
import { browserSessionId, dispatchStoreEvent } from "@/lib/store-client";

/** Proporciona acciones de compra y lista de deseos en la ficha de producto. */
export function ProductActions({ productId, productName }: { productId: string; productName: string }) {
  const [message, setMessage] = useState("");

  async function submit(kind: "cart" | "wishlist"): Promise<void> {
    const isCart = kind === "cart";
    const response = await fetch(isCart ? "/api/cart" : "/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isCart
        ? { cartId: browserSessionId("cart"), productId, quantity: 1 }
        : { sessionId: browserSessionId("wishlist"), productId }),
    });
    setMessage(response.ok ? (isCart ? "Added to your cart." : "Added to your wish list.") : "Unable to save this item.");
    if (response.ok) dispatchStoreEvent(isCart ? "sauce-cart-updated" : "sauce-wishlist-updated");
  }

  return <div className="detail-actions"><button className="button button-dark" onClick={() => void submit("cart")}>Add to cart</button>
    <button className="button button-outline" aria-label={`Add ${productName} to wish list`} onClick={() => void submit("wishlist")}>♡ Add to wish list</button>
    <p role="status" aria-live="polite">{message}</p></div>;
}
