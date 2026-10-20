import { expect, Page } from "@playwright/test";

/** Encapsula navegación y acciones comunes a las páginas de la tienda. */
export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  async goto(path = "/"): Promise<void> {
    await this.page.goto(path);
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async openCart(): Promise<void> {
    await this.page.getByRole("button", { name: /open cart/i }).click();
  }

  async expectTitle(title: string): Promise<void> {
    await expect(this.page).toHaveTitle(new RegExp(title));
  }
}
