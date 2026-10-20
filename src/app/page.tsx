import { ProductCard, ProductData } from "@/components/ProductCard";
import { productService } from "@/lib/services";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await productService.list();
  const featured: ProductData[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    priceGbp: product.priceGbp,
    imageUrl: product.imageUrl,
    description: product.description,
  }));
  return (
    <>
      <section className="hero">
        <p className="eyebrow">THE SAUCE EDIT</p>
        <h1>Good style.<br />Better together.</h1>
        <p>Discover the pieces your friends will want to know about.</p>
        <a className="button button-light" href="/catalog">Shop the collection</a>
      </section>
      <section className="section-block">
        <div className="section-heading"><div><p className="eyebrow">CURATED FOR YOU</p><h2>Featured products</h2></div><a href="/catalog" className="text-link">Shop all products →</a></div>
        {featured.length === 0 ? <p>No products are available yet.</p> : <div className="product-grid">{featured.map((product) => <ProductCard key={product.id} product={product} />)}</div>}
      </section>
    </>
  );
}
