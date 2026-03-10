import { Page, Locator, expect } from "@playwright/test";

export class BuyerHomePage {
  readonly page: Page;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator("#mat-input-0");
  }

  async searchProduct(productQuery: string) {
    await expect(this.searchInput).toBeVisible({ timeout: 15_000 });
    await this.searchInput.fill(productQuery);
  }

  async openSuggestion(suggestionText: string, expectedPdpUrl: string) {
    const suggestionItem = this.page
      .locator("h3", { hasText: suggestionText })
      .first();

    await expect(suggestionItem).toBeVisible({ timeout: 15_000 });

    await Promise.all([
      this.page.waitForURL(expectedPdpUrl, { timeout: 60_000 }),
      suggestionItem.click(),
    ]);

    await expect(this.page).toHaveURL(expectedPdpUrl);
  }
}