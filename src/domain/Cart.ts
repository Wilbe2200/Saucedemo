import { CartItem } from "./CartItem";
import { ValidationError } from "./errors";

/** Agrupa los artículos de compra y calcula cantidades y subtotal. */
export class Cart {
  private readonly cartId: string;
  private readonly cartItems: CartItem[];

  constructor(id: string, items: CartItem[]) {
    if (!id) throw new ValidationError("Cart identity is required.");
    this.cartId = id;
    this.cartItems = [...items];
  }

  get id(): string { return this.cartId; }
  get items(): CartItem[] { return [...this.cartItems]; }
  get count(): number { return this.cartItems.reduce((total, item) => total + item.quantity, 0); }
  get subtotal(): number { return this.cartItems.reduce((total, item) => total + item.lineTotal, 0); }

  toJSON(): { id: string; items: ReturnType<CartItem["toJSON"]>[]; count: number; subtotal: number } {
    return { id: this.id, items: this.items.map((item) => item.toJSON()), count: this.count, subtotal: this.subtotal };
  }
}
