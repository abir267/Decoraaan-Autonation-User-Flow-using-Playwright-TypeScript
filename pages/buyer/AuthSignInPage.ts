import { Page, Locator, expect } from "@playwright/test";

export class AuthSignInPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator("#username");
    this.passwordInput = page.locator("#password");
    this.signInButton = page.locator("button.submit");
  }

  async gotoSignIn() {
    if (!process.env.AUTH_SIGNIN_URL) {
      throw new Error("AUTH_SIGNIN_URL is missing in .env");
    }

    await this.page.goto(process.env.AUTH_SIGNIN_URL, {
      waitUntil: "domcontentloaded",
    });
  }

  async signInAsBuyer() {
    if (!process.env.BUYER_EMAIL) {
      throw new Error("BUYER_EMAIL is missing in .env");
    }

    if (!process.env.BUYER_PASSWORD) {
      throw new Error("BUYER_PASSWORD is missing in .env");
    }

    await this.usernameInput.fill(process.env.BUYER_EMAIL);
    await this.passwordInput.fill(process.env.BUYER_PASSWORD);

    await Promise.all([
      this.page.waitForURL(
        (url) => !url.toString().includes("/sign-in"),
        { timeout: 60_000 }
      ),
      this.signInButton.click(),
    ]);
  }

  async verifyBuyerRedirect() {
    if (!process.env.BUYER_APP_URL) {
      throw new Error("BUYER_APP_URL is missing in .env");
    }

    const buyerHost = new URL(process.env.BUYER_APP_URL).host;
    await expect(this.page).toHaveURL(
      new RegExp(buyerHost.replace(/\./g, "\\."))
    );
  }
}