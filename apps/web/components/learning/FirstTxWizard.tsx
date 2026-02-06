"use client";

import { useEffect, useMemo, useState } from "react";
import { Rocket, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlaygroundStore } from "@/stores/playground";
import { shallow } from "zustand/shallow";
import { useLearningPathStore } from "@/stores/learning-path";
import { Badge } from "@/components/ui/Badge";

export function FirstTxWizard() {
  const { templateId, executionResult, executionMode } = usePlaygroundStore(
    (state) => ({
      templateId: state.templateId,
      executionResult: state.executionResult,
      executionMode: state.executionMode,
    }),
    shallow
  );
  const { firstTxCompleted, markFirstTxComplete } = useLearningPathStore();
  const [isOpen, setIsOpen] = useState(true);

  const isHelloSolana = templateId === "hello-solana";
  const success = executionResult?.success && executionMode === "live";

  const steps = useMemo(
    () => [
      {
        id: "open-template",
        title: "Open Hello Solana",
        description: "Start with the Hello Solana template.",
        complete: isHelloSolana,
      },
      {
        id: "run-live",
        title: "Run Live Transaction",
        description: "Execute the live instruction and confirm it succeeds.",
        complete: Boolean(success && isHelloSolana),
      },
    ],
    [isHelloSolana, success]
  );

  useEffect(() => {
    if (!firstTxCompleted && isHelloSolana && success) {
      markFirstTxComplete();
    }
  }, [firstTxCompleted, isHelloSolana, success, markFirstTxComplete]);

  if (firstTxCompleted || !isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 left-6 z-40 w-[360px] rounded-xl border border-border bg-card shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Rocket className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              First Transaction
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
        <div className="space-y-3 p-4">
          <div className="text-xs text-muted-foreground">
            Complete these steps to unlock your first on-chain execution.
          </div>
          <div className="space-y-2">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className={`rounded-lg border px-3 py-2 ${
                  step.complete
                    ? "border-success bg-success-light/20"
                    : "border-border bg-muted/20"
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    {step.complete ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        Step {idx + 1}: {step.title}
                      </span>
                      {step.complete && (
                        <Badge variant="success" size="sm">
                          Done
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  {!step.complete && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            ))}
          </div>
          {executionMode !== "live" && (
            <div className="rounded-lg border border-warning/40 bg-warning-light/20 p-2 text-xs text-warning">
              Switch to `Live` mode in the Execution panel to run a real transaction.
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
