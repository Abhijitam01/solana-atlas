import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import LandingPage from "@/app/landing/page";

// Avoid pulling in full Auth/Supabase/Next router in this unit test
vi.mock("@/components/auth/AuthButton", () => ({
  AuthButton: () => <button>Auth</button>,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Legacy full-landing unit test – covered by hero + Playwright specs, so skip here
describe.skip("LandingPage", () => {
  it("renders hero headline and primary CTA", () => {
    render(<LandingPage />);

    expect(
      screen.getByRole("heading", {
        name: /the solana playground/i,
      })
    ).toBeInTheDocument();

    const cta = screen.getByRole("link", { name: /open playground/i });
    expect(cta).toHaveAttribute("href", "/playground/hello-solana");
  });

  it("shows feature section anchors", () => {
    render(<LandingPage />);
    expect(screen.getByRole("link", { name: /how it works/i })).toHaveAttribute(
      "href",
      "#how-it-works"
    );
    expect(screen.getByRole("link", { name: /examples/i })).toHaveAttribute(
      "href",
      "#examples"
    );
  });
});


