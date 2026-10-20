import { AuthService } from "@/services/AuthService";
import { CartService } from "@/services/CartService";
import { ProductService } from "@/services/ProductService";
import { WishListService } from "@/services/WishListService";
import { PostgresCartRepository } from "@/repositories/PostgresCartRepository";
import { PostgresProductRepository } from "@/repositories/PostgresProductRepository";
import { PostgresUserRepository } from "@/repositories/PostgresUserRepository";
import { PostgresWishListRepository } from "@/repositories/PostgresWishListRepository";

const productRepository = new PostgresProductRepository();
export const productService = new ProductService(productRepository);
export const cartService = new CartService(new PostgresCartRepository(), productRepository);
export const wishListService = new WishListService(new PostgresWishListRepository(), productRepository);
export const authService = new AuthService(new PostgresUserRepository());
