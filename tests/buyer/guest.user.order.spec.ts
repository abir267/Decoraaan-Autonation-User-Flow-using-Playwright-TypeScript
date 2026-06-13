import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { BuyerHomePage } from "../../pages/buyer/BuyerHomePage";
import { PdpPage } from "../../pages/buyer/PdpPage";
import { CheckoutPage } from "../../pages/buyer/CheckoutPage";
import { saveLatestOrder } from "../../utils/orderStorage";
import { upsertAutomationStatus } from "../../utils/automationStatusSheet";
import { now } from "../../utils/timeHelper";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });

test.describe("Guest User E2E: Search → Cart → Guest Checkout → Order", () => {
  test("Guest user places an order without login", async ({ page }) => {
    test.setTimeout(240_000);

    const checkoutPage = new CheckoutPage(page);

    const productQuery = process.env.BUYER_SEARCH_TERM || "Ikea Chair 891";
    const suggestionText = process.env.BUYER_SUGGESTION_TEXT || "Ikea Chair 891";
    const expectedPdpUrl = process.env.BUYER_PDP_URL || "";
    const randomPhone = "01" + Math.floor(700000000 + Math.random() * 99999999).toString();

    let orderNumber = "";

    try {
      // ── 1) Go to buyer home ─────────────────────────────────────────────────
      await page.goto(process.env.BUYER_APP_URL!, { waitUntil: "domcontentloaded" });
      console.log("✅ Opened buyer home page");

      // ── 2) Search & open PDP ────────────────────────────────────────────────
      const buyerHomePage = new BuyerHomePage(page);
      await buyerHomePage.searchProduct(productQuery);
      await buyerHomePage.openSuggestion(suggestionText, expectedPdpUrl);

      console.log("✅ PDP opened successfully");

      await upsertAutomationStatus({
        feature: "Guest User Product Add",
        scenario: "Search With Keyword",
        result: "Pass",
        checkedTime: now(),
      });

      // ── 3) Add to Cart ──────────────────────────────────────────────────────
      const pdpPage = new PdpPage(page);
      await pdpPage.addToCart();
      console.log("✅ Clicked Add to Cart");

      await upsertAutomationStatus({
        feature: "Guest User Add to cart",
        scenario: "Add to cart",
        result: "Pass",
        checkedTime: now(),
      });

      await page.waitForTimeout(2000);

      // ── 4) Go to Cart ───────────────────────────────────────────────────────
      const goToCartBtn = page.getByRole("button", { name: /go to cart/i });
      await expect(goToCartBtn).toBeVisible({ timeout: 10000 });
      await Promise.all([
        page.waitForURL(/\/cart/i, { timeout: 60000 }),
        goToCartBtn.click(),
      ]);
      console.log("✅ Navigated to Cart page");

      await upsertAutomationStatus({
        feature: "Guest User Go to cart",
        scenario: "Go to cart",
        result: "Pass",
        checkedTime: now(),
      });

      // ── 5) Checkout as Guest ────────────────────────────────────────────────
      const guestCheckoutBtn = page.locator('button:has(h1:has-text("Checkout As Guest"))');
      await expect(guestCheckoutBtn).toBeVisible({ timeout: 10000 });
      await Promise.all([
        page.waitForURL(/checkout/i, { timeout: 60000 }),
        guestCheckoutBtn.click(),
      ]);
      console.log("✅ Clicked Checkout As Guest");

      await upsertAutomationStatus({
        feature: "Guest User Checkout",
        scenario: "Checkout as guest",
        result: "Pass",
        checkedTime: now(),
      });

      // ── 6) Fill phone number ────────────────────────────────────────────────
const phoneInput = page.locator('input[placeholder="01XXXXXXXXX"]').first();
await phoneInput.waitFor({ state: "visible", timeout: 10000 });
await phoneInput.fill(randomPhone);




      // ── 7) Add shipping address ─────────────────────────────────────────────
      const addNewAddressBtn = page.locator('h3:has-text("Add new address")').first();
      await addNewAddressBtn.click();
      await page.waitForTimeout(1000);

// First Name & Last Name
await page.locator('input[placeholder="First Name"]').fill("Guest");
await page.locator('input[placeholder="Last Name"]').fill("User" + Math.floor(Math.random() * 9999));

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

      // ── 8) Billing same as shipping ─────────────────────────────────────────
      const billingCheckbox = page.locator('#mat-mdc-checkbox-1-input');
      if (!(await billingCheckbox.isChecked())) {
        await billingCheckbox.check({ force: true });
      }
      console.log("✅ Billing same as shipping checked");
      await page.waitForTimeout(500);

      // ── 9) Next to payment ──────────────────────────────────────────────────
      await checkoutPage.clickNextToPayment();
      console.log("✅ Moved to Payment page");
     // ── 10) Confirm order — Online Payment (default) ────────────────────────
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
console.log("✅ Clicked Confirm — redirecting to SSLCommerz");

// ── 11) SSLCommerz payment flow ─────────────────────────────────────────
await page.waitForURL(/sandbox\.sslcommerz\.com/, { timeout: 30000 });
console.log("✅ Redirected to SSLCommerz payment page");

// Click Mobile Banking tab
await page.locator('a[href="#menu2"]:has-text("Mobile Banking")').click();
console.log("✅ Clicked Mobile Banking");
await page.waitForTimeout(1000);

// Click bKash
await page.locator('img[src*="bkash.png"]').click();
console.log("✅ Selected bKash");
await page.waitForTimeout(2000);

// Fill OTP
await page.locator('input[name="pan"]').fill("1234");
console.log("✅ Filled OTP: 1234");

// Click Success
await page.locator('input[type="submit"][value="Success"]').click();
console.log("✅ Clicked Success");

// ── 12) Verify order placed ─────────────────────────────────────────────
await page.waitForURL(/ssldev\.com|decoraan/, { timeout: 30000 });
await checkoutPage.verifyOrderPlacedSuccessfully();
console.log("✅ Order placed successfully");


      await upsertAutomationStatus({
        feature: "Guest User Order place",
        scenario: "Order place",
        result: "Pass",
        checkedTime: now(),
      });

    } catch (error: any) {
      console.error("❌ Guest user order flow failed:", error);

      await upsertAutomationStatus({
        feature: "Guest User Order place",
        scenario: "Order place",
        result: "Fail",
        checkedTime: now(),
      });

      throw error;
    }
  });
});