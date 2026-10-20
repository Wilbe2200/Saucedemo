import { Product } from "@/domain/Product";

/** Define las operaciones de persistencia disponibles para productos. */
export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findBySlug(slug: string): Promise<Product | null>;
  findById(id: string): Promise<Product | null>;
}
