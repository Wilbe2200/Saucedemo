import { ProductCard, ProductData } from "@/components/ProductCard";
import { productService } from "@/lib/services";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const products = q ? (await productService.list()).filter((product) => product.name.toLowerCase().includes(q.toLowerCase())) : [];
  return <section className="section-block"><p className="eyebrow">FIND YOUR NEXT FAVORITE</p><h1>Search</h1>
    <form className="search-form"><label htmlFor="q">Search products</label><input id="q" name="q" defaultValue={q} /><button className="button button-dark">Search</button></form>
    {q && <div className="product-grid">{products.map((product) => {
      const data: ProductData = { id: product.id, name: product.name, slug: product.slug, priceGbp: product.priceGbp, imageUrl: product.imageUrl, description: product.description };
      return <ProductCard key={data.id} product={data} />;
    })}{products.length === 0 && <p>No products found for “{q}”.</p>}</div>}
  </section>;
}
