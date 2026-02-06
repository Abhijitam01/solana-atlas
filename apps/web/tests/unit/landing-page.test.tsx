import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import LandingPage from "@/app/landing/page";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("Landing page", () => {
  it("renders the hero content", () => {
    render(<LandingPage />);
    expect(screen.getByText(/Solana Playground/i)).toBeInTheDocument();
    expect(screen.getByText(/Start in the playground/i)).toBeInTheDocument();
  });

  it("renders feature cards and timeline", () => {
    render(<LandingPage />);
    expect(screen.getByText(/Designed for Solana builders/i)).toBeInTheDocument();
    expect(screen.getByText(/Pick a template/i)).toBeInTheDocument();
  });
});
