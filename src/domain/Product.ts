import { ValidationError } from "./errors";

/** Representa un producto vendible y protege sus datos de dominio. */
export class Product {
  private readonly productId: string;
  private readonly productName: string;
  private readonly productSlug: string;
  private readonly productPrice: number;
  private readonly productImageUrl: string;
  private readonly productDescription: string;

  constructor(data: {
    id: string;
    name: string;
    slug: string;
    priceGbp: number;
    imageUrl: string;
    description: string;
  }) {
    if (!data.id || !data.name.trim() || !data.slug.trim()) throw new ValidationError("Product identity is required.");
    if (!Number.isFinite(data.priceGbp) || data.priceGbp < 0) throw new ValidationError("Product price must be non-negative.");
    this.productId = data.id;
    this.productName = data.name;
    this.productSlug = data.slug;
    this.productPrice = data.priceGbp;
    this.productImageUrl = data.imageUrl;
    this.productDescription = data.description;
  }

  get id(): string { return this.productId; }
  get name(): string { return this.productName; }
  get slug(): string { return this.productSlug; }
  get priceGbp(): number { return this.productPrice; }
  get imageUrl(): string { return this.productImageUrl; }
  get description(): string { return this.productDescription; }

  toJSON(): { id: string; name: string; slug: string; priceGbp: number; imageUrl: string; description: string } {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      priceGbp: this.priceGbp,
      imageUrl: this.imageUrl,
      description: this.description,
    };
  }
}
