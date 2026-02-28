import { Page, expect } from "@playwright/test";
import { CartPage } from "./CartPage";
import { CheckoutPage } from "./CheckoutPage";

export class CheckoutFlow {
  constructor(private page: Page) {}

  async completeCODOrder() {
    const cart = new CartPage(this.page);
    const checkout = new CheckoutPage(this.page);

    await cart.proceedToCheckout();

    // If location step exists
    const locationBtn = this.page.getByRole("button", { name: /confirm|continue/i }).first();
    if (await locationBtn.isVisible().catch(() => false)) {
      await locationBtn.click();
    }

    // Select COD if exists
    const cod = this.page.getByText(/cash on delivery|cod/i);
    if (await cod.isVisible().catch(() => false)) {
      await cod.click();
    }

    await checkout.placeOrder();

    // Success validation
    await expect(
      this.page.getByText(/order|confirmed|success/i)
    ).toBeVisible({ timeout: 20000 });
  }
}