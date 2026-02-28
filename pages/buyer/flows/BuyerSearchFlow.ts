import { Page, Locator, expect } from "@playwright/test"
import { BasePage } from "../../common/BasePage"

export class BuyerSearchFlow extends BasePage {
  private searchInput: Locator

  constructor(page: Page) {
    super(page)

    // ✅ Exact element you provided
    this.searchInput = page.locator("#mat-input-0")
  }

  async searchAndOpenSuggestion(
    productQuery: string,
    suggestionText: string,
    expectedPdpUrl: string
  ) {
    // Wait for search input
    await this.expectVisible(this.searchInput)

    // Type product name
    await this.type(this.searchInput, productQuery)

    // Suggestion item (h3 text)
    const suggestionItem = this.page.locator("h3", {
      hasText: suggestionText,
    }).first()

    // If not found → throw error
    try {
      await expect(suggestionItem).toBeVisible({ timeout: 7000 })
    } catch {
      throw new Error(`❌ Product not found: ${productQuery}`)
    }

    // Click + wait for PDP
    await Promise.all([
      this.page.waitForURL(expectedPdpUrl, { timeout: 60_000 }),
      suggestionItem.click(),
    ])

    // Final assert
    await expect(this.page).toHaveURL(expectedPdpUrl)

    // ✅ Stay on PDP for 10 seconds
await this.page.waitForTimeout(10_000)
  }
}