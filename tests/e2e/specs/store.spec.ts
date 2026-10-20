import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { CartPage } from "../pages/CartPage";
import { WishListPage } from "../pages/WishListPage";

test("home shows seeded products", async ({ page }) => {
  const home = new HomePage(page);
  await home.goto("/");
  await home.expectFeaturedProducts();
});

test("customer can add a product to the cart", async ({ page }) => {
  const home = new HomePage(page);
  const cart = new CartPage(page);
  await home.goto("/");
  await home.addFirstProductToCart();
  await expect(page.getByText("Added to your cart.", { exact: true })).toBeAttached();
  await cart.expectItemCount(1);
});

test("an empty cart shows its empty message", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("sauce-demo-cart-id", crypto.randomUUID());
  });
  const home = new HomePage(page);
  const cart = new CartPage(page);
  await home.goto("/");
  await home.openCart();
  await cart.expectEmpty();
});

test("customer can add a product to the wish list", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("sauce-demo-session-id", crypto.randomUUID());
  });
  const home = new HomePage(page);
  const list = new WishListPage(page);
  await home.goto("/");
  await home.addFirstProductToWishList();
  await expect(page.getByText("Added to your wish list.", { exact: true })).toBeAttached();
  await page.goto("/wishlist");
  await list.expectProduct("Grey jacket");
});
