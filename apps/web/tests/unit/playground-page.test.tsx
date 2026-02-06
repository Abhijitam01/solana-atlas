import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import PlaygroundPage from "@/app/playground/[templateId]/page";

vi.mock("next/navigation", () => ({
  useParams: () => ({ templateId: "hello-solana" }),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/hooks/use-templates", () => ({
  useTemplate: () => ({
    data: {
      id: "hello-solana",
      code: "fn main() {}",
      metadata: { name: "Hello", description: "Intro", difficulty: "beginner" },
    },
    isLoading: false,
  }),
  useTemplates: () => ({ data: [] }),
}));

vi.mock("@/stores/playground", () => ({
  usePlaygroundStore: () => ({
    setTemplate: vi.fn(),
    selectedLine: 1,
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toasts: [], dismissToast: vi.fn() }),
}));

vi.mock("@/components/panels/CodePanel", () => ({
  CodePanel: () => <div>CodePanel</div>,
}));
vi.mock("@/components/panels/MapPanel", () => ({
  MapPanel: () => <div>MapPanel</div>,
}));
vi.mock("@/components/panels/StatePanel", () => ({
  StatePanel: () => <div>StatePanel</div>,
}));
vi.mock("@/components/ui/CommandPalette", () => ({
  CommandPalette: () => <div>CommandPalette</div>,
}));
vi.mock("@/components/ai/AITutor", () => ({
  AITutor: () => <div>AITutor</div>,
}));
vi.mock("@/components/ai/ContextualHints", () => ({
  ContextualHints: () => <div>ContextualHints</div>,
}));

describe("Playground page", () => {
  it("renders the three-panel layout", () => {
    render(<PlaygroundPage />);
    expect(screen.getByText("CodePanel")).toBeInTheDocument();
    expect(screen.getByText("MapPanel")).toBeInTheDocument();
    expect(screen.getByText("StatePanel")).toBeInTheDocument();
  });

  it("renders command palette and assistants", () => {
    render(<PlaygroundPage />);
    expect(screen.getByText("CommandPalette")).toBeInTheDocument();
    expect(screen.getByText("AITutor")).toBeInTheDocument();
    expect(screen.getByText("ContextualHints")).toBeInTheDocument();
  });
});
