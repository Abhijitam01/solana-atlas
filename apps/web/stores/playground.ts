import { create } from "zustand";
import type { ExecutionResult, FunctionSpec } from "@solana-playground/types";
import { markFirstTxStart, markFirstTxSuccess, trackEvent } from "@/lib/analytics";

interface PlaygroundState {
  // Current template
  templateId: string | null;
  code: string;

  // Selection state (drives all panels)
  selectedLine: number | null;
  hoveredLine: number | null;
  selectedInstruction: string | null;
  selectedFlowStepId: string | null;

  // Execution state
  executionMode: "precomputed" | "live";
  currentScenario: string | null;
  isExecuting: boolean;
  executionResult: ExecutionResult | null;

  // Current explanation
  currentFunctionSpec: FunctionSpec | null;

  // Actions
  setTemplate: (templateId: string, code: string) => void;
  setSelectedLine: (line: number | null) => void;
  setHoveredLine: (line: number | null) => void;
  setSelectedInstruction: (instruction: string | null) => void;
  setSelectedFlowStepId: (stepId: string | null) => void;
  setExecutionMode: (mode: "precomputed" | "live") => void;
  setCurrentScenario: (scenario: string | null) => void;
  setExecutionResult: (result: ExecutionResult | null) => void;
  setIsExecuting: (executing: boolean) => void;
  setCurrentFunctionSpec: (spec: FunctionSpec | null) => void;
  reset: () => void;
  executeScenario: (
    scenario: string,
    instruction?: string,
    stepId?: string
  ) => Promise<void>;
}

const initialState = {
  templateId: null,
  code: "",
  selectedLine: null,
  hoveredLine: null,
  selectedInstruction: null,
  selectedFlowStepId: null,
  executionMode: "precomputed" as const,
  currentScenario: null,
  isExecuting: false,
  executionResult: null,
  currentFunctionSpec: null,
};

export const usePlaygroundStore = create<PlaygroundState>((set, get) => ({
  ...initialState,
  setTemplate: (templateId, code) => set({ templateId, code }),
  setSelectedLine: (line) => set({ selectedLine: line }),
  setHoveredLine: (line) => set({ hoveredLine: line }),
  setSelectedInstruction: (instruction) =>
    set({ selectedInstruction: instruction }),
  setSelectedFlowStepId: (stepId) => set({ selectedFlowStepId: stepId }),
  setExecutionMode: (mode) => set({ executionMode: mode }),
  setCurrentScenario: (scenario) => set({ currentScenario: scenario }),
  setExecutionResult: (result) => set({ executionResult: result }),
  setIsExecuting: (executing) => set({ isExecuting: executing }),
  setCurrentFunctionSpec: (spec) => set({ currentFunctionSpec: spec }),
  executeScenario: async (scenario: string, instruction?: string, stepId?: string) => {
    const templateId = get().templateId;
    if (!templateId) return;
    const executionMode = get().executionMode;
    const startedAt = Date.now();
    if (executionMode === "live") {
      markFirstTxStart();
      void trackEvent({
        event: "execution_start",
        templateId,
        stepId,
        metadata: { scenario, instruction },
      });
    }
    set({ isExecuting: true, currentScenario: scenario });
    try {
      const runnerUrl =
        process.env.NEXT_PUBLIC_RUNNER_URL || "http://localhost:3002";
      const res = await fetch(`${runnerUrl}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          scenario,
          instruction: instruction || scenario,
        }),
      });
      if (!res.ok) {
        throw new Error(`Execution failed (${res.status})`);
      }
      const result = await res.json();
      set({ executionResult: result });
      if (executionMode === "live") {
        const durationMs = Date.now() - startedAt;
        if (result?.success) {
          void trackEvent({
            event: "execution_success",
            templateId,
            stepId,
            success: true,
            durationMs,
            metadata: { scenario, instruction },
          });
          if (stepId) {
            void trackEvent({
              event: "step_complete",
              templateId,
              stepId,
              success: true,
            });
          }
          markFirstTxSuccess();
        } else {
          void trackEvent({
            event: "execution_failed",
            templateId,
            stepId,
            success: false,
            durationMs,
            metadata: { scenario, instruction },
          });
        }
      }
    } catch (error) {
      console.error("Execution error:", error);
      set({
        executionResult: {
          success: false,
          scenario,
          accountsBefore: [],
          accountsAfter: [],
          logs: [],
          computeUnits: 0,
          trace: [],
          error: error instanceof Error ? error.message : String(error),
        },
      });
      if (executionMode === "live") {
        void trackEvent({
          event: "execution_failed",
          templateId,
          stepId,
          success: false,
          durationMs: Date.now() - startedAt,
          metadata: { scenario, instruction },
        });
      }
    } finally {
      set({ isExecuting: false });
    }
  },
  reset: () => set(initialState),
}));
