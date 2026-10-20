import { WishList } from "@/domain/WishList";

/** Define la persistencia de productos guardados por sesión. */
export interface IWishListRepository {
  findBySessionId(sessionId: string): Promise<WishList>;
  add(sessionId: string, productId: string): Promise<WishList>;
  remove(sessionId: string, productId: string): Promise<WishList>;
}
