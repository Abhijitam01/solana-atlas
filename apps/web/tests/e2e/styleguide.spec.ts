import { test, expect } from "@playwright/test";

test.describe("Styleguide visual regression", () => {
  test("styleguide renders consistently", async ({ page }) => {
    await page.goto("/styleguide", { waitUntil: "networkidle" });
    await expect(page).toHaveScreenshot("styleguide.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});
