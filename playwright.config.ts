import { defineConfig as playwrightDefineConfig } from '@playwright/test';

export default defineConfig({
  //globalSetup: require.resolve("./global-setup"),

  testDir: "./tests",
  use: {
    headless: process.env.HEADLESS === "true",
  },
});
function defineConfig(config: { globalSetup: string; testDir: string; use: { headless: boolean; }; }) {
  return playwrightDefineConfig(config);
}

