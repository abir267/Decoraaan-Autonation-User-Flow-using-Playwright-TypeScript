import { test, expect } from "@playwright/test";
import "dotenv/config";
import { BuyerHomePage } from "../../pages/buyer/BuyerHomePage";

test.use({ storageState: "storage/buyer.json" });

test("Buyer can open home page (POM)", async ({ page }) => {
  const buyerHome = new BuyerHomePage(page);

  await buyerHome.openHome();
  await buyerHome.assertLoggedIn();

  // Extra check: not redirected to login
  await expect(page).not.toHaveURL(/sign-in/i);
});