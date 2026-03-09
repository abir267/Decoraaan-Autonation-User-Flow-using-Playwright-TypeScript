import { test } from "@playwright/test";
import { AuthSignUpPage } from "../../pages/buyer/AuthSignUpPage";

import { generateUser } from "../../utils/dataGenerator";
import { saveUserToGoogleSheet } from "../../utils/googleSheets";

test.describe("Buyer Signup", () => {
  test("Buyer can sign up successfully and save credentials to Google Sheet", async ({ page }) => {
    test.setTimeout(120_000);

    const signUpPage = new AuthSignUpPage(page);
    const user = generateUser();

    await signUpPage.goto();
    await signUpPage.selectBangladesh();
    await signUpPage.fillSignupForm(
      user.email,
      user.firstName,
      user.lastName,
      user.password
    );
    await signUpPage.clickSignUp();

    await signUpPage.enterOtp("123456");
    await signUpPage.clickVerify();
    await signUpPage.verifySignupSuccess();

    await saveUserToGoogleSheet({
      name: user.fullName,
      email: user.email,
      password: user.password,
      createdTime: new Date().toISOString(),
    });
  });
});