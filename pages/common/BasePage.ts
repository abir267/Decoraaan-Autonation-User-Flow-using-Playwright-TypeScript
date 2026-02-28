import { Page, expect, Locator } from "@playwright/test";

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(url: string) {
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
  }

  async click(locator: Locator) {
    await locator.click();
  }

  async type(locator: Locator, text: string) {
    await locator.fill(text);
  }

  async expectVisible(locator: Locator) {
    await expect(locator).toBeVisible();
  }

  async waitForUrlContains(text: string) {
    await expect(this.page).toHaveURL(new RegExp(text));
  }
}