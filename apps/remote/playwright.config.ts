import { defineConfig, devices } from "@playwright/test";

// Both servers serve BUILT output: the remote's dist on 3100 and the harness
// host on 3101. Run `pnpm build && pnpm build:harness` first (CI does).
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://localhost:3101", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "pnpm preview",
      url: "http://localhost:3100/mf-manifest.json",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "pnpm preview:harness",
      url: "http://localhost:3101",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
