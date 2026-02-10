"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ListChecks, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProgramStore } from "@/stores/programs";
import { usePlaygroundStore } from "@/stores/playground";
import { useSettingsStore } from "@/stores/settings";
import { shallow } from "zustand/shallow";

export function ProgramChecklistPanel() {
  const { activeProgram } = useProgramStore(
    (state) => ({
      activeProgram: state.activeProgramId ? state.programs[state.activeProgramId] : null,
    }),
    shallow
  );
  const { explanationsEnabled } = useSettingsStore(
    (state) => ({ explanationsEnabled: state.explanationsEnabled }),
    shallow
  );

  const [collapsed, setCollapsed] = useState(false);

  const { setSelectedLine } = usePlaygroundStore(
    (state) => ({
      setSelectedLine: state.setSelectedLine,
    }),
    shallow
  );

  const items = useMemo(() => activeProgram?.checklist ?? [], [activeProgram]);
  const hasChecklistItems = items.length > 0;
  const todoCount = useMemo(() => {
    if (!activeProgram || activeProgram.source !== "custom") return 0;
    return activeProgram.code.split("\n").filter((line) => line.includes("TODO")).length;
  }, [activeProgram]);

  if (!activeProgram) {
    return (
      <div className="panel flex min-h-[200px] items-center justify-center text-muted-foreground text-xs p-4 border-l border-border/70 bg-card/70 backdrop-blur">
        No active program selected.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="panel flex min-h-[200px] flex-col"
    >
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Checklist</h2>
          {todoCount > 0 && (
            <span className="rounded-full bg-warning-light px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning">
              {todoCount} TODO
            </span>
          )}
        </div>
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="btn-ghost text-xs"
        >
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2"
          >
            {hasChecklistItems ? (
              <>
                {items.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      if (!activeProgram) return;
                      const lines = activeProgram.code.split("\n");
                      let lineNumber =
                        lines.findIndex((line) => line.toLowerCase().includes(item.toLowerCase())) + 1;
                      if (lineNumber === 0) {
                        const todoIndex = lines.findIndex((line) => line.includes("TODO"));
                        lineNumber = todoIndex >= 0 ? todoIndex + 1 : 1;
                      }
                      setSelectedLine(lineNumber);
                    }}
                    className="w-full text-left flex items-start gap-2 rounded-lg border border-border/70 bg-muted/20 px-3 py-2 hover:bg-muted/40 transition-colors"
                  >
                    <CheckCircle2
                      className={`h-4 w-4 mt-0.5 ${
                        explanationsEnabled ? "text-success" : "text-muted-foreground"
                      }`}
                    />
                    <div className="text-sm text-foreground">{item}</div>
                  </button>
                ))}
                <div className="text-xs text-muted-foreground pt-2">
                  Checklist updates automatically as steps pass.
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground leading-relaxed">
                This program does not ship with checklist steps yet. Add a{" "}
                <span className="font-mono text-foreground">checklist.json</span> to the template
                folder under <span className="font-mono text-foreground">packages/solana/templates</span>{" "}
                and export an array of strings, or rely on the fallback steps defined in the API.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
