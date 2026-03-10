import { Page, Locator, expect } from "@playwright/test";

export class PdpPage {
  readonly page: Page;
  readonly addToCartBtn: Locator;
  readonly goToCartBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addToCartBtn = page.getByRole("button", { name: /add to cart/i });
    this.goToCartBtn = page.getByRole("button", { name: /go to cart/i });
  }

  async addToCart() {
    await expect(this.addToCartBtn).toBeVisible();
    await this.addToCartBtn.click();
    await this.page.waitForTimeout(2000);
  }

  async goToCart() {
    await expect(this.goToCartBtn).toBeVisible();

    await Promise.all([
      this.page.waitForURL(/\/cart/i, { timeout: 60_000 }),
      this.goToCartBtn.click(),
    ]);
  }
}