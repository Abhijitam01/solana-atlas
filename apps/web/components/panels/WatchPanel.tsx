"use client";

import { Eye, Plus, X } from "lucide-react";
import { useExecutionStore } from "@/stores/execution";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";

export function WatchPanel() {
  const { watchExpressions, addWatchExpression, removeWatchExpression, currentStep } =
    useExecutionStore();
  const [newExpression, setNewExpression] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (newExpression.trim()) {
      addWatchExpression(newExpression.trim());
      setNewExpression("");
      setIsAdding(false);
    }
  };

  const evaluateExpression = (expression: string): any => {
    if (!currentStep) return "N/A";
    
    // Simple evaluation - in real implementation, would parse and evaluate
    // For now, just check if it matches account keys
    const accountKey = expression.trim();
    if (currentStep.accounts[accountKey]) {
      return currentStep.accounts[accountKey];
    }
    
    // Try to find partial matches
    const matchingKey = Object.keys(currentStep.accounts).find((key) =>
      key.toLowerCase().includes(accountKey.toLowerCase())
    );
    if (matchingKey) {
      return currentStep.accounts[matchingKey];
    }
    
    return "Not found";
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "null";
    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel flex h-full flex-col"
    >
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Watch</h2>
        </div>
        <Tooltip content="Add watch expression">
          <button
            onClick={() => setIsAdding(true)}
            className="rounded-lg p-1 transition-colors hover:bg-muted/60"
            aria-label="Add watch"
          >
            <Plus className="w-4 h-4 text-muted-foreground" />
          </button>
        </Tooltip>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 rounded-lg bg-muted/30 border border-border"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={newExpression}
                onChange={(e) => setNewExpression(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAdd();
                  } else if (e.key === "Escape") {
                    setIsAdding(false);
                    setNewExpression("");
                  }
                }}
                placeholder="Enter expression..."
                className="flex-1 px-2 py-1 text-sm rounded border border-border bg-background text-foreground focus-ring"
                autoFocus
              />
              <button
                onClick={handleAdd}
                className="px-3 py-1 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewExpression("");
                }}
                className="p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        )}

        {watchExpressions.length === 0 && !isAdding && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No watch expressions. Click + to add one.
          </div>
        )}

        <AnimatePresence>
          {watchExpressions.map((expression, index) => {
            const value = evaluateExpression(expression);
            const isFound = value !== "Not found" && value !== "N/A";

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="p-3 rounded-lg bg-muted/30 border border-border"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-xs font-mono text-foreground font-semibold">
                      {expression}
                    </div>
                    {!isFound && (
                      <Badge variant="destructive" size="sm" className="mt-1">
                        Not found
                      </Badge>
                    )}
                  </div>
                  <button
                    onClick={() => removeWatchExpression(index)}
                    className="p-1 rounded-lg hover:bg-muted transition-colors"
                    aria-label="Remove"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
                {isFound && (
                  <div className="mt-2 p-2 rounded bg-background border border-border">
                    <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-words">
                      {formatValue(value)}
                    </pre>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
