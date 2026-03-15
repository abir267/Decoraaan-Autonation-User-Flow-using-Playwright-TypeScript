import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { upsertAutomationStatus } from "../../utils/automationStatusSheet";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

function now() {
  return new Date().toLocaleString();
}

test.describe("Buyer E2E: Login → PDP → Cart → Checkout → Payment", () => {
  test("Buyer places order up to Confirm step", async ({ page }) => {
    test.setTimeout(180000);

    const productQuery = "Chair 0099";
    const suggestionText = "Chair 0099 [Product For Automation]";
    const expectedPdpUrl =
      "https://pre-live.decoraan.com/pdp/chair-0099-product-for-automation-699e74c742b06051854e7742";

    try {
      // 1) Sign In
      await page.goto(process.env.AUTH_SIGNIN_URL!, {
        waitUntil: "domcontentloaded",
      });

      await page.locator("#username").fill(process.env.BUYER_EMAIL!);
      await page.locator("#password").fill(process.env.BUYER_PASSWORD!);

      await Promise.all([
        page.waitForURL((url) => !url.toString().includes("/sign-in"), {
          timeout: 60000,
        }),
        page.locator("button.submit").click(),
      ]);

      const buyerHost = new URL(process.env.BUYER_APP_URL!).host;
      await expect(page).toHaveURL(
        new RegExp(buyerHost.replace(/\./g, "\\."))
      );

      console.log("✅ Sign in successfully");

      await upsertAutomationStatus({
        feature: "Sign In",
        scenario: "Sign In",
        result: "Pass",
        checkedTime: now(),
      });

      // 2) Search With Keyword
      const searchInput = page.locator("#mat-input-0");
      await expect(searchInput).toBeVisible({ timeout: 15000 });
      await searchInput.fill(productQuery);

      const suggestionItem = page
        .locator("h3", { hasText: suggestionText })
        .first();

      await expect(suggestionItem).toBeVisible({ timeout: 15000 });

      await Promise.all([
        page.waitForURL(expectedPdpUrl, { timeout: 60000 }),
        suggestionItem.click(),
      ]);

      await expect(page).toHaveURL(expectedPdpUrl);
      console.log("✅ PDP opened successfully");

      await upsertAutomationStatus({
        feature: "Product Add",
        scenario: "Search With Keyword",
        result: "Pass",
        checkedTime: now(),
      });

      // 3) Add to cart
      const addToCartBtn = page.getByRole("button", { name: /add to cart/i });
      await expect(addToCartBtn).toBeVisible({ timeout: 10000 });
      await addToCartBtn.click();
      console.log("✅ Clicked Add to Cart");

      await upsertAutomationStatus({
        feature: "Add to cart",
        scenario: "Add to cart",
        result: "Pass",
        checkedTime: now(),
      });

      await page.waitForTimeout(2000);

      // 4) Go to cart
      const goToCartBtn = page.getByRole("button", { name: /go to cart/i });
      await expect(goToCartBtn).toBeVisible({ timeout: 10000 });

      await Promise.all([
        page.waitForURL(/\/cart/i, { timeout: 60000 }),
        goToCartBtn.click(),
      ]);

      console.log("✅ Navigated to Cart page");

      await upsertAutomationStatus({
        feature: "Go to cart",
        scenario: "Go to cart",
        result: "Pass",
        checkedTime: now(),
      });

      // 5) Checkout / Confirm
      const checkoutBtn = page.getByRole("button", { name: /checkout/i });
      await expect(checkoutBtn).toBeVisible({ timeout: 10000 });

      await Promise.all([
        page.waitForURL(/checkout/i, { timeout: 60000 }),
        checkoutBtn.click(),
      ]);

      console.log("✅ Navigated to Checkout page");

      await upsertAutomationStatus({
        feature: "Confirm",
        scenario: "Confirm",
        result: "Pass",
        checkedTime: now(),
      });

      // 6) Billing same as shipping
      const billingText = page
        .locator("text=/billing address same as shipping address/i")
        .first();
      await expect(billingText).toBeVisible({ timeout: 10000 });
      await billingText.click({ force: true });

      const billingCheckbox = billingText
        .locator("xpath=ancestor::div[1]//input[@type='checkbox']")
        .first();

      if (!(await billingCheckbox.isChecked())) {
        await billingCheckbox.check({ force: true });
      }

      await expect(billingCheckbox).toBeChecked();
      console.log("✅ Checked Billing same as Shipping");

      // 7) Next to payment
      const nextBtn = page.getByRole("button", { name: /^next$/i });
      await nextBtn.scrollIntoViewIfNeeded();
      await nextBtn.click();

      await expect(
        page.getByRole("heading", { name: /^payment method$/i }).first()
      ).toBeVisible({ timeout: 60000 });

      console.log("✅ Moved to Payment page");

      // 8) Cash on delivery
      await page.mouse.wheel(0, -500);

      const codRadio = page.getByRole("radio", { name: /cash on delivery/i });
      await expect(codRadio).toBeVisible({ timeout: 10000 });

      if (!(await codRadio.isChecked())) {
        await codRadio.check({ force: true });
      }

      await expect(codRadio).toBeChecked();
      console.log("✅ Selected Cash on Delivery");

      await upsertAutomationStatus({
        feature: "Cash on delivery",
        scenario: "Cash on delivery",
        result: "Pass",
        checkedTime: now(),
      });

      // 9) Confirm Order
      const confirmBtn = page.getByRole("button", { name: /confirm/i });
      await expect(confirmBtn).toBeVisible({ timeout: 10000 });
      await confirmBtn.click();

      console.log("✅ Clicked Confirm");

      // 10) Order place
      await page.mouse.wheel(0, -1000);

      const thankYouHeading = page.getByRole("heading", {
        name: /thank you for your order/i,
      });

      await expect(thankYouHeading).toBeVisible({ timeout: 60000 });
      console.log("✅ Order placed successfully");

      await upsertAutomationStatus({
        feature: "Order place",
        scenario: "Order place",
        result: "Pass",
        checkedTime: now(),
      });

      // 11) Confirm Order ID
      await expect(page.locator("text=/order #/i")).toBeVisible({
        timeout: 60000,
      });

      console.log("✅ Order number is visible");

      await upsertAutomationStatus({
        feature: "Confirm Order ID",
        scenario: "Confirm Order ID",
        result: "Pass",
        checkedTime: now(),
      });

      await page.waitForTimeout(5000);

      // 12) My account
      const myAccountBtn = page.getByRole("button", { name: /my account/i });
      await expect(myAccountBtn).toBeVisible({ timeout: 10000 });
      await myAccountBtn.click();
      console.log("✅ Clicked My Account");

      await upsertAutomationStatus({
        feature: "My account",
        scenario: "My account",
        result: "Pass",
        checkedTime: now(),
      });

      await page.waitForTimeout(3000);

      // 13) Order history
      const orderHistoryBtn = page.getByRole("link", { name: /order history/i });
      await expect(orderHistoryBtn).toBeVisible({ timeout: 10000 });
      await orderHistoryBtn.click();
      console.log("✅ Clicked Order History");

      await page.waitForURL(/\/buyer\/order-history/, { timeout: 15000 });
      await expect(page).toHaveURL(/\/buyer\/order-history/);
      console.log("✅ Order History page opened successfully");

      await upsertAutomationStatus({
        feature: "Order history",
        scenario: "Order history",
        result: "Pass",
        checkedTime: now(),
      });

      await page.waitForTimeout(5000);
    } catch (error: any) {
      console.error("❌ Buyer order flow failed:", error);

      await upsertAutomationStatus({
        feature: "Order place",
        scenario: "Order place",
        result: "Fail",
        checkedTime: now(),
      });

      throw error;
    }
  });
});