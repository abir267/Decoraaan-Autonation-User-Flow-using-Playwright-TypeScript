
import { test } from "@playwright/test";
import "dotenv/config";

import { BuyerHomePage } from "../../pages/buyer/BuyerHomePage";
import { SearchPage } from "../../pages/buyer/SearchPage";
import { ProductPage } from "../../pages/buyer/ProductPage";
import { CheckoutFlow } from "../../pages/buyer/CheckoutFlow";

test.use({ storageState: "storage/buyer.json" });

test("Buyer order via Search", async ({ page }) => {
  const home = new BuyerHomePage(page);
  const search = new SearchPage(page);
  const product = new ProductPage(page);
  const checkout = new CheckoutFlow(page);

  await home.openHome();

  await search.searchProduct("chair");
  await search.openFirstResult();

  await product.addToCart();
  await product.openCart();

  await checkout.completeCODOrder();
});