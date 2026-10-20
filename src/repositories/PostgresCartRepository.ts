import { Cart as CartRow, CartItem as CartItemRow, Product as ProductRow } from "@prisma/client";
import { Cart } from "@/domain/Cart";
import { CartItem } from "@/domain/CartItem";
import { Product } from "@/domain/Product";
import { db } from "@/lib/db";
import { ICartRepository } from "./ICartRepository";

type CartWithItems = CartRow & { items: (CartItemRow & { product: ProductRow })[] };

/** Implementa las operaciones de carritos persistidas en PostgreSQL. */
export class PostgresCartRepository implements ICartRepository {
  async findById(id: string): Promise<Cart | null> {
    const row = await db.cart.findUnique({ where: { id }, include: { items: { include: { product: true } } } });
    return row ? this.toDomain(row) : null;
  }

  async addItem(cartId: string, productId: string, quantity: number): Promise<Cart> {
    await db.cart.upsert({ where: { id: cartId }, create: { id: cartId }, update: {} });
    await db.cartItem.upsert({
      where: { cartId_productId: { cartId, productId } },
      create: { cartId, productId, quantity },
      update: { quantity: { increment: quantity } },
    });
    return this.requireCart(cartId);
  }

  async setQuantity(cartId: string, productId: string, quantity: number): Promise<Cart> {
    await db.cartItem.update({ where: { cartId_productId: { cartId, productId } }, data: { quantity } });
    return this.requireCart(cartId);
  }

  async removeItem(cartId: string, productId: string): Promise<Cart> {
    await db.cartItem.deleteMany({ where: { cartId, productId } });
    return (await this.findById(cartId)) ?? new Cart(cartId, []);
  }

  private async requireCart(id: string): Promise<Cart> {
    const cart = await this.findById(id);
    if (!cart) throw new Error(`Cart ${id} was not persisted.`);
    return cart;
  }

  private toDomain(row: CartWithItems): Cart {
    const items = row.items.map((item) =>
      new CartItem(
        new Product({
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          priceGbp: Number(item.product.priceGbp),
          imageUrl: item.product.imageUrl,
          description: item.product.description,
        }),
        item.quantity,
      ),
    );
    return new Cart(row.id, items);
  }
}
