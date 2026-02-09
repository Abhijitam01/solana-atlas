import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "@/components/landing/Hero";

// Avoid pulling in real Supabase/Next router logic
vi.mock("@/components/providers/AuthProvider", () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("Home page hero", () => {
  it("renders the landing hero content", () => {
    render(<Hero />);
    expect(
      screen.getByText(/The Solana Playground/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Run real Solana programs/i)).toBeInTheDocument();
  });
});
