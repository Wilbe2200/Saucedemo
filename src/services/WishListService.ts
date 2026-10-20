import { z } from "zod";
import { NotFoundError, ValidationError } from "@/domain/errors";
import { WishList } from "@/domain/WishList";
import { IProductRepository } from "@/repositories/IProductRepository";
import { IWishListRepository } from "@/repositories/IWishListRepository";

const wishlistInput = z.object({ sessionId: z.string().min(1).max(100), productId: z.string().min(1).max(100) });

/** Coordina la lista de deseos y valida sus identificadores antes de persistir. */
export class WishListService {
  constructor(
    private readonly lists: IWishListRepository,
    private readonly products: IProductRepository,
  ) {}

  async get(sessionId: string): Promise<WishList> {
    const parsed = z.string().min(1).max(100).safeParse(sessionId);
    if (!parsed.success) throw new ValidationError("A valid session ID is required.");
    return this.lists.findBySessionId(sessionId);
  }

  async add(input: unknown): Promise<WishList> {
    const data = this.parse(input);
    if (!(await this.products.findById(data.productId))) throw new NotFoundError("Product not found.");
    return this.lists.add(data.sessionId, data.productId);
  }

  async remove(input: unknown): Promise<WishList> {
    const data = this.parse(input);
    return this.lists.remove(data.sessionId, data.productId);
  }

  private parse(input: unknown): z.infer<typeof wishlistInput> {
    const parsed = wishlistInput.safeParse(input);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid wish list item.");
    return parsed.data;
  }
}
