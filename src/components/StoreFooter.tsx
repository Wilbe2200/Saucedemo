import Link from "next/link";

/** Presenta enlaces auxiliares, descripción de Sauce y medios de pago. */
export function StoreFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-links"><Link href="/search">Search</Link><Link href="/about-us">About Us</Link></div>
      <p className="footer-description">This is a demo site created for Sauce, an awesome new way to make your Shopify site social. Sauce allows you to let customers to share what they purchase to their friends, and see what their friends have purchased or &apos;wanted&apos; on your store.</p>
      <div className="payment-logos" aria-label="Accepted payment methods"><span>AMEX</span><span>VISA</span><span>Mastercard</span></div>
      <p className="copyright">© 2026 Sauce Demo. Shopping Cart by Shopify</p>
    </footer>
  );
}
