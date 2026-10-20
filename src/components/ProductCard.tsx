"use client";

import Link from "next/link";
import { useState } from "react";
import { browserSessionId, dispatchStoreEvent, formatPrice } from "@/lib/store-client";
import styles from "./ProductCard.module.css";

export interface ProductData {
  id: string;
  name: string;
  slug: string;
  priceGbp: number;
  imageUrl: string;
  description: string;
}

/** Presenta un producto y activa las acciones de carrito y lista de deseos. */
export function ProductCard({ product }: { product: ProductData }) {
  const [message, setMessage] = useState("");

  async function addToCart(): Promise<void> {
    const response = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartId: browserSessionId("cart"), productId: product.id, quantity: 1 }),
    });
    if (!response.ok) {
      setMessage("Could not add this item. Please try again.");
      return;
    }
    setMessage("Added to your cart.");
    dispatchStoreEvent("sauce-cart-updated");
  }

  async function addToWishList(): Promise<void> {
    const response = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: browserSessionId("wishlist"), productId: product.id }),
    });
    if (!response.ok) {
      setMessage("Could not save this item. Please try again.");
      return;
    }
    setMessage("Added to your wish list.");
    dispatchStoreEvent("sauce-wishlist-updated");
  }

  return (
    <article className={styles.card}>
      <Link className={styles.imageLink} href={`/products/${product.slug}`} aria-label={`View ${product.name}`}>
        <img src={product.imageUrl} alt={product.name} className={styles.image} />
      </Link>
      <div className={styles.info}>
        <Link href={`/products/${product.slug}`} className={styles.name}>{product.name}</Link>
        <p className={styles.price}>{formatPrice(product.priceGbp)}</p>
        <div className={styles.actions}>
          <button className={styles.addButton} onClick={addToCart}>Add to cart</button>
          <button className={styles.wishButton} aria-label={`Add ${product.name} to wish list`} onClick={addToWishList}>♡</button>
        </div>
        <p className={styles.status} role="status" aria-live="polite">{message}</p>
      </div>
    </article>
  );
}
