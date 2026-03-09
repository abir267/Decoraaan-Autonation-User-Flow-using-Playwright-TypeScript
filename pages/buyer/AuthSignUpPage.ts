import { expect, Locator, Page } from "@playwright/test";

export class AuthSignUpPage {
  readonly page: Page;

  readonly countryDropdown: Locator;
  readonly bangladeshOption: Locator;

  readonly emailInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly signUpButton: Locator;

  readonly otp1: Locator;
  readonly otp2: Locator;
  readonly otp3: Locator;
  readonly otp4: Locator;
  readonly otp5: Locator;
  readonly otp6: Locator;
  readonly verifyButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.countryDropdown = page.locator(".custom-select .select-selected");
    this.bangladeshOption = page.locator(".select-items div", {
      hasText: "Bangladesh",
    });

    this.emailInput = page.locator("#username");
    this.firstNameInput = page.locator("#firstName");
    this.lastNameInput = page.locator("#lastName");
    this.passwordInput = page.locator("#password");
    this.confirmPasswordInput = page.locator("#confirmpassword");
    this.signUpButton = page.locator('button[type="submit"].submit');

    this.otp1 = page.locator('input[formcontrolname="otpDigitOne"]');
    this.otp2 = page.locator('input[formcontrolname="otpDigitTwo"]');
    this.otp3 = page.locator('input[formcontrolname="otpDigitThree"]');
    this.otp4 = page.locator('input[formcontrolname="otpDigitFour"]');
    this.otp5 = page.locator('input[formcontrolname="otpDigitFive"]');
    this.otp6 = page.locator('input[formcontrolname="otpDigitSix"]');

    this.verifyButton = page.locator("button.submit.mt-4");
  }

  async goto() {
    await this.page.goto("https://auth.decoraan.com/sign-up", {
      waitUntil: "domcontentloaded",
    });
  }

  async selectBangladesh() {
    await this.countryDropdown.click();
    await this.bangladeshOption.click();
  }

  async fillSignupForm(
    email: string,
    firstName: string,
    lastName: string,
    password: string
  ) {
    await this.emailInput.fill(email);
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
  }

  async clickSignUp() {
    await this.signUpButton.click();
  }

  async enterOtp(otp = "123456") {
    const digits = otp.split("");

    await this.otp1.fill(digits[0]);
    await this.otp2.fill(digits[1]);
    await this.otp3.fill(digits[2]);
    await this.otp4.fill(digits[3]);
    await this.otp5.fill(digits[4]);
    await this.otp6.fill(digits[5]);
  }

  async clickVerify() {
    await this.verifyButton.click();
  }

  async verifySignupSuccess() {
    await expect(this.page).toHaveURL("https://pre-live.decoraan.com/");
  }
}