"use client";

import { Layers, ChevronRight } from "lucide-react";
import { useExecutionStore } from "@/stores/execution";
import { usePlaygroundStore } from "@/stores/playground";
import { shallow } from "zustand/shallow";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";

export function CallStackPanel() {
  const { currentStep } = useExecutionStore();
  const { setSelectedLine } = usePlaygroundStore(
    (state) => ({ setSelectedLine: state.setSelectedLine }),
    shallow
  );

  const stack = currentStep?.stack || [];

  const handleStackFrameClick = (frame: string) => {
    // Extract line number from stack frame if possible
    const lineMatch = frame.match(/line (\d+)/i);
    if (lineMatch && lineMatch[1]) {
      const lineNumber = parseInt(lineMatch[1], 10);
      setSelectedLine(lineNumber);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel flex h-full flex-col"
    >
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Call Stack</h2>
          {stack.length > 0 && (
            <Badge variant="info" size="sm">
              {stack.length}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {stack.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No call stack available. Start execution to see the call stack.
          </div>
        ) : (
          <div className="space-y-2">
            {stack.map((frame: string | undefined, index: number) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  if (frame) {
                    handleStackFrameClick(frame);
                  }
                }}
                className={`w-full text-left p-3 rounded-xl border transition-all duration-fast ${
                  index === 0
                    ? "bg-primary-light/50 border-primary"
                    : "bg-muted/30 border-border hover:bg-muted/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ChevronRight
                    className={`w-4 h-4 ${
                      index === 0 ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="text-xs font-mono text-foreground">
                      {frame || ""}
                    </div>
                    {index === 0 && (
                      <Badge variant="info" size="sm" className="mt-1">
                        Current
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
