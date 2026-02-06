"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ListChecks, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProgramStore } from "@/stores/programs";
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

  const items = useMemo(() => activeProgram?.checklist ?? [], [activeProgram]);
  const todoCount = useMemo(() => {
    if (!activeProgram || activeProgram.source !== "custom") return 0;
    return activeProgram.code.split("\n").filter((line) => line.includes("TODO")).length;
  }, [activeProgram]);

  if (!activeProgram || items.length === 0) return null;

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
            {items.map((item) => (
              <div
                key={item}
                className="flex items-start gap-2 rounded-lg border border-border/70 bg-muted/20 px-3 py-2"
              >
                <CheckCircle2
                  className={`h-4 w-4 mt-0.5 ${
                    explanationsEnabled ? "text-success" : "text-muted-foreground"
                  }`}
                />
                <div className="text-sm text-foreground">{item}</div>
              </div>
            ))}
            <div className="text-xs text-muted-foreground pt-2">
              Checklist updates automatically as steps pass.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
