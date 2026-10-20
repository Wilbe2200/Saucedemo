import { Product } from "./Product";
import { ValidationError } from "./errors";

/** Encapsula un producto y una cantidad válida dentro de un carrito. */
export class CartItem {
  private readonly cartProduct: Product;
  private itemQuantity: number;

  constructor(product: Product, quantity: number) {
    if (!Number.isInteger(quantity) || quantity < 1) throw new ValidationError("Quantity must be a positive integer.");
    this.cartProduct = product;
    this.itemQuantity = quantity;
  }

  get product(): Product { return this.cartProduct; }
  get quantity(): number { return this.itemQuantity; }
  get lineTotal(): number { return this.cartProduct.priceGbp * this.itemQuantity; }
  setQuantity(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity < 1) throw new ValidationError("Quantity must be a positive integer.");
    this.itemQuantity = quantity;
  }

  toJSON(): { product: ReturnType<Product["toJSON"]>; quantity: number; lineTotal: number } {
    return { product: this.product.toJSON(), quantity: this.quantity, lineTotal: this.lineTotal };
  }
}
