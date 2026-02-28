import { Page, Locator } from "@playwright/test";
import { BasePage } from "../common/BasePage";

export class CartPage extends BasePage {
  readonly checkoutBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.checkoutBtn = page.getByRole("button", { name: /checkout/i });
  }

  async proceedToCheckout() {
    await this.checkoutBtn.click();
  }
}