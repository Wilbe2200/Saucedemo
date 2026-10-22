"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { dispatchStoreEvent, ensureStoreSession, formatPrice } from "@/lib/store-client";
import { useWishList } from "@/components/WishListProvider";
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
  const router = useRouter();
  const { products: savedProducts, loaded: wishListLoaded, toggle } = useWishList();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const isSaved = savedProducts.some((saved) => saved.id === product.id);

  async function addToCart(): Promise<boolean> {
    setBusy(true);
    try {
      await ensureStoreSession();
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      if (!response.ok) throw new Error("Could not add this item. Please try again.");
      setMessage("Added to your cart.");
      dispatchStoreEvent("sauce-cart-updated");
      return true;
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Could not add this item. Please try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function buyNow(): Promise<void> {
    if (await addToCart()) router.push("/checkout");
  }

  async function toggleWishList(): Promise<void> {
    setBusy(true);
    try {
      await toggle(product);
      setMessage(isSaved ? "Removed from your wish list." : "Added to your wish list.");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Could not update your wish list.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className={styles.card}>
      <Link className={styles.imageLink} href={`/products/${product.slug}`} aria-label={`View ${product.name}`}>
        <img src={product.imageUrl} alt={product.name} className={styles.image} />
      </Link>
      <button type="button"
        className={`${styles.wishButton} ${isSaved ? styles.wishButtonActive : ""}`}
        disabled={busy || !wishListLoaded}
        aria-pressed={isSaved}
        aria-label={`${isSaved ? "Remove" : "Add"} ${product.name} ${isSaved ? "from" : "to"} wish list`}
        onClick={() => void toggleWishList()}>
        <span aria-hidden="true">{isSaved ? "♥" : "♡"}</span>
      </button>
      <div className={styles.info}>
        <Link href={`/products/${product.slug}`} className={styles.name}>{product.name}</Link>
        <p className={styles.price}>{formatPrice(product.priceGbp)}</p>
        <div className={styles.actions}>
          <button className={styles.addButton} disabled={busy} onClick={() => void addToCart()}>Add to cart</button>
          <button className={styles.buyButton} disabled={busy} onClick={() => void buyNow()}>Buy now</button>
        </div>
        <p className={styles.status} role="status" aria-live="polite">{message}</p>
      </div>
    </article>
  );
}
