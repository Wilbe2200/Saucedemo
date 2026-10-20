import { Product as ProductRow } from "@prisma/client";
import { Product } from "@/domain/Product";
import { WishList } from "@/domain/WishList";
import { db } from "@/lib/db";
import { IWishListRepository } from "./IWishListRepository";

/** Implementa listas de deseos separadas por identificador de sesión. */
export class PostgresWishListRepository implements IWishListRepository {
  async findBySessionId(sessionId: string): Promise<WishList> {
    const rows = await db.wishlistItem.findMany({
      where: { sessionId },
      include: { product: true },
      orderBy: { createdAt: "asc" },
    });
    return new WishList(sessionId, rows.map((row) => this.toDomain(row.product)));
  }

  async add(sessionId: string, productId: string): Promise<WishList> {
    await db.wishlistItem.upsert({
      where: { sessionId_productId: { sessionId, productId } },
      create: { sessionId, productId },
      update: {},
    });
    return this.findBySessionId(sessionId);
  }

  async remove(sessionId: string, productId: string): Promise<WishList> {
    await db.wishlistItem.deleteMany({ where: { sessionId, productId } });
    return this.findBySessionId(sessionId);
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
