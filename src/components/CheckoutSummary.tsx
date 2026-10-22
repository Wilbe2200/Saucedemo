"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { dispatchStoreEvent, ensureStoreSession, formatPrice } from "@/lib/store-client";

interface CheckoutData {
  items: { product: { id: string; name: string; imageUrl: string; priceGbp: number }; quantity: number }[];
  count: number;
  subtotal: number;
}

interface CustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  postcode: string;
  phone: string;
}

interface OrderConfirmation {
  orderNumber: string;
  customer: CustomerDetails;
}

const SHIPPING_THRESHOLD_PENCE = 5000;
const SHIPPING_FEE_PENCE = 499;
const VAT_RATE = 0.2;

function toPence(amount: number): number {
  return Math.round(amount * 100);
}

function createOrderNumber(): string {
  const values = new Uint32Array(1);
  window.crypto.getRandomValues(values);
  return `#ORD-${10000 + (values[0] % 90000)}`;
}

export function CheckoutSummary() {
  const [cart, setCart] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"sandbox" | "card">("sandbox");
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null);

  useEffect(() => {
    let active = true;
    ensureStoreSession()
      .then(() => fetch("/api/cart", { cache: "no-store" }))
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load your cart. Please try again.");
        return response.json() as Promise<CheckoutData>;
      })
      .then((data) => { if (active) setCart(data); })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load your cart.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const subtotalPence = cart?.items.reduce(
    (sum, { product, quantity }) => sum + toPence(product.priceGbp) * quantity,
    0,
  ) ?? 0;
  const shippingPence = subtotalPence >= SHIPPING_THRESHOLD_PENCE ? 0 : SHIPPING_FEE_PENCE;
  const vatPence = Math.round((subtotalPence + shippingPence) * VAT_RATE);
  const totalPence = subtotalPence + shippingPence + vatPence;

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!cart?.items.length || submitting) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const customer: CustomerDetails = {
      firstName: String(formData.get("firstName") ?? "").trim(),
      lastName: String(formData.get("lastName") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      address: String(formData.get("address") ?? "").trim(),
      city: String(formData.get("city") ?? "").trim(),
      postcode: String(formData.get("postcode") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
    };
    if (Object.values(customer).some((value) => !value)) {
      setError("Please complete all required customer details.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await ensureStoreSession();
      const response = await fetch("/api/cart", { method: "DELETE" });
      if (!response.ok) throw new Error("We could not complete your order. Your cart has been kept; please try again.");
      setCart(await response.json() as CheckoutData);
      dispatchStoreEvent("sauce-cart-updated");
      setConfirmation({ orderNumber: createOrderNumber(), customer });
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "We could not complete your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p role="status">Loading your order…</p>;
  if (error && !cart) return <p role="alert">{error}</p>;
  if (!cart?.items.length && !confirmation) {
    return <div className="checkout-empty"><p>Your cart is empty.</p><Link className="button button-dark" href="/catalog">Continue shopping</Link></div>;
  }

  if (confirmation) {
    return (
      <section className="order-confirmation" aria-labelledby="order-confirmation-title" role="status">
        <p className="eyebrow">ORDER CONFIRMED</p>
        <h2 id="order-confirmation-title">¡Compra realizada con éxito!</h2>
        <p>Your demo order has been placed. No payment was collected.</p>
        <p className="order-number">Order {confirmation.orderNumber}</p>
        <dl className="confirmation-details">
          <div><dt>Customer</dt><dd>{confirmation.customer.firstName} {confirmation.customer.lastName}</dd></div>
          <div><dt>Email</dt><dd>{confirmation.customer.email}</dd></div>
          <div><dt>Shipping to</dt><dd>{confirmation.customer.address}, {confirmation.customer.city}, {confirmation.customer.postcode}</dd></div>
          <div><dt>Phone</dt><dd>{confirmation.customer.phone}</dd></div>
        </dl>
        <Link className="button button-dark" href="/catalog">Continue shopping</Link>
      </section>
    );
  }

  if (!cart) return <p role="alert">Your cart could not be loaded. Please refresh and try again.</p>;

  return (
    <form className="checkout-layout" onSubmit={(event) => void handleSubmit(event)}>
      <div className="checkout-form-panel">
        <section className="checkout-section" aria-labelledby="customer-details-title">
          <p className="eyebrow">01 · DELIVERY</p>
          <h2 id="customer-details-title">Customer details</h2>
          <div className="checkout-fields">
            <label>First name<input name="firstName" autoComplete="given-name" required /></label>
            <label>Last name<input name="lastName" autoComplete="family-name" required /></label>
            <label className="checkout-field-wide">Email address<input name="email" type="email" autoComplete="email" required /></label>
            <label className="checkout-field-wide">Shipping address<input name="address" autoComplete="street-address" required /></label>
            <label>City<input name="city" autoComplete="address-level2" required /></label>
            <label>Postcode<input name="postcode" autoComplete="postal-code" required /></label>
            <label className="checkout-field-wide">Phone number<input name="phone" type="tel" autoComplete="tel" required /></label>
          </div>
        </section>

        <section className="checkout-section" aria-labelledby="payment-title">
          <p className="eyebrow">02 · PAYMENT</p>
          <h2 id="payment-title">Payment method</h2>
          <label className="payment-option">
            <input type="radio" name="paymentMethod" value="sandbox" checked={paymentMethod === "sandbox"} onChange={() => setPaymentMethod("sandbox")} />
            <span><strong>Simulated / Sandbox payment</strong><small>Complete this demo checkout without entering payment details.</small></span>
          </label>
          <label className="payment-option">
            <input type="radio" name="paymentMethod" value="card" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} />
            <span><strong>Fictional card</strong><small>For demonstration only. Card information is not sent or stored.</small></span>
          </label>
          {paymentMethod === "card" && (
            <div className="checkout-fields checkout-card-fields">
              <label className="checkout-field-wide">Card number<input name="cardNumber" inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" pattern="[0-9 ]{13,23}" maxLength={23} required /></label>
              <label>Expiration date<input name="expiry" autoComplete="cc-exp" placeholder="MM/YY" pattern="(0[1-9]|1[0-2])/[0-9]{2}" required /></label>
              <label>CVV<input name="cvv" inputMode="numeric" autoComplete="cc-csc" pattern="[0-9]{3,4}" maxLength={4} required /></label>
            </div>
          )}
        </section>
        {error && <p className="checkout-error" role="alert">{error}</p>}
        <button className="button button-dark checkout-submit" type="submit" disabled={submitting}>
          {submitting ? "Processing…" : "Complete order"}
        </button>
      </div>

      <aside className="checkout-order" aria-labelledby="order-summary-title">
        <p className="eyebrow">YOUR ORDER</p>
        <h2 id="order-summary-title">Order summary</h2>
        <ul className="checkout-items">
          {cart.items.map(({ product, quantity }) => (
            <li key={product.id}>
              <img src={product.imageUrl} alt={product.name} />
              <span className="checkout-product-copy"><strong>{product.name}</strong><small>Qty {quantity} · {formatPrice(product.priceGbp)} each</small></span>
              <strong>{formatPrice(toPence(product.priceGbp) * quantity / 100)}</strong>
            </li>
          ))}
        </ul>
        <dl className="checkout-totals">
          <div><dt>Subtotal ({cart.count} items)</dt><dd>{formatPrice(subtotalPence / 100)}</dd></div>
          <div><dt>Shipping</dt><dd>{shippingPence ? formatPrice(shippingPence / 100) : "Free"}</dd></div>
          <div><dt>VAT (20%)</dt><dd>{formatPrice(vatPence / 100)}</dd></div>
          <div className="checkout-grand-total"><dt>Total</dt><dd>{formatPrice(totalPence / 100)}</dd></div>
        </dl>
        <p className="checkout-shipping-note">
          {subtotalPence >= SHIPPING_THRESHOLD_PENCE
            ? "Your order qualifies for free shipping."
            : `Free shipping on orders over ${formatPrice(SHIPPING_THRESHOLD_PENCE / 100)}.`}
        </p>
      </aside>
    </form>
  );
}
