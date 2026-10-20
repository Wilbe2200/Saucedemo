import { expect, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

/** Encapsula las aserciones de estado visible del panel del carrito. */
export class CartPage extends BasePage {
  constructor(page: Page) { super(page); }

  async expectEmpty(): Promise<void> {
    await expect(this.page.getByRole("dialog").getByText("Your cart is empty.")).toBeVisible();
  }

  async expectItemCount(count: number): Promise<void> {
    await expect(this.page.getByRole("button", { name: `Open cart with ${count} items` })).toBeVisible();
  }
}
