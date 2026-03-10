import { test } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

import { AuthSignInPage } from "../../pages/buyer/AuthSignInPage";
import { BuyerHomePage } from "../../pages/buyer/BuyerHomePage";
import { PdpPage } from "../../pages/buyer/PdpPage";
import { CartPage } from "../../pages/buyer/CartPage";
import { CheckoutPage } from "../../pages/buyer/CheckoutPage";
import { saveLatestOrder } from "../../utils/orderStorage";
import { upsertAutomationStatus } from "../../utils/automationStatusSheet";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

test.describe("Buyer E2E: Login → PDP → Cart → Checkout → Payment", () => {
  test("Buyer places order and opens order history", async ({ page }) => {
    test.setTimeout(180_000);

    const productQuery = "Chair 0099";
    const suggestionText = "Chair 0099 [Product For Automation]";
    const expectedPdpUrl =
      "https://pre-live.decoraan.com/pdp/chair-0099-product-for-automation-699e74c742b06051854e7742";

    const scenarioName = "Buyer places order and opens order history";

    const authSignInPage = new AuthSignInPage(page);
    const buyerHomePage = new BuyerHomePage(page);
    const pdpPage = new PdpPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    try {
      await authSignInPage.gotoSignIn();
      await authSignInPage.signInAsBuyer();
      await authSignInPage.verifyBuyerRedirect();
      console.log("✅ Sign in successfully");

      await buyerHomePage.searchProduct(productQuery);
      await buyerHomePage.openSuggestion(suggestionText, expectedPdpUrl);
      console.log("✅ PDP opened successfully");

      await pdpPage.addToCart();
      console.log("✅ Clicked Add to Cart");

      await pdpPage.goToCart();
      console.log("✅ Navigated to Cart page");

      await cartPage.clickCheckout();
      console.log("✅ Navigated to Checkout page");

      await checkoutPage.selectBillingSameAsShipping();
      console.log("✅ Checked Billing same as Shipping");

      await checkoutPage.clickNextToPayment();
      console.log("✅ Moved to Payment page");

      await checkoutPage.selectCashOnDelivery();
      console.log("✅ Selected Cash on Delivery");

      await checkoutPage.clickConfirm();
      console.log("✅ Clicked Confirm");

      const orderId =
        await checkoutPage.verifyOrderPlacedSuccessfullyAndGetOrderId();

      saveLatestOrder(orderId);

      console.log(`✅ Order placed successfully: ${orderId}`);
      console.log(`✅ Latest order saved in project: ${orderId}`);

      await page.waitForTimeout(5000);

      await checkoutPage.goToMyAccount();
      console.log("✅ Clicked My Account");

      await page.waitForTimeout(3000);

      await checkoutPage.openOrderHistory();
      console.log("✅ Order History page opened successfully");

      await page.waitForTimeout(5000);

      await upsertAutomationStatus({
        scenario: scenarioName,
        result: "Pass",
        comments: `Order placed successfully. Order ID: ${orderId}`,
        checkedTime: new Date().toLocaleString(),
      });

      await page.waitForTimeout(5000);
    } catch (error: any) {
      await upsertAutomationStatus({
        scenario: scenarioName,
        result: "Fail",
        comments: error?.message || "Test failed",
        checkedTime: new Date().toLocaleString(),
      });

      throw error;
    }
  });
});