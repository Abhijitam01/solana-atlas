import { test, expect } from "@playwright/test";

test.describe("Home visual regression", () => {
  test("home renders consistently", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page).toHaveScreenshot("home.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});
