import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export default defineConfig({
  testDir: "./tests",
  use: {
    headless: process.env.HEADLESS === "true",
  },
});