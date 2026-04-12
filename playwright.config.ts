import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export default defineConfig({
  testDir: "./tests",
  timeout: 120000,
  reporter: [
    ["list"],
    ["allure-playwright", { resultsDir: "allure-results" }]
  ],
  use: {
    headless: process.env.HEADLESS === "true",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure"
  }
});