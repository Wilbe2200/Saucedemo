"use client";

import { useCallback, useEffect, useState } from "react";
import { ProductCard, ProductData } from "@/components/ProductCard";
import { browserSessionId } from "@/lib/store-client";

/** Carga y presenta la lista de deseos privada de la sesión actual. */
export function WishListView() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const response = await fetch(`/api/wishlist?sessionId=${encodeURIComponent(browserSessionId("wishlist"))}`);
    if (response.ok) {
      const list = (await response.json()) as { products: ProductData[] };
      setProducts(list.products);
      setError("");
    } else {
      setError("Could not load your wish list. Please try again.");
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    void load();
    window.addEventListener("sauce-wishlist-updated", load);
    return () => window.removeEventListener("sauce-wishlist-updated", load);
  }, [load]);

  async function removeProduct(productId: string): Promise<void> {
    const response = await fetch(
      `/api/wishlist/items/${encodeURIComponent(productId)}?sessionId=${encodeURIComponent(browserSessionId("wishlist"))}`,
      { method: "DELETE" },
    );
    if (response.ok) await load();
    else setError("Could not remove this item. Please try again.");
  }

  return (
    <>
      {error && <p role="alert">{error}</p>}
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
