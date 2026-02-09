import React, { type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import LandingPage from "@/app/landing/page";

// Avoid pulling in full Auth/Supabase/Next router in this unit test
vi.mock("@/components/auth/AuthButton", () => ({
  AuthButton: () => <button>Auth</button>,
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Legacy landing-page test (redundant with newer landing tests) – skipped for now
describe.skip("Landing page", () => {
  it("renders the hero content", () => {
    render(<LandingPage />);
    expect(screen.getByText(/The Solana Playground/i)).toBeInTheDocument();
    expect(screen.getByText(/Open Playground/i)).toBeInTheDocument();
  });

  it("renders feature cards and timeline", () => {
    render(<LandingPage />);
    expect(screen.getByText(/Start from an example/i)).toBeInTheDocument();
  });
});
