import { test, expect } from "@playwright/test"
import dotenv from "dotenv"
import path from "path"

// ✅ Always load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), ".env") })

test("Buyer Sign In - Success", async ({ page }) => {
  // quick check so you see the real problem immediately
  if (!process.env.AUTH_SIGNIN_URL) throw new Error("AUTH_SIGNIN_URL is missing in .env")
  if (!process.env.BUYER_EMAIL) throw new Error("BUYER_EMAIL is missing in .env")
  if (!process.env.BUYER_PASSWORD) throw new Error("BUYER_PASSWORD is missing in .env")
  if (!process.env.BUYER_APP_URL) throw new Error("BUYER_APP_URL is missing in .env")

  await page.goto(process.env.AUTH_SIGNIN_URL, { waitUntil: "domcontentloaded" })

  await page.locator("#username").fill(process.env.BUYER_EMAIL)
  await page.locator("#password").fill(process.env.BUYER_PASSWORD)

  await Promise.all([
    page.waitForURL((url) => !url.toString().includes("/sign-in"), { timeout: 60_000 }),
    page.locator("button.submit").click(),
  ])

  const buyerHost = new URL(process.env.BUYER_APP_URL).host
  await expect(page).toHaveURL(new RegExp(buyerHost.replace(/\./g, "\\.")))

  console.log("✅ Sign in successfully")
})