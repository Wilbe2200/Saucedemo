"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { dispatchStoreEvent, ensureStoreSession, formatPrice, STORE_EVENT_KEY } from "@/lib/store-client";

interface CartData {
  id: string;
  items: { product: { id: string; name: string; imageUrl: string; priceGbp: number }; quantity: number }[];
  count: number;
  subtotal: number;
}

/** Mantiene navegación, contador dinámico y panel interactivo del carrito. */
export function StoreHeader() {
  const [cart, setCart] = useState<CartData | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartError, setCartError] = useState("");

  const loadCart = useCallback(async () => {
    try {
      await ensureStoreSession();
      const response = await fetch("/api/cart", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load your cart. Please try again.");
      setCart((await response.json()) as CartData);
      setCartError("");
    } catch (cause: unknown) {
      setCartError(cause instanceof Error ? cause.message : "Could not load your cart.");
    }
  }, []);

  useEffect(() => {
    void loadCart();
    const refresh = (): void => { void loadCart(); };
    const refreshFromOtherTab = (event: StorageEvent): void => {
      if (event.key === STORE_EVENT_KEY) refresh();
    };
    window.addEventListener("sauce-cart-updated", refresh);
    window.addEventListener("storage", refreshFromOtherTab);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("sauce-cart-updated", refresh);
      window.removeEventListener("storage", refreshFromOtherTab);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [loadCart]);

  async function setQuantity(productId: string, quantity: number): Promise<void> {
    if (!cart) return;
    try {
      await ensureStoreSession();
      const url = `/api/cart/items/${encodeURIComponent(productId)}`;
      const response = quantity < 1
        ? await fetch(url, { method: "DELETE" })
        : await fetch(`/api/cart/items/${encodeURIComponent(productId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity }),
        });
      if (!response.ok) throw new Error("Could not update your cart. Please try again.");
      await loadCart();
      dispatchStoreEvent("sauce-cart-updated");
    } catch (cause: unknown) {
      setCartError(cause instanceof Error ? cause.message : "Could not update your cart.");
    }
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-inner">
          <div className="social-links" aria-label="Social media">
            <a href="https://facebook.com" aria-label="Facebook">f</a><a href="https://twitter.com" aria-label="Twitter">𝕏</a>
            <a href="https://instagram.com" aria-label="Instagram">◎</a><a href="https://pinterest.com" aria-label="Pinterest">p</a><a href="/feed" aria-label="RSS">◔</a>
          </div>
          <div className="utility-links"><Link href="/search">Search</Link><Link href="/about-us">About Us</Link><Link href="/login">Log In</Link><Link href="/register">Sign up</Link></div>
        </div>
      </div>
      <header className="site-header">
        <div className="brand">
          <button className="menu-toggle" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>☰</button>
          <Link href="/" className="brand-title">Sauce Demo</Link>
          <p>Just a demo site showing off what Sauce can do.</p>
        </div>
        <div className="header-cart">
          <button className="cart-summary" onClick={() => { setCartOpen(true); void loadCart(); }} aria-label={`Open cart with ${cart?.count ?? 0} items`}>
            My Cart ({cart?.count ?? 0})
          </button>
          <button className="button button-dark checkout-shortcut" onClick={() => { setCartOpen(true); void loadCart(); }}>Check Out</button>
        </div>
      </header>
      <nav className={`main-nav ${menuOpen ? "nav-open" : ""}`} aria-label="Main navigation">
        <Link href="/">Home</Link><Link href="/catalog">Catalog</Link><Link href="/blog">Blog</Link><Link href="/about-us">About Us</Link>
        <Link href="/wishlist">Wish list</Link><Link href="/refer-a-friend">Refer a friend</Link><Link href="/login">Login</Link><Link href="/register">Create account</Link>
      </nav>
      {cartOpen && (
        <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false); }}>
          <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
            <div className="drawer-heading"><h2 id="cart-title">Your cart</h2><button aria-label="Close cart" onClick={() => setCartOpen(false)}>×</button></div>
            {cartError && <p role="alert">{cartError}</p>}
            {!cart?.items.length ? <p>Your cart is empty.</p> : (
              <>
                <ul className="drawer-items">{cart.items.map(({ product, quantity }) => (
                  <li key={product.id} className="drawer-item">
                    <img src={product.imageUrl} alt={product.name} />
                    <div className="drawer-item-copy"><strong>{product.name}</strong><span>{formatPrice(product.priceGbp)}</span>
                      <div className="quantity-control"><button aria-label={`Decrease ${product.name} quantity`} onClick={() => void setQuantity(product.id, quantity - 1)}>−</button>
                        <span>{quantity}</span><button aria-label={`Increase ${product.name} quantity`} onClick={() => void setQuantity(product.id, quantity + 1)}>+</button>
                        <button className="remove-item" onClick={() => void setQuantity(product.id, 0)}>Remove</button></div>
                    </div>
                  </li>
                ))}</ul>
                <div className="subtotal"><strong>Subtotal</strong><strong>{formatPrice(cart.subtotal)}</strong></div>
                <Link className="button button-dark full-width" href="/checkout" onClick={() => setCartOpen(false)}>Check Out</Link>
              </>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
