import { Page, Locator } from "@playwright/test";
import { BasePage } from "../common/BasePage";

export class CheckoutPage extends BasePage {
  readonly placeOrderBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.placeOrderBtn = page.getByRole("button", { name: /place order|place order now|order now|place order/i }).first();
  }

  async placeOrder() {
    await this.placeOrderBtn.click();
  }
}