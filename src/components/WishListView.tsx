"use client";

import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { useWishList } from "@/components/WishListProvider";

/** Carga y presenta la lista de deseos privada de la sesión actual. */
export function WishListView() {
  const { products, loaded, error, remove } = useWishList();
  const [actionError, setActionError] = useState("");

  async function removeProduct(productId: string): Promise<void> {
    setActionError("");
    try {
      await remove(productId);
    } catch (cause: unknown) {
      setActionError(cause instanceof Error ? cause.message : "Could not remove this item.");
    }
  }

  return (
    <>
      {error && <p role="alert">{error}</p>}
      {actionError && <p role="alert">{actionError}</p>}
      {loaded && products.length === 0 && <p>Your wish list is empty.</p>}
      <div className="product-grid">{products.map((product) => (
        <div key={product.id}>
          <ProductCard product={product} />
          <button className="text-link" onClick={() => void removeProduct(product.id)}>Remove from wish list</button>
        </div>
      ))}</div>
    </>
  );
}
