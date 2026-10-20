import { Product as ProductRow } from "@prisma/client";
import { Product } from "@/domain/Product";
import { db } from "@/lib/db";
import { IProductRepository } from "./IProductRepository";

/** Implementa el repositorio de productos sobre PostgreSQL mediante Prisma. */
export class PostgresProductRepository implements IProductRepository {
  async findAll(): Promise<Product[]> {
    const rows = await db.product.findMany({ orderBy: { createdAt: "asc" } });
    return rows.map((row) => this.toDomain(row));
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const row = await db.product.findUnique({ where: { slug } });
    return row ? this.toDomain(row) : null;
  }

  async findById(id: string): Promise<Product | null> {
    const row = await db.product.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  private toDomain(row: ProductRow): Product {
    return new Product({
      id: row.id,
      name: row.name,
      slug: row.slug,
      priceGbp: Number(row.priceGbp),
      imageUrl: row.imageUrl,
      description: row.description,
    });
  }
}
