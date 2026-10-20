import { expect, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

/** Encapsula la navegación y verificación de productos guardados. */
export class WishListPage extends BasePage {
  constructor(page: Page) { super(page); }

  async expectProduct(productName: string): Promise<void> {
    await expect(this.page.getByRole("link", { name: productName }).first()).toBeVisible();
  }
}
