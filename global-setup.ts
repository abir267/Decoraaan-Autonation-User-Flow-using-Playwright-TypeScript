import { chromium, FullConfig } from "@playwright/test"
import fs from "fs"
import path from "path"
import "dotenv/config"

const STORAGE_DIR = path.join(process.cwd(), "storage")

// Change to true only when debugging login visually
const DEBUG_HEADED = false

// If you set FORCE_RELOGIN=true in .env, it will recreate all sessions
const FORCE_RELOGIN = process.env.FORCE_RELOGIN === "true"

function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true })
}

function storageFilePath(name: "buyer" | "seller" | "admin") {
  return path.join(STORAGE_DIR, `${name}.json`)
}

function shouldSkip(storagePath: string) {
  return !FORCE_RELOGIN && fs.existsSync(storagePath) && fs.statSync(storagePath).size > 0
}

function hostFrom(url: string) {
  return new URL(url).host
}

async function loginAndSaveState(params: {
  authUrl: string
  appUrl: string
  email: string
  password: string
  storagePath: string
  roleName: "buyer" | "seller" | "admin"
}) {
  const browser = await chromium.launch({ headless: !DEBUG_HEADED })
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    if (!params.authUrl) throw new Error(`${params.roleName}: AUTH_SIGNIN_URL is missing`)
    if (!params.appUrl) throw new Error(`${params.roleName}: *_APP_URL is missing`)
    if (!params.email) throw new Error(`${params.roleName}: *_EMAIL is missing`)
    if (!params.password) throw new Error(`${params.roleName}: *_PASSWORD is missing`)

    await page.goto(params.authUrl, { waitUntil: "domcontentloaded" })

    // ✅ Locators from your HTML:
    // username input: id="username"
    // password input: id="password"
    // submit button: class="submit"
    await page.locator("#username").fill(params.email)
    await page.locator("#password").fill(params.password)
    await page.locator("button.submit").click()

    // ✅ Stable redirect wait: wait until we land on the role app host
    const targetHost = hostFrom(params.appUrl)
    await page.waitForURL(`**${targetHost}/**`, { timeout: 60_000 })

    await context.storageState({ path: params.storagePath })
    console.log(`✅ Saved ${params.roleName} session -> ${params.storagePath}`)
  } catch (err) {
    const screenshotPath = path.join(STORAGE_DIR, `${params.roleName}-login-failed.png`)
    await page.screenshot({ path: screenshotPath, fullPage: true })
    console.error(`❌ ${params.roleName} login failed. Screenshot: ${screenshotPath}`)
    throw err
  } finally {
    await browser.close()
  }
}

export default async function globalSetup(config: FullConfig) {
  ensureStorageDir()

  // ✅ Updated env checks (matches your new .env)
  const required = [
    "AUTH_SIGNIN_URL",

    "BUYER_EMAIL",
    "BUYER_PASSWORD",
    "BUYER_APP_URL",

    "SELLER_EMAIL",
    "SELLER_PASSWORD",
    "SELLER_APP_URL",

    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",
    "ADMIN_APP_URL",
  ]
  const missing = required.filter((k) => !process.env[k])
  if (missing.length) throw new Error(`Missing .env values: ${missing.join(", ")}`)

  const buyerPath = storageFilePath("buyer")
  const sellerPath = storageFilePath("seller")
  const adminPath = storageFilePath("admin")

  if (shouldSkip(buyerPath)) console.log("⏭️ buyer.json exists, skipping buyer login")
  else {
    await loginAndSaveState({
      authUrl: process.env.AUTH_SIGNIN_URL!,
      appUrl: process.env.BUYER_APP_URL!,
      email: process.env.BUYER_EMAIL!,
      password: process.env.BUYER_PASSWORD!,
      storagePath: buyerPath,
      roleName: "buyer",
    })
  }

  if (shouldSkip(sellerPath)) console.log("⏭️ seller.json exists, skipping seller login")
  else {
    await loginAndSaveState({
      authUrl: process.env.AUTH_SIGNIN_URL!,
      appUrl: process.env.SELLER_APP_URL!,
      email: process.env.SELLER_EMAIL!,
      password: process.env.SELLER_PASSWORD!,
      storagePath: sellerPath,
      roleName: "seller",
    })
  }

  if (shouldSkip(adminPath)) console.log("⏭️ admin.json exists, skipping admin login")
  else {
    await loginAndSaveState({
      authUrl: process.env.AUTH_SIGNIN_URL!,
      appUrl: process.env.ADMIN_APP_URL!,
      email: process.env.ADMIN_EMAIL!,
      password: process.env.ADMIN_PASSWORD!,
      storagePath: adminPath,
      roleName: "admin",
    })
  }
}