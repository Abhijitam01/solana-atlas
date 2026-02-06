import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import LandingPage from "@/app/landing/page";

vi.mock("@/components/landing/animations", () => ({
  fadeInStagger: () => () => {},
  parallaxY: () => () => {},
  floatingGlow: () => () => {},
  prefersReducedMotion: () => true,
}));

describe("LandingPage", () => {
  it("renders hero headline and primary CTA", () => {
    render(<LandingPage />);

    expect(
      screen.getByRole("heading", {
        name: /build solana experiences/i,
      })
    ).toBeInTheDocument();

    const cta = screen.getByRole("link", { name: /start in the playground/i });
    expect(cta).toHaveAttribute("href", "/");
  });

  it("shows feature section anchors", () => {
    render(<LandingPage />);
    expect(screen.getByRole("link", { name: /features/i })).toHaveAttribute(
      "href",
      "#features"
    );
    expect(screen.getByRole("link", { name: /how it works/i })).toHaveAttribute(
      "href",
      "#how"
    );
  });
});


