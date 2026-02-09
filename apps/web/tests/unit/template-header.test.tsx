import React, { type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { TemplateHeader } from "@/components/TemplateHeader";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Avoid pulling in real Auth/Supabase for this unit test
vi.mock("@/components/auth/AuthButton", () => ({
  AuthButton: () => <button>Auth</button>,
}));

vi.mock("@/hooks/use-templates", () => ({
  useTemplates: () => ({
    data: [
      { id: "one", name: "One" },
      { id: "two", name: "Two" },
    ],
  }),
}));

vi.mock("@/stores/playground", () => ({
  usePlaygroundStore: () => ({
    executionMode: "precomputed",
    setExecutionMode: vi.fn(),
  }),
}));

describe("TemplateHeader", () => {
  it("renders template metadata", () => {
    render(
      <TemplateHeader
        template={{
          id: "one",
          metadata: {
            id: "hello",
            name: "Hello",
            description: "Intro",
            difficulty: "beginner",
            learningGoals: ["Send a transaction"],
            solanaConcepts: ["Transactions"],
            estimatedTime: "10 minutes",
          },
        }}
      />
    );
    expect(screen.getByText(/Hello/i)).toBeInTheDocument();
    expect(screen.getByText(/Intro/i)).toBeInTheDocument();
  });
});
