"use client";

import { Lightbulb, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { usePlaygroundStore } from "@/stores/playground";
import { useEffect, useState } from "react";
import { shallow } from "zustand/shallow";

interface ContextualHint {
  id: string;
  line: number;
  hint: string;
  type: "info" | "warning" | "tip";
}

export function ContextualHints() {
  const { hoveredLine, currentFunctionSpec } = usePlaygroundStore(
    (state) => ({
      hoveredLine: state.hoveredLine,
      currentFunctionSpec: state.currentFunctionSpec,
    }),
    shallow
  );
  const [hints, setHints] = useState<ContextualHint[]>([]);
  const [dismissedHints, setDismissedHints] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (hoveredLine && currentFunctionSpec) {
      // Generate contextual hints based on function intent
      const newHints: ContextualHint[] = [];

      if (currentFunctionSpec.concepts.length > 0) {
        newHints.push({
          id: `concepts-${hoveredLine}`,
          line: hoveredLine,
          hint: `Concepts in play: ${currentFunctionSpec.concepts.join(", ")}`,
          type: "info",
        });
      }

      if (currentFunctionSpec.breaksIfRemoved) {
        newHints.push({
          id: `warning-${hoveredLine}`,
          line: hoveredLine,
          hint: `Critical: ${currentFunctionSpec.breaksIfRemoved}`,
          type: "warning",
        });
      }

      if (currentFunctionSpec.securityImplications) {
        newHints.push({
          id: `security-${hoveredLine}`,
          line: hoveredLine,
          hint: `Security: ${currentFunctionSpec.securityImplications}`,
          type: "tip",
        });
      }

      setHints(newHints);
    } else {
      setHints([]);
    }
  }, [hoveredLine, currentFunctionSpec]);

  const visibleHints = hints.filter((h) => !dismissedHints.has(h.id));

  if (visibleHints.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-40 space-y-2 max-w-sm">
      <AnimatePresence>
        {visibleHints.map((hint) => (
          <motion.div
            key={hint.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`p-4 rounded-lg border shadow-xl ${
              hint.type === "warning"
                ? "bg-warning-light border-warning"
                : hint.type === "tip"
                ? "bg-info-light border-info"
                : "bg-primary-light border-primary"
            }`}
          >
            <div className="flex items-start gap-2">
              <Lightbulb
                className={`w-5 h-5 flex-shrink-0 ${
                  hint.type === "warning"
                    ? "text-warning"
                    : hint.type === "tip"
                    ? "text-info"
                    : "text-primary"
                }`}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant={
                      hint.type === "warning"
                        ? "warning"
                        : hint.type === "tip"
                        ? "info"
                        : "default"
                    }
                    size="sm"
                  >
                    {hint.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Line {hint.line}</span>
                </div>
                <p className="text-sm text-foreground">{hint.hint}</p>
              </div>
              <button
                onClick={() => setDismissedHints((prev) => new Set([...prev, hint.id]))}
                className="p-1 rounded-lg hover:bg-background/50 transition-colors flex-shrink-0"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
