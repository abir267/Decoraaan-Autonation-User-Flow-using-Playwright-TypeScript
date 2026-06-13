import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });

export default defineConfig({
  testDir: "./tests",
  timeout: 120000,
  reporter: [
    ["list"],
    ["allure-playwright", { resultsDir: "allure-results" }]
  ],
  projects: [
    {
      name: "buyer-flow",
      testMatch: "**/buyer/login.search.pdp.orderplaced.spec.ts",
      use: {
        headless: process.env.HEADLESS === "true",
        screenshot: "only-on-failure",
        trace: "retain-on-failure",
        video: "retain-on-failure",
      },
    },
    {
      name: "seller-flow",
      testMatch: "**/seller flow/seller.accept.order.spec.ts",
      dependencies: ["buyer-flow"],
      use: {
        headless: process.env.HEADLESS === "true",
        screenshot: "only-on-failure",
        trace: "retain-on-failure",
        video: "retain-on-failure",
      },
    },
    {
      name: "new-user-flow",
      testMatch: "**/buyer/new.user.order.spec.ts",
      use: {
        headless: process.env.HEADLESS === "true",
        screenshot: "only-on-failure",
        trace: "retain-on-failure",
        video: "retain-on-failure",
      },
    },
    {
      name: "new-user-seller-flow",
      testMatch: "**/seller flow/seller.accept.order.spec.ts",
      dependencies: ["new-user-flow"],
      use: {
        headless: process.env.HEADLESS === "true",
        screenshot: "only-on-failure",
        trace: "retain-on-failure",
        video: "retain-on-failure",
      },
    },
    {
      name: "guest-user-flow",
      testMatch: "**/buyer/guest.user.order.spec.ts",
      use: {
        headless: process.env.HEADLESS === "true",
        screenshot: "only-on-failure",
        trace: "retain-on-failure",
        video: "retain-on-failure",
      },
    },
  ],
});