import { expect, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

/** Define localizadores y acciones comprobables de la página de inicio. */
export class HomePage extends BasePage {
  constructor(page: Page) { super(page); }

  async expectFeaturedProducts(): Promise<void> {
    await expect(this.page.getByRole("heading", { name: "Featured products" })).toBeVisible();
    await expect(this.page.getByRole("link", { name: "Grey jacket" })).toBeVisible();
  }

  async addFirstProductToCart(): Promise<void> {
    await this.page.getByRole("button", { name: "Add to cart" }).first().click();
  }

  async addFirstProductToWishList(): Promise<void> {
    await this.page.getByRole("button", { name: /add .* to wish list/i }).first().click();
  }
}
