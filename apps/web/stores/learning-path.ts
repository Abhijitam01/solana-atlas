import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LearningPath } from "@/components/learning/LearningPath";

interface LearningPathState {
  completedSteps: Record<string, boolean>;
  firstTxCompleted: boolean;
  markStepComplete: (templateId: string) => void;
  markFirstTxComplete: () => void;
  resetProgress: () => void;
}

const PATH_DEFS = [
  {
    id: "solana-fundamentals",
    title: "Solana Fundamentals",
    description: "Go from zero to executing your first on-chain transaction.",
    difficulty: "beginner" as const,
    estimatedTime: "2-3 hours",
    steps: [
      {
        id: "hello-solana",
        templateId: "hello-solana",
        title: "Hello Solana",
        description: "Deploy and run your first Solana instruction.",
        order: 1,
      },
      {
        id: "account-init",
        templateId: "account-init",
        title: "Account Initialization",
        description: "Create program-owned state and mutate it safely.",
        order: 2,
      },
      {
        id: "pda-vault",
        templateId: "pda-vault",
        title: "PDA Vault",
        description: "Derive PDAs and enforce authority checks.",
        order: 3,
      },
    ],
  },
  {
    id: "token-basics",
    title: "Token & NFT Basics",
    description: "Mint tokens and NFTs with CPI flows.",
    difficulty: "intermediate" as const,
    estimatedTime: "3-4 hours",
    steps: [
      {
        id: "token-mint",
        templateId: "token-mint",
        title: "Token Minting",
        description: "Create and mint SPL tokens.",
        order: 1,
      },
      {
        id: "nft-mint",
        templateId: "nft-mint",
        title: "NFT Minting",
        description: "Write metadata and create NFTs.",
        order: 2,
      },
    ],
  },
];

export function deriveLearningPaths(
  completedSteps: Record<string, boolean>
): LearningPath[] {
  return PATH_DEFS.map((path) => {
    const steps = path.steps.map((step, idx) => {
      const completed = Boolean(completedSteps[step.templateId]);
      const prev = path.steps[idx - 1];
      const locked = prev ? !completedSteps[prev.templateId] : false;
      return {
        ...step,
        completed,
        locked,
      };
    });

    const completedCount = steps.filter((s) => s.completed).length;
    const progress = Math.round((completedCount / steps.length) * 100);

    return {
      ...path,
      steps,
      progress,
      completed: completedCount === steps.length,
    };
  });
}

export const useLearningPathStore = create<LearningPathState>()(
  persist(
    (set) => ({
      completedSteps: {},
      firstTxCompleted: false,
      markStepComplete: (templateId) =>
        set((state) => ({
          completedSteps: { ...state.completedSteps, [templateId]: true },
        })),
      markFirstTxComplete: () => set({ firstTxCompleted: true }),
      resetProgress: () => set({ completedSteps: {}, firstTxCompleted: false }),
    }),
    {
      name: "solana-playground-learning-path",
    }
  )
);
