import { Page, Locator } from "@playwright/test";
import { BasePage } from "../common/BasePage";
import "dotenv/config";

export class BuyerHomePage extends BasePage {
  readonly profileIcon: Locator;

  constructor(page: Page) {
    super(page);
    // Update later if you have a stable selector (data-testid recommended)
    this.profileIcon = page.locator("header").locator("img, svg").first();
  }

  async openHome() {
    // Because your BUYER_URL is sign-in URL, go to base domain home
    const homeUrl = process.env.BUYER_URL!.replace("/sign-in", "");
    await this.goto(homeUrl);
  }

  async assertLoggedIn() {
    // Simple check: you should NOT be on sign-in page
    await this.waitForUrlContains("decoraan");
  }
}
