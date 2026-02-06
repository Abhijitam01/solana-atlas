import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import Home from "@/app/page";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/hooks/use-templates", () => ({
  useTemplates: () => ({
    data: [
      {
        id: "hello-solana",
        name: "Hello Solana",
        description: "Intro to accounts",
        difficulty: "beginner",
      },
    ],
    isLoading: false,
  }),
}));

describe("Home page", () => {
  it("renders the template search and filter controls", () => {
    render(<Home />);
    expect(screen.getByPlaceholderText(/Search templates/i)).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("renders the template grid", () => {
    render(<Home />);
    expect(screen.getByText(/Hello Solana/i)).toBeInTheDocument();
  });
});
