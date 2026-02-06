import { test, expect } from "@playwright/test";

test.describe("Playground visual regression", () => {
  test("playground renders consistently", async ({ page }) => {
    await page.goto("/playground/hello-solana", { waitUntil: "networkidle" });
    await expect(page).toHaveScreenshot("playground.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});
