import { test, expect } from "@playwright/test";

test("env is loaded", async () => {
  console.log("BUYER_URL:", process.env.BUYER_URL);
  expect(process.env.BUYER_URL).toBeTruthy();
  expect(process.env.BUYER_EMAIL).toBeTruthy();
});
