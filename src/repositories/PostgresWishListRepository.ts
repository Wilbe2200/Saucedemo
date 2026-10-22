import { Product as ProductRow } from "@prisma/client";
import { Product } from "@/domain/Product";
import { WishList } from "@/domain/WishList";
import { prisma as db } from "@/lib/db";
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

  async merge(sourceSessionId: string, targetSessionId: string): Promise<void> {
    if (sourceSessionId === targetSessionId) return;
    await db.$transaction(async (transaction) => {
      const savedItems = await transaction.wishlistItem.findMany({
        where: { sessionId: sourceSessionId },
        select: { productId: true },
      });
      for (const item of savedItems) {
        await transaction.wishlistItem.upsert({
          where: { sessionId_productId: { sessionId: targetSessionId, productId: item.productId } },
          create: { sessionId: targetSessionId, productId: item.productId },
          update: {},
        });
      }
      await transaction.wishlistItem.deleteMany({ where: { sessionId: sourceSessionId } });
    });
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
