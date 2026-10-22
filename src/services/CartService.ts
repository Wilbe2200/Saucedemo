import { z } from "zod";
import { Cart } from "@/domain/Cart";
import { NotFoundError, ValidationError } from "@/domain/errors";
import { ICartRepository } from "@/repositories/ICartRepository";
import { IProductRepository } from "@/repositories/IProductRepository";

const itemSchema = z.object({
  cartId: z.string().min(1).max(100),
  productId: z.string().min(1).max(100),
  quantity: z.number().int().min(1).max(99),
});

/** Coordina operaciones del carrito y verifica referencias y cantidades. */
export class CartService {
  constructor(
    private readonly carts: ICartRepository,
    private readonly products: IProductRepository,
  ) {}

  async get(cartId: string): Promise<Cart> {
    const validId = z.string().min(1).max(100).safeParse(cartId);
    if (!validId.success) throw new ValidationError("A valid cart ID is required.");
    return (await this.carts.findById(cartId)) ?? new Cart(cartId, []);
  }

  async add(input: unknown): Promise<Cart> {
    const data = this.parseItem(input);
    if (!(await this.products.findById(data.productId))) throw new NotFoundError("Product not found.");
    return this.carts.addItem(data.cartId, data.productId, data.quantity);
  }

  async setQuantity(productId: string, input: unknown): Promise<Cart> {
    const body = z.object({ cartId: z.string().min(1).max(100), quantity: z.number().int().min(1).max(99) }).safeParse(input);
    if (!body.success) throw new ValidationError(body.error.issues[0]?.message ?? "Invalid cart item.");
    const data = { ...body.data, productId };
    const cart = await this.carts.findById(data.cartId);
    if (!cart) throw new NotFoundError("Cart not found.");
    if (!(await this.products.findById(data.productId))) throw new NotFoundError("Product not found.");
    if (!cart.items.some((item) => item.product.id === data.productId)) throw new NotFoundError("Cart item not found.");
    return this.carts.setQuantity(data.cartId, data.productId, data.quantity);
  }

  async remove(cartId: string, productId: string): Promise<Cart> {
    this.parseItem({ cartId, productId, quantity: 1 });
    return this.carts.removeItem(cartId, productId);
  }

  async clear(cartId: string): Promise<Cart> {
    const validId = z.string().min(1).max(100).safeParse(cartId);
    if (!validId.success) throw new ValidationError("A valid cart ID is required.");
    return this.carts.clearItems(cartId);
  }

  async merge(sourceCartId: string, targetCartId: string): Promise<void> {
    await this.carts.merge(sourceCartId, targetCartId);
  }

  private parseItem(input: unknown): z.infer<typeof itemSchema> {
    const parsed = itemSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid cart item.");
    return parsed.data;
  }
}
