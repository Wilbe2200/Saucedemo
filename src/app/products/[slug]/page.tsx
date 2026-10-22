import { notFound } from "next/navigation";
import { ProductActions } from "@/components/ProductActions";
import { productService } from "@/lib/services";
import { NotFoundError } from "@/domain/errors";
import { formatPrice } from "@/lib/price";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const product = await productService.getBySlug(slug);
    return (
      <section className="product-detail">
        <img src={product.imageUrl} alt={product.name} />
        <div><p className="eyebrow">SAUCE DEMO / COLLECTION</p><h1>{product.name}</h1>
          <p className="detail-price">{formatPrice(product.priceGbp)}</p><p>{product.description}</p>
          <ProductActions product={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            priceGbp: product.priceGbp,
            imageUrl: product.imageUrl,
            description: product.description,
          }} />
        </div>
      </section>
    );
  } catch (error: unknown) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
}
