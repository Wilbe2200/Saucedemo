import { z } from "zod";
import { Product } from "@/domain/Product";
import { NotFoundError } from "@/domain/errors";
import { IProductRepository } from "@/repositories/IProductRepository";

const slugSchema = z.string().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

/** Expone casos de uso de consulta de catálogo sin acoplarse a PostgreSQL. */
export class ProductService {
  constructor(private readonly products: IProductRepository) {}

  list(): Promise<Product[]> {
    return this.products.findAll();
  }

  async getBySlug(slug: string): Promise<Product> {
    const parsed = slugSchema.safeParse(slug);
    if (!parsed.success) throw new NotFoundError("Product not found.");
    const product = await this.products.findBySlug(parsed.data);
    if (!product) throw new NotFoundError("Product not found.");
    return product;
  }
}
