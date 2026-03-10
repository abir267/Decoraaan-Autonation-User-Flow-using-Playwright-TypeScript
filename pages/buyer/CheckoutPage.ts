import { Page, Locator, expect } from "@playwright/test";

export class CheckoutPage {
  readonly page: Page;
  readonly billingText: Locator;
  readonly nextBtn: Locator;
  readonly codRadio: Locator;
  readonly confirmBtn: Locator;
  readonly thankYouHeading: Locator;
  readonly orderNumberText: Locator;
  readonly myAccountBtn: Locator;
  readonly orderHistoryBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.billingText = page
      .locator("text=/billing address same as shipping address/i")
      .first();

    this.nextBtn = page.getByRole("button", { name: /^next$/i });

    this.codRadio = page.getByRole("radio", {
      name: /cash on delivery/i,
    });

    this.confirmBtn = page.getByRole("button", { name: /confirm/i });

    this.thankYouHeading = page.getByRole("heading", {
      name: /thank you for your order/i,
    });

    this.orderNumberText = page.locator("text=/your order #|order #/i").first();

    this.myAccountBtn = page.getByRole("button", { name: /my account/i });

    this.orderHistoryBtn = page.getByRole("link", {
      name: /order history/i,
    });
  }

  async selectBillingSameAsShipping() {
    await expect(this.billingText).toBeVisible();
    await this.billingText.click({ force: true });

    const billingCheckbox = this.billingText
      .locator("xpath=ancestor::div[1]//input[@type='checkbox']")
      .first();

    if (!(await billingCheckbox.isChecked())) {
      await billingCheckbox.check({ force: true });
    }

    await expect(billingCheckbox).toBeChecked();
  }

  async clickNextToPayment() {
    await this.nextBtn.scrollIntoViewIfNeeded();
    await this.nextBtn.click();

    await expect(
      this.page.getByRole("heading", { name: /^payment method$/i }).first()
    ).toBeVisible({ timeout: 60_000 });
  }

  async selectCashOnDelivery() {
    await this.page.mouse.wheel(0, -500);

    await expect(this.codRadio).toBeVisible();

    if (!(await this.codRadio.isChecked())) {
      await this.codRadio.check({ force: true });
    }

    await expect(this.codRadio).toBeChecked();
  }

  async clickConfirm() {
    await expect(this.confirmBtn).toBeVisible();
    await this.confirmBtn.click();
  }

  async verifyOrderPlacedSuccessfully() {
    await this.page.mouse.wheel(0, -1000);

    await expect(this.thankYouHeading).toBeVisible({ timeout: 60_000 });
    await expect(this.orderNumberText).toBeVisible({ timeout: 60_000 });
  }

  async getOrderId(): Promise<string> {
    const orderText = await this.orderNumberText.innerText();

    const match = orderText.match(/#([\d-]+)/);

    if (!match || !match[1]) {
      throw new Error(`Order ID not found in text: ${orderText}`);
    }

    return match[1];
  }

  async verifyOrderPlacedSuccessfullyAndGetOrderId(): Promise<string> {
    await this.verifyOrderPlacedSuccessfully();
    return await this.getOrderId();
  }

  async goToMyAccount() {
    await expect(this.myAccountBtn).toBeVisible({ timeout: 10_000 });
    await this.myAccountBtn.click();
  }

  async openOrderHistory() {
    await expect(this.orderHistoryBtn).toBeVisible({ timeout: 10_000 });
    await this.orderHistoryBtn.click();

    await this.page.waitForURL(/\/buyer\/order-history/, { timeout: 15_000 });
    await expect(this.page).toHaveURL(/\/buyer\/order-history/);
  }
}