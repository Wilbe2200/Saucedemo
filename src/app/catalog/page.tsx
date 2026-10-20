import { ProductCard, ProductData } from "@/components/ProductCard";
import { productService } from "@/lib/services";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const products = await productService.list();
  return (
    <section className="section-block">
      <p className="eyebrow">THE COLLECTION</p><h1>Catalog</h1>
      <div className="product-grid">{products.map((product) => {
        const data: ProductData = {
          id: product.id, name: product.name, slug: product.slug, priceGbp: product.priceGbp,
          imageUrl: product.imageUrl, description: product.description,
        };
        return <ProductCard key={data.id} product={data} />;
      })}</div>
    </section>
  );
}
