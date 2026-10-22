"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { dispatchStoreEvent, ensureStoreSession } from "@/lib/store-client";
import type { ProductData } from "@/components/ProductCard";
import { useWishList } from "@/components/WishListProvider";

/** Proporciona acciones de compra y lista de deseos en la ficha de producto. */
export function ProductActions({ product }: { product: ProductData }) {
  const router = useRouter();
  const { products, loaded, toggle } = useWishList();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const isSaved = products.some((saved) => saved.id === product.id);

  async function addToCart(buyNow = false): Promise<boolean> {
    setBusy(true);
    try {
      await ensureStoreSession();
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      if (!response.ok) throw new Error("Unable to add this item to your cart.");
      setMessage("Added to your cart.");
      dispatchStoreEvent("sauce-cart-updated");
      if (buyNow) router.push("/checkout");
      return true;
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Unable to add this item to your cart.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function toggleWishList(): Promise<void> {
    setBusy(true);
    try {
      await toggle(product);
      setMessage(isSaved ? "Removed from your wish list." : "Added to your wish list.");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Unable to update your wish list.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="detail-actions">
    <button className="button button-dark" disabled={busy} onClick={() => void addToCart()}>Add to cart</button>
    <button className="button button-outline" disabled={busy} onClick={() => void addToCart(true)}>Buy now</button>
    <button className="button button-outline" disabled={busy || !loaded} aria-pressed={isSaved}
      aria-label={`${isSaved ? "Remove" : "Add"} ${product.name} ${isSaved ? "from" : "to"} wish list`}
      onClick={() => void toggleWishList()}>{isSaved ? "♥ Saved to wish list" : "♡ Add to wish list"}</button>
    <p role="status" aria-live="polite">{message}</p></div>;
}
