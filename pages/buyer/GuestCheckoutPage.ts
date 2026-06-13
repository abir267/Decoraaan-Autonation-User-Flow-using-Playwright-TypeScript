import { Page, Locator, expect } from "@playwright/test";

export class GuestCheckoutPage {
readonly page: Page;
readonly guestCheckoutBtn: Locator;
readonly addPhoneBtn: Locator;
readonly phoneInput: Locator;
readonly savePhoneBtn: Locator;
readonly addNewAddressBtn: Locator;
readonly addressInput: Locator;
readonly postalInput: Locator;
readonly addressPhoneInput: Locator;
readonly saveAddressBtn: Locator;
readonly billingCheckbox: Locator;

constructor(page: Page) {
    this.page = page;

    this.guestCheckoutBtn = page.locator('button:has(h1:has-text("Checkout As Guest"))');
    this.addPhoneBtn = page.locator('img[src*="add-green.svg"]').first();
    this.phoneInput = page.locator('input[placeholder="01XXXXXXXXX"][autocomplete="phone"]');
    this.savePhoneBtn = page.locator('h5:has-text("Save")').first();
    this.addNewAddressBtn = page.locator('h3:has-text("Add new address")').first();
    this.addressInput = page.locator('textarea[placeholder="Address"]');
    this.postalInput = page.locator('input[placeholder="Postal Code"]');
    this.addressPhoneInput = page.locator('input[placeholder="01XXXXXXXXX"][autocomplete="contactNo"]');
    this.saveAddressBtn = page.locator('button.bg-palette-primary:has-text("Save")');
    this.billingCheckbox = page.locator('#mat-mdc-checkbox-1-input');
  }

  async clickGuestCheckout() {
    await expect(this.guestCheckoutBtn).toBeVisible({ timeout: 10000 });
    await Promise.all([
      this.page.waitForURL(/checkout/i, { timeout: 60000 }),
      this.guestCheckoutBtn.click(),
    ]);
  }

  async addPhoneNumber(phone: string) {
    await this.addPhoneBtn.click();
    await this.phoneInput.waitFor({ state: "visible", timeout: 10000 });
    await this.phoneInput.fill(phone);
    await this.savePhoneBtn.click();

    // OTP verification
    await this.page.waitForSelector('ssl-otp-verification', { timeout: 15000 });
    const otpInputs = this.page.locator('ssl-otp-verification input[placeholder="0"]');
    await expect(otpInputs.first()).toBeVisible({ timeout: 10000 });

    const digits = "123456".split("");
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill(digits[i]);
    }

    await this.page.locator('ssl-otp-verification button:has-text("Verify")').click();
    await this.page.waitForTimeout(1000);
  }

  async addShippingAddress(phone: string) {
    await this.addNewAddressBtn.click();
    await this.page.waitForTimeout(1000);

    // Country
    await this.page.locator('span.mat-mdc-select-placeholder:has-text("Select A Country")').first().click();
    await this.page.locator('mat-option span.mdc-list-item__primary-text:has-text("Bangladesh")').first().click();
    await this.page.waitForTimeout(500);

    // State
    await this.page.locator('span.mat-mdc-select-placeholder:has-text("Select A State")').first().click();
    await this.page.locator('mat-option span.mdc-list-item__primary-text:has-text("Dhaka")').first().click();
    await this.page.waitForTimeout(500);

    // City
    await this.page.locator('span.mat-mdc-select-placeholder:has-text("Select A City")').first().click();
    await this.page.locator('mat-option span.mdc-list-item__primary-text:has-text("Dhaka Zila")').first().click();
    await this.page.waitForTimeout(500);

    // Area
    await this.page.locator('span.mat-mdc-select-placeholder:has-text("Select A Area")').first().click();
    await this.page.locator('mat-option span.mdc-list-item__primary-text:has-text("Badda Thana")').first().click();
    await this.page.waitForTimeout(500);

    await this.addressInput.fill("Woodland Latapata, Dhaka");
    await this.postalInput.fill("1212");
    await this.addressPhoneInput.fill(phone);

    // Save as default checkbox
    const defaultCheckbox = this.page.locator('#mat-mdc-checkbox-2-input');
    if (!(await defaultCheckbox.isChecked())) {
      await defaultCheckbox.check({ force: true });
    }

    await this.saveAddressBtn.click();
    await this.page.waitForTimeout(1500);
  }

  async selectBillingSameAsShipping() {
    if (!(await this.billingCheckbox.isChecked())) {
      await this.billingCheckbox.check({ force: true });
    }
    await this.page.waitForTimeout(500);
  }
}