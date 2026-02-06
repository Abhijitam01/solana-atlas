import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "@/app/page";

const templates = [
  {
    id: "hello-solana",
    name: "Hello Solana",
    description: "Basics",
    difficulty: "beginner" as const,
  },
  {
    id: "token-mint",
    name: "Token Mint",
    description: "Mint SPL tokens",
    difficulty: "intermediate" as const,
  },
];

vi.mock("@/hooks/use-templates", () => ({
  useTemplates: () => ({ data: templates, isLoading: false }),
}));

describe("Home (template catalog)", () => {
  it("filters templates by search", async () => {
    const user = userEvent.setup();
    render(<Home />);

    expect(screen.getByText(/hello solana/i)).toBeInTheDocument();
    expect(screen.getByText(/token mint/i)).toBeInTheDocument();

    await user.type(
      screen.getByPlaceholderText(/search templates/i),
      "token"
    );

    expect(screen.queryByText(/hello solana/i)).not.toBeInTheDocument();
    expect(screen.getByText(/token mint/i)).toBeInTheDocument();
  });

  it("filters templates by difficulty", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.selectOptions(
      screen.getByRole("combobox"),
      screen.getByRole("option", { name: /beginner/i })
    );

    expect(screen.getByText(/hello solana/i)).toBeInTheDocument();
    expect(screen.queryByText(/token mint/i)).not.toBeInTheDocument();
  });
});


