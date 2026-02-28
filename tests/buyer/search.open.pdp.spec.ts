import { test } from "@playwright/test"
import dotenv from "dotenv"
import path from "path"
import { BuyerSearchFlow } from "../../pages/buyer/flows/BuyerSearchFlow"

dotenv.config({ path: path.resolve(process.cwd(), ".env") })

test.describe("Buyer Search → PDP", () => {
  // ✅ Auto-login using your saved session (created by global-setup)
  test.use({ storageState: "storage/buyer.json" })

  test("Search 'Chair 0099' and open PDP", async ({ page }) => {
    const flow = new BuyerSearchFlow(page)

    await page.goto(process.env.BUYER_APP_URL!, { waitUntil: "domcontentloaded" })

    const productQuery = "Chair 0099"
    const suggestionText = "Chair 0099 [Product For Automation]"
    const expectedPdpUrl =
      "https://pre-live.decoraan.com/pdp/chair-0099-product-for-automation-699e74c742b06051854e7742"

    await flow.searchAndOpenSuggestion(productQuery, suggestionText, expectedPdpUrl)

    console.log("✅ Product found and PDP opened successfully")
  })
})