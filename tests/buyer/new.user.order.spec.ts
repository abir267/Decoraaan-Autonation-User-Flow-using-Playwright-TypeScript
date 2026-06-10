import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { AuthSignUpPage } from "../../pages/buyer/AuthSignUpPage";
import { BuyerHomePage } from "../../pages/buyer/BuyerHomePage";
import { PdpPage } from "../../pages/buyer/PdpPage";
import { CheckoutPage } from "../../pages/buyer/CheckoutPage";
import { generateUser } from "../../utils/dataGenerator";
import { saveUserToGoogleSheet } from "../../utils/googleSheets";
import { saveLatestOrder } from "../../utils/orderStorage";
import { upsertAutomationStatus } from "../../utils/automationStatusSheet";
import { now } from "../../utils/timeHelper";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });

test.describe("New User E2E: Signup → Address → Order → History", () => {
  test("New user signs up, adds address and places an order", async ({ page }) => {
    test.setTimeout(240_000);

    const user = generateUser();
    const signUpPage = new AuthSignUpPage(page);
    const checkoutPage = new CheckoutPage(page);

    const productQuery = process.env.BUYER_SEARCH_TERM || "Ikea Chair 891";
    const suggestionText = process.env.BUYER_SUGGESTION_TEXT || "Ikea Chair 891";
    const expectedPdpUrl = process.env.BUYER_PDP_URL || "";
    const randomPhone = "01" + Math.floor(700000000 + Math.random() * 99999999).toString();

    let orderNumber = "";

    try {
      // ── 1) Sign Up ──────────────────────────────────────────────────────────
      await page.goto(process.env.AUTH_SIGNIN_URL!.replace("sign-in", "sign-up"), {
        waitUntil: "domcontentloaded",
      });

      await signUpPage.selectBangladesh();
      await signUpPage.fillSignupForm(user.email, user.firstName, user.lastName, user.password);
      await signUpPage.clickSignUp();
      await signUpPage.enterOtp("123456");
      await signUpPage.clickVerify();

      const buyerHost = new URL(process.env.BUYER_APP_URL!).host;
      await expect(page).toHaveURL(new RegExp(buyerHost.replace(/\./g, "\\.")), { timeout: 60000 });

      console.log(`✅ Signup successful — ${user.email}`);

      await upsertAutomationStatus({
        feature: "New User Sign up",
        scenario: "Sign up",
        result: "Pass",
        checkedTime: now(),
      });

      // ── 2) Save user to Google Sheet ────────────────────────────────────────
      try {
        await saveUserToGoogleSheet({
          name: user.fullName,
          email: user.email,
          password: user.password,
          createdTime: new Date().toISOString(),
        });
        console.log("✅ Credentials saved to Google Sheet");
      } catch (e) {
        console.warn("⚠️ Sheet save failed:", e);
      }

      // ── 3) Search & open PDP ────────────────────────────────────────────────
      const buyerHomePage = new BuyerHomePage(page);
      await buyerHomePage.searchProduct(productQuery);
      await buyerHomePage.openSuggestion(suggestionText, expectedPdpUrl);

      console.log("✅ PDP opened successfully");

      await upsertAutomationStatus({
        feature: "New User Product Add",
        scenario: "Search With Keyword",
        result: "Pass",
        checkedTime: now(),
      });

      // ── 4) Add to Cart ──────────────────────────────────────────────────────
      const pdpPage = new PdpPage(page);
      await pdpPage.addToCart();
      console.log("✅ Clicked Add to Cart");

      await upsertAutomationStatus({
        feature: "New User Add to cart",
        scenario: "Add to cart",
        result: "Pass",
        checkedTime: now(),
      });

      await page.waitForTimeout(2000);

      // ── 5) Go to Cart ───────────────────────────────────────────────────────
      const goToCartBtn = page.getByRole("button", { name: /go to cart/i });
      await expect(goToCartBtn).toBeVisible({ timeout: 10000 });
      await Promise.all([
        page.waitForURL(/\/cart/i, { timeout: 60000 }),
        goToCartBtn.click(),
      ]);
      console.log("✅ Navigated to Cart page");

      await upsertAutomationStatus({
        feature: "New User Go to cart",
        scenario: "Go to cart",
        result: "Pass",
        checkedTime: now(),
      });

      // ── 6) Checkout ─────────────────────────────────────────────────────────
      const checkoutBtn = page.getByRole("button", { name: /checkout/i });
      await expect(checkoutBtn).toBeVisible({ timeout: 10000 });
      await Promise.all([
        page.waitForURL(/checkout/i, { timeout: 60000 }),
        checkoutBtn.click(),
      ]);
      console.log("✅ Navigated to Checkout page");

      await upsertAutomationStatus({
        feature: "New User Confirm",
        scenario: "Confirm",
        result: "Pass",
        checkedTime: now(),
      });

      // ── 7) Add phone number ─────────────────────────────────────────────────
      const addPhoneBtn = page.locator('img[src*="add-green.svg"]').first();
      await addPhoneBtn.click();

      const phoneInput = page.locator('input[placeholder="01XXXXXXXXX"][autocomplete="phone"]');
      await phoneInput.waitFor({ state: "visible", timeout: 10000 });
      await phoneInput.fill(randomPhone);

      const savePhoneBtn = page.locator('h5:has-text("Save")').first();
      await savePhoneBtn.click();

      // OTP verification after phone number save
      await page.waitForSelector('ssl-otp-verification', { timeout: 15000 });

      const otpInputs = page.locator('ssl-otp-verification input[placeholder="0"]');
      await expect(otpInputs.first()).toBeVisible({ timeout: 10000 });

      const digits = "123456".split("");
      for (let i = 0; i < 6; i++) {
        await otpInputs.nth(i).fill(digits[i]);
      }

      await page.locator('ssl-otp-verification button:has-text("Verify")').click();
      console.log("✅ Phone OTP verified");
      await page.waitForTimeout(1000);

      // ── 8) Add shipping address ─────────────────────────────────────────────
      const addNewAddressBtn = page.locator('h3:has-text("Add new address")').first();
      await addNewAddressBtn.click();
      await page.waitForTimeout(1000);

      // Country dropdown
      const countryDropdown = page.locator('span.mat-mdc-select-placeholder:has-text("Select A Country")').first();
      await countryDropdown.click();
      await page.locator('mat-option span.mdc-list-item__primary-text:has-text("Bangladesh")').first().click();
      await page.waitForTimeout(500);

      // State dropdown
      const stateDropdown = page.locator('span.mat-mdc-select-placeholder:has-text("Select A State")').first();
      await stateDropdown.click();
      await page.locator('mat-option span.mdc-list-item__primary-text:has-text("Dhaka")').first().click();
      await page.waitForTimeout(500);

      // City dropdown
      const cityDropdown = page.locator('span.mat-mdc-select-placeholder:has-text("Select A City")').first();
      await cityDropdown.click();
      await page.locator('mat-option span.mdc-list-item__primary-text:has-text("Dhaka Zila")').first().click();
      await page.waitForTimeout(500);

      // Area dropdown
      const areaDropdown = page.locator('span.mat-mdc-select-placeholder:has-text("Select A Area")').first();
      await areaDropdown.click();
      await page.locator('mat-option span.mdc-list-item__primary-text:has-text("Badda Thana")').first().click();
      await page.waitForTimeout(500);

      // Address textarea
      const addressInput = page.locator('textarea[placeholder="Address"]');
      await addressInput.fill("Woodland Latapata, Dhaka");

      // Postal Code
      const postalInput = page.locator('input[placeholder="Postal Code"]');
      await postalInput.fill("1212");

      // Phone inside address form
      const addressPhoneInput = page.locator('input[placeholder="01XXXXXXXXX"][autocomplete="contactNo"]');
      await addressPhoneInput.fill(randomPhone);



// Save as default checkbox
const defaultCheckbox = page.locator('#mat-mdc-checkbox-2-input');
if (!(await defaultCheckbox.isChecked())) {
  await defaultCheckbox.check({ force: true });
}

// Save address button
await page.locator('button.bg-palette-primary:has-text("Save")').click();

console.log("✅ Shipping address saved");
await page.waitForTimeout(1500);

await upsertAutomationStatus({
  feature: "New User Address",
  scenario: "Add shipping address",
  result: "Pass",
  checkedTime: now(),
});

// ── 9) Billing same as shipping ─────────────────────────────────────────
const billingCheckbox = page.locator('#mat-mdc-checkbox-1-input');
if (!(await billingCheckbox.isChecked())) {
  await billingCheckbox.check({ force: true });
}
console.log("✅ Billing same as shipping checked");
await page.waitForTimeout(500);

      // ── 10) Next to payment ─────────────────────────────────────────────────
      await checkoutPage.clickNextToPayment();
      console.log("✅ Moved to Payment page");

      // ── 11) Cash on delivery ────────────────────────────────────────────────
      await checkoutPage.selectCashOnDelivery();
      console.log("✅ Selected Cash on Delivery");

      await upsertAutomationStatus({
        feature: "New User Cash on delivery",
        scenario: "Cash on delivery",
        result: "Pass",
        checkedTime: now(),
      });

      // ── 12) Confirm order — intercept API ───────────────────────────────────
      let orderSellerItemId = "";

      page.on("response", async (res) => {
        if (res.url().includes("/checkout/order-place") && res.status() === 200) {
          try {
            const body = await res.json();
            orderSellerItemId = body.data.content.orderId;
            orderNumber = body.data.content.orderNumber;
            saveLatestOrder(orderNumber, orderSellerItemId);
            console.log(`✅ Order saved — Number: ${orderNumber} | SellerItemId: ${orderSellerItemId}`);
          } catch (e) {
            console.error("❌ Failed to parse order-place response", e);
          }
        }
      });

      await checkoutPage.clickConfirm();
      console.log("✅ Clicked Confirm");
      await page.waitForTimeout(3000);

      // ── 13) Verify order placed ─────────────────────────────────────────────
      await checkoutPage.verifyOrderPlacedSuccessfully();
      console.log("✅ Order placed successfully");

      await upsertAutomationStatus({
        feature: "New User Order place",
        scenario: "Order place",
        result: "Pass",
        checkedTime: now(),
      });

      // ── 14) My Account → Order History ──────────────────────────────────────
      await page.waitForTimeout(5000);
      await checkoutPage.goToMyAccount();
      console.log("✅ Clicked My Account");

      await page.waitForTimeout(3000);

      const summaryPromise = page.waitForResponse(
        (res) => res.url().includes("/buyer/api/orders/summary") && res.status() === 200,
        { timeout: 15000 }
      );

      await checkoutPage.openOrderHistory();

      try {
        const summaryResponse = await summaryPromise;
        const summaryBody = await summaryResponse.text();
        const summaryData = JSON.parse(summaryBody);
        const realOrderSellerItemId = summaryData?.data?.content?.[0]?.orderItems?.[0]?.id;

        if (realOrderSellerItemId) {
          saveLatestOrder(orderNumber, realOrderSellerItemId);
          console.log(`✅ Updated orderSellerItemId from summary: ${realOrderSellerItemId}`);
        }
      } catch (e) {
        console.warn(`⚠️ Failed to intercept summary response:`, e);
      }

      console.log("✅ Order History page opened successfully");

      await upsertAutomationStatus({
        feature: "New User Order history",
        scenario: "Order history",
        result: "Pass",
        checkedTime: now(),
      });

    } catch (error: any) {
      console.error("❌ New user order flow failed:", error);

      await upsertAutomationStatus({
        feature: "New User Order place",
        scenario: "Order place",
        result: "Fail",
        checkedTime: now(),
      });

      throw error;
    }
  });
});