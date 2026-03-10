import { Page, Locator, expect } from "@playwright/test";

export class CartPage {
  readonly page: Page;
  readonly checkoutBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.checkoutBtn = page.getByRole("button", { name: /checkout/i });
  }

  async clickCheckout() {
    await expect(this.checkoutBtn).toBeVisible();

    await Promise.all([
      this.page.waitForURL(/checkout/i, { timeout: 60_000 }),
      this.checkoutBtn.click(),
    ]);
  }
}