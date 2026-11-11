import { expect, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

/** Define localizadores y acciones comprobables del catálogo. */
export class CatalogPage extends BasePage {
  constructor(page: Page) { super(page); }

  async expectProducts(): Promise<void> {
    await expect(this.page.getByRole("heading", { name: "Catalog", exact: true })).toBeVisible();
    await expect(this.page.getByRole("link", { name: "Sauce Labs Backpack", exact: true })).toBeVisible();
  }

  async addFirstProductToCart(): Promise<void> {
    await this.page.getByRole("button", { name: "Add to cart" }).first().click();
  }

  async addFirstProductToWishList(): Promise<void> {
    await this.page.getByRole("button", { name: /add .* to wish list/i }).first().click();
  }
}
