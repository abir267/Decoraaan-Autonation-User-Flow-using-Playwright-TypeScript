import { Page, Locator, expect } from "@playwright/test";

export class PdpPageE2E {
  readonly page: Page;

  readonly productTitle: (title: string) => Locator;
  readonly upArrowBtn: Locator;
  readonly downArrowBtn: Locator;
  readonly galleryCounter: Locator;

  readonly othersCheckbox: Locator;
  readonly reasonTextarea: Locator;
  readonly modalSubmitBtn: Locator;

  readonly redColorBtn: Locator;
  readonly metalBtn: Locator;
  readonly wishlistBtn: Locator;

  readonly increaseBtn: Locator;
  readonly decreaseBtn: Locator;

  readonly specificationTab: Locator;
  readonly faqTab: Locator;
  readonly reviewsTab: Locator;
  readonly writeReviewBtn: Locator;

  readonly reviewTextarea: Locator;
  readonly reviewSubmitBtn: Locator;

  readonly addToCartBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.productTitle = (title: string) =>
      page.getByRole("heading", { name: title, exact: true });

    this.upArrowBtn = page.locator(
      'button:has(img[src*="gray-round-up-arrow.svg"])'
    ).first();

    this.downArrowBtn = page.locator(
      'button:has(img[src*="gray-round-down-arrow.svg"])'
    ).first();

    this.galleryCounter = page.locator("h5.font-medium.text-sm.leading-5").first();

    this.othersCheckbox = page.locator('input[aria-label="Others"]');
    this.reasonTextarea = page.locator('textarea[placeholder="Please tell us why?"]');
    this.modalSubmitBtn = page.getByRole("button", { name: /submit/i }).first();

    this.redColorBtn = page.locator(
      'button.attribute-wrapper:has(div[style*="rgb(220, 20, 60)"])'
    ).first();

    this.metalBtn = page.getByText("Metal", { exact: true });
    this.wishlistBtn = page.locator('button:has(img[src*="heart.svg"])').first();

    this.increaseBtn = page.locator('button:has(svg path[d*="M7 1V13"])').first();
    this.decreaseBtn = page.locator('button:has(svg path[d*="M13 1L1 1"])').first();

    this.specificationTab = page.locator("h4", { hasText: "Specification" }).first();
    this.faqTab = page.locator("h4", { hasText: "FAQ" }).first();
    this.reviewsTab = page.locator("h4", { hasText: "Reviews" }).first();
    this.writeReviewBtn = page.locator("h1", { hasText: "Write a review" }).first();

    this.reviewTextarea = page.locator('textarea[placeholder="Enter Your Review"]');
    this.reviewSubmitBtn = page.locator('button:has-text("Submit")').first();

    this.addToCartBtn = page.getByRole("button", { name: /add to cart/i });
  }

  async validateTitle(title: string) {
    const el = this.productTitle(title);
    await el.scrollIntoViewIfNeeded();
    await expect(el).toBeVisible({ timeout: 15_000 });
    await expect(el).toHaveText(title);
  }

  async getCounterValue(): Promise<number> {
    const rawText = await this.galleryCounter.textContent();
    const cleaned = rawText?.trim();
    if (!cleaned) return 0;
    const parsed = parseInt(cleaned, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  async handleUpAndDownVoteFlow() {
    await expect(this.upArrowBtn).toBeVisible({ timeout: 10_000 });

    const currentCount = await this.getCounterValue();
    console.log(`ℹ️ Current gallery count: ${currentCount}`);

    if (await this.upArrowBtn.isEnabled()) {
      await this.upArrowBtn.click();
      await this.page.waitForTimeout(2000);
      const afterUpvote = await this.getCounterValue();
      console.log(`📊 Count after upvote: ${afterUpvote}`);
    } else {
      console.log(`⚠️ Up Arrow disabled. Count remains: ${currentCount}`);
    }

    await expect(this.downArrowBtn).toBeVisible({ timeout: 10_000 });

    if (await this.downArrowBtn.isEnabled()) {
      await this.downArrowBtn.click();
      console.log("✅ Downvote clicked");

      const improvementModal = this.page.getByText("Needs Improvement", { exact: true });
      await expect(improvementModal).toBeVisible({ timeout: 10_000 });

      await this.othersCheckbox.check();
      await this.reasonTextarea.fill("automation test is running");
      await this.modalSubmitBtn.click();

      console.log("✅ Downvote reason submitted");

      await this.page.waitForTimeout(2000);

      const finalCount = await this.getCounterValue();
      console.log(`📊 Count after downvote: ${finalCount}`);
    } else {
      console.log("⚠️ Down Arrow disabled. Downvote flow skipped.");
    }
  }

  async changeColorToRed() {
    await expect(this.redColorBtn).toBeVisible({ timeout: 10_000 });
    await this.redColorBtn.click();
  }

  async changeMaterialToMetal() {
    await expect(this.metalBtn).toBeVisible({ timeout: 10_000 });
    await this.metalBtn.click();
  }

  async addToWishlist() {
    await expect(this.wishlistBtn).toBeVisible({ timeout: 10_000 });
    await this.wishlistBtn.click();
  }

  async increaseQuantityTo3() {
    await expect(this.increaseBtn).toBeVisible({ timeout: 10_000 });
    await this.increaseBtn.click();
    await this.increaseBtn.click();
  }

  async decreaseQuantityBy1() {
    await expect(this.decreaseBtn).toBeVisible({ timeout: 10_000 });
    await this.decreaseBtn.click();
  }

  async openTabs() {
    await this.specificationTab.scrollIntoViewIfNeeded();

    await expect(this.specificationTab).toBeVisible({ timeout: 10_000 });
    await this.specificationTab.click();

    await expect(this.faqTab).toBeVisible({ timeout: 10_000 });
    await this.faqTab.click();

    await expect(this.reviewsTab).toBeVisible({ timeout: 10_000 });
    await this.reviewsTab.click();
  }

  async submitReview() {
    await expect(this.writeReviewBtn).toBeVisible({ timeout: 10_000 });
    await this.writeReviewBtn.click();

    const fourthStar = this.page.locator('svg path[d^="M7.72147"]').nth(3);
    await expect(fourthStar).toBeVisible({ timeout: 10_000 });
    await fourthStar.click();

    await expect(this.reviewTextarea).toBeVisible({ timeout: 10_000 });
    await this.reviewTextarea.fill("Nice Product [BOT]");

    await expect(this.reviewSubmitBtn).toBeVisible({ timeout: 10_000 });
    await this.reviewSubmitBtn.click();

    await this.page.waitForTimeout(2000);
  }

  async addToCart() {
    await expect(this.addToCartBtn).toBeVisible({ timeout: 10_000 });
    await this.addToCartBtn.click();
  }
}