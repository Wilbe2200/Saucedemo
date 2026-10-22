"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ProductData } from "@/components/ProductCard";
import { dispatchStoreEvent, ensureStoreSession, STORE_EVENT_KEY } from "@/lib/store-client";

interface WishListContextValue {
  products: ProductData[];
  loaded: boolean;
  error: string;
  refresh: () => Promise<void>;
  toggle: (product: ProductData) => Promise<void>;
  remove: (productId: string) => Promise<void>;
}

const WishListContext = createContext<WishListContextValue | null>(null);
export function WishListProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    await ensureStoreSession();
    const response = await fetch("/api/wishlist", { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load your wish list.");
    const list = await response.json() as { products: ProductData[] };
    setProducts(list.products);
    setError("");
    setLoaded(true);
  }, []);

  useEffect(() => {
    let active = true;
    const load = async (): Promise<void> => {
      try {
        await refresh();
      } catch (cause: unknown) {
        if (active) {
          setError(cause instanceof Error ? cause.message : "Could not load your wish list.");
          setLoaded(true);
        }
      }
    };
    const onStorage = (event: StorageEvent): void => {
      if (event.key === STORE_EVENT_KEY) void load();
    };
    const onWishListUpdate = (): void => { void load(); };
    const onVisibility = (): void => {
      if (document.visibilityState === "visible") void load();
    };
    void load();
    window.addEventListener("sauce-wishlist-updated", onWishListUpdate);
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      active = false;
      window.removeEventListener("sauce-wishlist-updated", onWishListUpdate);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh]);

  const mutate = useCallback(async (productId: string, add: boolean, product?: ProductData) => {
    await ensureStoreSession();
    const response = add
      ? await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        })
      : await fetch(`/api/wishlist/items/${encodeURIComponent(productId)}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Could not update your wish list. Please try again.");
    const list = await response.json() as { products: ProductData[] };
    setProducts(list.products);
    setError("");
    dispatchStoreEvent("sauce-wishlist-updated");
    if (add && product && !list.products.some((saved) => saved.id === product.id)) {
      throw new Error("The product was not returned in the updated wish list.");
    }
  }, []);

  const toggle = useCallback(async (product: ProductData) => {
    const isSaved = products.some((saved) => saved.id === product.id);
    const previous = products;
    setProducts(isSaved ? products.filter((saved) => saved.id !== product.id) : [...products, product]);
    try {
      await mutate(product.id, !isSaved, product);
    } catch (cause: unknown) {
      setProducts(previous);
      const message = cause instanceof Error ? cause.message : "Could not update your wish list.";
      setError(message);
      throw new Error(message);
    }
  }, [mutate, products]);

  const remove = useCallback(async (productId: string) => {
    try {
      await mutate(productId, false);
    } catch (cause: unknown) {
      const message = cause instanceof Error ? cause.message : "Could not remove this item.";
      setError(message);
      throw new Error(message);
    }
  }, [mutate]);

  const value = useMemo(() => ({ products, loaded, error, refresh, toggle, remove }), [
    products, loaded, error, refresh, toggle, remove,
  ]);

  return <WishListContext.Provider value={value}>{children}</WishListContext.Provider>;
}

export function useWishList(): WishListContextValue {
  const context = useContext(WishListContext);
  if (!context) throw new Error("useWishList must be used within WishListProvider.");
  return context;
}
