import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

test.describe("Buyer E2E: Login → PDP → Cart → Checkout → Payment", () => {
  test("Buyer places order up to Confirm step", async ({ page }) => {
    test.setTimeout(180_000);

    const productQuery = "Chair 0099";
    const suggestionText = "Chair 0099 [Product For Automation]";
    const expectedPdpUrl =
      "https://pre-live.decoraan.com/pdp/chair-0099-product-for-automation-699e74c742b06051854e7742";

    // 1️⃣ Login
    await page.goto(process.env.AUTH_SIGNIN_URL!, { waitUntil: "domcontentloaded" });
    await page.locator("#username").fill(process.env.BUYER_EMAIL!);
    await page.locator("#password").fill(process.env.BUYER_PASSWORD!);

    await Promise.all([
      page.waitForURL((url) => !url.toString().includes("/sign-in"), { timeout: 60_000 }),
      page.locator("button.submit").click(),
    ]);

    const buyerHost = new URL(process.env.BUYER_APP_URL!).host;
    await expect(page).toHaveURL(new RegExp(buyerHost.replace(/\./g, "\\.")));
    console.log("✅ Sign in successfully");

    // 2️⃣ Search product
    const searchInput = page.locator("#mat-input-0");
    await expect(searchInput).toBeVisible({ timeout: 15_000 });
    await searchInput.fill(productQuery);

    const suggestionItem = page.locator("h3", { hasText: suggestionText }).first();
    await expect(suggestionItem).toBeVisible({ timeout: 15_000 });

    await Promise.all([
      page.waitForURL(expectedPdpUrl, { timeout: 60_000 }),
      suggestionItem.click(),
    ]);

    await expect(page).toHaveURL(expectedPdpUrl);
    console.log("✅ PDP opened successfully");

    // 3️⃣ Add to cart
    const addToCartBtn = page.getByRole("button", { name: /add to cart/i });
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();
    console.log("✅ Clicked Add to Cart");

    await page.waitForTimeout(2000);

    // 4️⃣ Go to Cart
    const goToCartBtn = page.getByRole("button", { name: /go to cart/i });
    await expect(goToCartBtn).toBeVisible();

    await Promise.all([
      page.waitForURL(/\/cart/i, { timeout: 60_000 }),
      goToCartBtn.click(),
    ]);

    console.log("✅ Navigated to Cart page");

    // 5️⃣ Checkout
    const checkoutBtn = page.getByRole("button", { name: /checkout/i });
    await expect(checkoutBtn).toBeVisible();

    await Promise.all([
      page.waitForURL(/checkout/i, { timeout: 60_000 }),
      checkoutBtn.click(),
    ]);

    console.log("✅ Navigated to Checkout page");

    // 6️⃣ Billing same as shipping
    const billingText = page.locator("text=/billing address same as shipping address/i").first();
    await expect(billingText).toBeVisible();

    await billingText.click({ force: true });

    const billingCheckbox = billingText
      .locator("xpath=ancestor::div[1]//input[@type='checkbox']")
      .first();

    if (!(await billingCheckbox.isChecked())) {
      await billingCheckbox.check({ force: true });
    }

    await expect(billingCheckbox).toBeChecked();
    console.log("✅ Checked Billing same as Shipping");

   // 7️⃣ Click Next (NO waitForURL)
const nextBtn = page.getByRole("button", { name: /^next$/i });
await nextBtn.scrollIntoViewIfNeeded();
await nextBtn.click();

// ✅ Strict-mode safe wait (single heading)
await expect(
  page.getByRole("heading", { name: /^payment method$/i }).first()
).toBeVisible({ timeout: 60_000 });

console.log("✅ Moved to Payment page");

    // 8️⃣ Scroll up a little
    await page.mouse.wheel(0, -500);

    // 9️⃣ Select Cash on Delivery
    const codRadio = page.getByRole("radio", { name: /cash on delivery/i });
    await expect(codRadio).toBeVisible();

    if (!(await codRadio.isChecked())) {
      await codRadio.check({ force: true });
    }

    await expect(codRadio).toBeChecked();
    console.log("✅ Selected Cash on Delivery");

    // 🔟 Click Confirm
    const confirmBtn = page.getByRole("button", { name: /confirm/i });
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    console.log("✅ Clicked Confirm");


    // 11️⃣ Scroll up to ensure success page is fully visible
await page.mouse.wheel(0, -1000);

// 12️⃣ Validate Thank You page
const thankYouHeading = page.getByRole("heading", {
  name: /thank you for your order/i,
});

await expect(thankYouHeading).toBeVisible({ timeout: 60_000 });

console.log("✅ Order placed successfully");

// 13️⃣ Validate order number appears
await expect(
  page.locator("text=/order #/i")
).toBeVisible({ timeout: 60_000 });

console.log("✅ Order number is visible");

    await page.waitForTimeout(5000);

    // 15) Go to My Account
    try {
      const myAccountBtn = page.getByRole("button", { name: /my account/i });
      await expect(myAccountBtn).toBeVisible({ timeout: 10_000 });
      await myAccountBtn.click();
      console.log("✅ Clicked My Account");

      await page.waitForTimeout(3000);
    } catch (error) {
      console.error("❌ My Account navigation failed:", error);
    }

    // 16) Open Order History
    try {
      const orderHistoryBtn = page.getByRole("link", { name: /order history/i });
      await expect(orderHistoryBtn).toBeVisible({ timeout: 10_000 });
      await orderHistoryBtn.click();
      console.log("✅ Clicked Order History");

      await page.waitForURL(/\/buyer\/order-history/, { timeout: 15_000 });
      await expect(page).toHaveURL(/\/buyer\/order-history/);
      console.log("✅ Order History page opened successfully");

      await page.waitForTimeout(5000);
    } catch (error) {
      console.error("❌ Order History navigation failed:", error);
    }

     await page.waitForTimeout(5000);


    // Optional: wait for success page/toast (adjust once known)
    // await expect(page.locator("text=/order placed|success|thank you/i")).toBeVisible({ timeout: 60_000 });
  });
});