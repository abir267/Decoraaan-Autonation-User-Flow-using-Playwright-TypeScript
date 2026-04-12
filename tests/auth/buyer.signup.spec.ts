import { test } from "@playwright/test";
import { AuthSignUpPage } from "../../pages/buyer/AuthSignUpPage";
import { generateUser } from "../../utils/dataGenerator";
import { saveUserToGoogleSheet } from "../../utils/googleSheets";
import { upsertAutomationStatus } from "../../utils/automationStatusSheet";
import { now } from "../../utils/timeHelper";

test.describe("Buyer Signup", () => {
  test("Buyer can sign up successfully and save credentials to Google Sheet", async ({ page }) => {
    test.setTimeout(120_000);

    const signUpPage = new AuthSignUpPage(page);
    const user = generateUser();

    try {
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

      console.log("✅ Signup successful");

      await upsertAutomationStatus({
        feature: "Sign up",
        scenario: "Sign up",
        result: "Pass",
        checkedTime: now(),
      });

      try {
        await saveUserToGoogleSheet({
          name: user.fullName,
          email: user.email,
          password: user.password,
          createdTime: new Date().toISOString(),
        });

        console.log("✅ Credentials saved to Google Sheet");
      } catch (sheetError) {
        console.error("❌ Signup succeeded but saving credentials failed:", sheetError);
      }
    } catch (error) {
      console.error("❌ Signup failed:", error);

      await upsertAutomationStatus({
        feature: "Sign up",
        scenario: "Sign up",
        result: "Fail",
        checkedTime: now(),
      });

      throw error;
    }
  });
});