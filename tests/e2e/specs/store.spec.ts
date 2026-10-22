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
  const home = new HomePage(page);
  const cart = new CartPage(page);
  await home.goto("/");
  await home.openCart();
  await cart.expectEmpty();
});

test("customer can add a product to the wish list", async ({ page }) => {
  const home = new HomePage(page);
  const list = new WishListPage(page);
  await home.goto("/");
  await home.addFirstProductToWishList();
  await expect(page.getByText("Added to your wish list.", { exact: true })).toBeAttached();
  await page.goto("/wishlist");
  await list.expectProduct("Sauce Labs Backpack");
});

test("customer can remove a product from the wish list", async ({ page }) => {
  const home = new HomePage(page);
  await home.goto("/");
  await home.addFirstProductToWishList();
  await expect(page.getByText("Added to your wish list.", { exact: true })).toBeAttached();
  await page.goto("/wishlist");
  await expect(page.getByRole("link", { name: "Sauce Labs Backpack", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Remove from wish list" }).click();
  await expect(page.getByText("Your wish list is empty.")).toBeVisible();
});

test("buy now adds the product and opens checkout", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Buy now" }).first().click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByText("Qty 1 · £29.99 each")).toBeVisible();
});

test("customer can complete sandbox checkout and cart is cleared", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Buy now" }).first().click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByLabel("First name")).toBeVisible();
  await page.getByLabel("First name").fill("Alex");
  await page.getByLabel("Last name").fill("Example");
  await page.getByLabel("Email address").fill("alex@example.com");
  await page.getByLabel("Shipping address").fill("123 Demo Street");
  await page.getByLabel("City").fill("London");
  await page.getByLabel("Postcode").fill("SW1A 1AA");
  await page.getByLabel("Phone number").fill("020 7946 0958");
  await expect(page.locator(".checkout-grand-total dd")).toHaveText("£41.98");
  await page.getByRole("button", { name: "Complete order" }).click();
  await expect(page.getByRole("heading", { name: "¡Compra realizada con éxito!" })).toBeVisible();
  await expect(page.getByText(/Order #ORD-[0-9]{5}/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Open cart with 0 items" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Continue shopping" })).toBeVisible();
});

test("referral page provides a code and working social share links", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async () => undefined },
    });
  });
  await page.goto("/refer-a-friend");
  await expect(page.getByText(/^SAUCE-[A-F0-9]{8}$/)).toBeVisible();
  const socialLinks = page.locator(".referral-socials");
  await expect(socialLinks.getByRole("link", { name: "WhatsApp" })).toHaveAttribute("href", /^https:\/\/wa\.me\//);
  await expect(socialLinks.getByRole("link", { name: "Facebook" })).toHaveAttribute("href", /facebook\.com\/sharer/);
  await expect(socialLinks.getByRole("link", { name: "X \/ Twitter" })).toHaveAttribute("href", /twitter\.com\/intent\/tweet/);
  await expect(socialLinks.getByRole("link", { name: "Telegram" })).toHaveAttribute("href", /t\.me\/share/);
  await page.getByRole("button", { name: "Copy link" }).click();
  await expect(page.getByText("Referral link copied.")).toBeVisible();
});

test("blog index exposes article links", async ({ page }) => {
  await page.goto("/blog");
  await expect(page.getByRole("link", { name: "Building a more considered wardrobe" }))
    .toHaveAttribute("href", "/blog/building-a-considered-wardrobe");
});
