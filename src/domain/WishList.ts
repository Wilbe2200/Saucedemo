import { Product } from "./Product";
import { ValidationError } from "./errors";

/** Representa la lista de deseos asociada a una sesión de tienda. */
export class WishList {
  private readonly ownerSessionId: string;
  private readonly savedProducts: Product[];

  constructor(sessionId: string, products: Product[]) {
    if (!sessionId) throw new ValidationError("Wish list session is required.");
    this.ownerSessionId = sessionId;
    this.savedProducts = [...products];
  }

  get sessionId(): string { return this.ownerSessionId; }
  get products(): Product[] { return [...this.savedProducts]; }

  toJSON(): { sessionId: string; products: ReturnType<Product["toJSON"]>[] } {
    return { sessionId: this.sessionId, products: this.products.map((product) => product.toJSON()) };
  }
}
