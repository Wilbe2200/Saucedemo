import { Cart } from "@/domain/Cart";

/** Define la persistencia de carritos y sus artículos. */
export interface ICartRepository {
  findById(id: string): Promise<Cart | null>;
  addItem(cartId: string, productId: string, quantity: number): Promise<Cart>;
  setQuantity(cartId: string, productId: string, quantity: number): Promise<Cart>;
  removeItem(cartId: string, productId: string): Promise<Cart>;
  clearItems(cartId: string): Promise<Cart>;
  merge(sourceCartId: string, targetCartId: string): Promise<void>;
}
