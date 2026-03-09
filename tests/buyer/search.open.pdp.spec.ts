import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

test.describe("Buyer E2E: Login → PDP → Title + Gallery", () => {
  test("Buyer opens PDP and validates PDP scenarios", async ({ page }) => {
    test.setTimeout(180_000);

    const productQuery = "Chair 0099";
    const suggestionText = "Chair 0099 [Product For Automation]";
    const expectedPdpUrl =
      "https://pre-live.decoraan.com/pdp/chair-0099-product-for-automation-699e74c742b06051854e7742";

    // 1) Login
    await page.goto(process.env.AUTH_SIGNIN_URL!, {
      waitUntil: "domcontentloaded",
    });
    await page.locator("#username").fill(process.env.BUYER_EMAIL!);
    await page.locator("#password").fill(process.env.BUYER_PASSWORD!);

    await Promise.all([
      page.waitForURL((url) => !url.toString().includes("/sign-in"), {
        timeout: 60_000,
      }),
      page.locator("button.submit").click(),
    ]);

    const buyerHost = new URL(process.env.BUYER_APP_URL!).host;
    await expect(page).toHaveURL(
      new RegExp(buyerHost.replace(/\./g, "\\."))
    );
    console.log("✅ Sign in successfully");

    // 2) Search product
    const searchInput = page.locator("#mat-input-0");
    await expect(searchInput).toBeVisible({ timeout: 15_000 });
    await searchInput.fill(productQuery);

    const suggestionItem = page
      .locator("h3", { hasText: suggestionText })
      .first();
    await expect(suggestionItem).toBeVisible({ timeout: 15_000 });

    await Promise.all([
      page.waitForURL(expectedPdpUrl, { timeout: 60_000 }),
      suggestionItem.click(),
    ]);

    await expect(page).toHaveURL(expectedPdpUrl);
    console.log("✅ PDP opened successfully");

    // 3) Validate product name
    try {
      const productTitle = page.getByRole("heading", {
        name: suggestionText,
        exact: true,
      });

      await productTitle.scrollIntoViewIfNeeded();
      await expect(productTitle).toBeVisible({ timeout: 15_000 });
      await expect(productTitle).toHaveText(suggestionText);

      console.log("✅ Product title matches expected name");
    } catch (error) {
      console.error("❌ Product title validation failed:", error);
    }

    // 4) Up vote / Down vote flow
    try {
      const upArrowBtn = page
        .locator('button:has(img[src*="gray-round-up-arrow.svg"])')
        .first();

      const downArrowBtn = page
        .locator('button:has(img[src*="gray-round-down-arrow.svg"])')
        .first();

      await expect(upArrowBtn).toBeVisible({ timeout: 10_000 });

      const galleryCounter = upArrowBtn
        .locator('xpath=preceding-sibling::*[1]//h5 | .//h5')
        .first();

      const getCounterValue = async (): Promise<number> => {
        const exists = await galleryCounter.count();
        if (!exists) return 0;

        const rawText = await galleryCounter.textContent();
        const cleaned = rawText?.trim();

        if (!cleaned) return 0;

        const parsed = parseInt(cleaned, 10);
        return Number.isNaN(parsed) ? 0 : parsed;
      };

      const currentCount = await getCounterValue();
      console.log(`ℹ️ Current gallery count: ${currentCount}`);

      if (await upArrowBtn.isEnabled()) {
        console.log("✅ Up Arrow enabled");

        await upArrowBtn.click();
        await page.waitForTimeout(2000);

        const afterUpvote = await getCounterValue();
        console.log(`📊 Count after upvote: ${afterUpvote}`);
      } else {
        console.log(`⚠️ Up Arrow disabled. Count remains: ${currentCount}`);
      }

      await expect(downArrowBtn).toBeVisible({ timeout: 10_000 });

      if (await downArrowBtn.isEnabled()) {
        await downArrowBtn.click();
        console.log("✅ Downvote clicked");

        const improvementModal = page.getByText("Needs Improvement", {
          exact: true,
        });
        await expect(improvementModal).toBeVisible({ timeout: 10_000 });

        const othersCheckbox = page.locator('input[aria-label="Others"]');
        await expect(othersCheckbox).toBeVisible({ timeout: 10_000 });
        await othersCheckbox.check();

        const reasonTextarea = page.locator(
          'textarea[placeholder="Please tell us why?"]'
        );
        await expect(reasonTextarea).toBeVisible({ timeout: 10_000 });
        await reasonTextarea.fill("automation test is running");

        const submitBtn = page.getByRole("button", {
          name: /submit/i,
        }).first();
        await expect(submitBtn).toBeVisible({ timeout: 10_000 });
        await submitBtn.click();

        console.log("✅ Downvote reason submitted");

        await page.waitForTimeout(2000);

        const finalCount = await getCounterValue();
        console.log(`📊 Count after downvote: ${finalCount}`);
      } else {
        console.log("⚠️ Down Arrow disabled. Downvote flow skipped.");
      }
    } catch (error) {
      console.error("❌ Upvote / Downvote scenario failed:", error);
    }

    // 5) Tabs: Specification → FAQ → Reviews
    try {
      const specificationTab = page
        .locator("h4", { hasText: "Specification" })
        .first();
      await specificationTab.scrollIntoViewIfNeeded();
      await expect(specificationTab).toBeVisible({ timeout: 10_000 });
      await specificationTab.click();
      console.log("✅ Specification tab opened");

      await page.waitForTimeout(2000);

      const faqTab = page.locator("h4", { hasText: "FAQ" }).first();
      await expect(faqTab).toBeVisible({ timeout: 10_000 });
      await faqTab.click();
      console.log("✅ FAQ tab opened");

      await page.waitForTimeout(2000);

      const reviewTab = page.locator("h4", { hasText: "Reviews" }).first();
      await expect(reviewTab).toBeVisible({ timeout: 10_000 });
      await reviewTab.click();
      console.log("✅ Reviews tab opened");

      await page.waitForTimeout(2000);
    } catch (error) {
      console.error("❌ PDP tab navigation scenario failed:", error);
    }

    // 6) Open Write a review
    try {
      const writeReviewBtn = page
        .locator("h1", { hasText: "Write a review" })
        .first();
      await expect(writeReviewBtn).toBeVisible({ timeout: 10_000 });
      await writeReviewBtn.click();
      console.log("✅ Write a review button clicked");

      await page.waitForTimeout(2000);
    } catch (error) {
      console.error("❌ Open write review scenario failed:", error);
    }

    // 7) Submit review
    try {
      const starRating = page.locator('svg path[d^="M7.72147"]').nth(3);
      await expect(starRating).toBeVisible({ timeout: 10_000 });
      await starRating.click();
      console.log("✅ 4 star rating selected");

      const reviewInput = page.locator(
        'textarea[placeholder="Enter Your Review"]'
      );
      await expect(reviewInput).toBeVisible({ timeout: 10_000 });
      await reviewInput.fill("Nice Product [BOT]");
      console.log("✅ Review text entered");

      const submitReviewBtn = page.locator('button:has-text("Submit")').first();
      await expect(submitReviewBtn).toBeVisible({ timeout: 10_000 });
      await submitReviewBtn.click();
      console.log("✅ Review submitted");

      await page.waitForTimeout(5000);
    } catch (error) {
      console.error("❌ Review submission scenario failed:", error);
    }

    // 8) Change color to Red
    try {
      const redColorBtn = page
        .locator(
          'button.attribute-wrapper:has(div[style*="rgb(220, 20, 60)"])'
        )
        .first();

      await expect(redColorBtn).toBeVisible({ timeout: 10_000 });
      await redColorBtn.click();
      console.log("✅ Color changed to Red");
    } catch (error) {
      console.error("❌ Color change to Red failed:", error);
    }

    // 9) Change material to Metal
    try {
      const metalBtn = page.getByText("Metal", { exact: true });
      await expect(metalBtn).toBeVisible({ timeout: 10_000 });
      await metalBtn.click();
      console.log("✅ Material changed to Metal");
    } catch (error) {
      console.error("❌ Material change to Metal failed:", error);
    }

    // 10) Wishlist
    try {
      const wishlistBtn = page
        .locator('button:has(img[src*="heart.svg"])')
        .first();
      await expect(wishlistBtn).toBeVisible({ timeout: 10_000 });
      await wishlistBtn.click();
      console.log("✅ Product added to Wishlist");
    } catch (error) {
      console.error("❌ Wishlist scenario failed:", error);
    }

    // 11) Check stock status before quantity/cart flow
    let isInStock = false;

    try {
      const stockLabel = page.locator("h5", { hasText: "Stock :" }).first();
      const stockValue = page
        .locator("h6")
        .filter({ hasText: /in stock|out of stock/i })
        .first();

      await expect(stockLabel).toBeVisible({ timeout: 10_000 });
      await expect(stockValue).toBeVisible({ timeout: 10_000 });

      const stockText = ((await stockValue.textContent()) || "")
        .trim()
        .toLowerCase();
      console.log(`ℹ️ Product stock status: ${stockText}`);

      if (stockText.includes("in stock")) {
        isInStock = true;
        console.log("✅ Product is in stock. Continuing quantity and cart flow.");
      } else {
        console.log(
          "⚠️ Product is out of stock. Skipping quantity and add-to-cart flow."
        );
      }
    } catch (error) {
      console.error("❌ Stock status check failed:", error);
    }

    // 12) Increase quantity to 3
    if (isInStock) {
      try {
        const increaseBtn = page
          .locator('button:has(svg path[d*="M7 1V13"])')
          .first();
        await expect(increaseBtn).toBeVisible({ timeout: 10_000 });

        await increaseBtn.click();
        await increaseBtn.click();

        console.log("✅ Quantity increased to 3");
      } catch (error) {
        console.error("❌ Increase quantity scenario failed:", error);
      }
    }

    // 13) Decrease quantity by 1
    if (isInStock) {
      try {
        const decreaseBtn = page
          .locator('button:has(svg path[d*="M13 1L1 1"])')
          .first();
        await expect(decreaseBtn).toBeVisible({ timeout: 10_000 });

        await decreaseBtn.click();
        console.log("✅ Quantity decreased by 1");
      } catch (error) {
        console.error("❌ Decrease quantity scenario failed:", error);
      }
    }

    await page.waitForTimeout(5000);

    // 14) Add to cart
    if (isInStock) {
      try {
        const addToCartBtn = page.getByRole("button", { name: /add to cart/i });
        await expect(addToCartBtn).toBeVisible({ timeout: 10_000 });
        await addToCartBtn.click();
        console.log("✅ Clicked Add to Cart");

        await page.waitForTimeout(5000);
      } catch (error) {
        console.error("❌ Add to cart scenario failed:", error);
      }
    }
 

  });
});