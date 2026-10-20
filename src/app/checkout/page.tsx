import Link from "next/link";

export default function CheckoutPage() {
  return (
    <section className="text-page">
      <p className="eyebrow">SECURE CHECKOUT</p>
      <h1>Checkout</h1>
      <p>Checkout is not enabled on this demo store. Your cart is saved so you can keep browsing.</p>
      <Link className="button button-dark" href="/catalog">Continue shopping</Link>
    </section>
  );
}
