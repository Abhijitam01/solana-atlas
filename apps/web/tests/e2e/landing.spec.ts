import { test, expect } from "@playwright/test";

test("landing loads and CTA points to playground", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /the solana playground/i })
  ).toBeVisible();

  const cta = page.getByRole("link", { name: /open playground/i });
  await expect(cta).toHaveAttribute("href", "/playground/hello-solana");
});


