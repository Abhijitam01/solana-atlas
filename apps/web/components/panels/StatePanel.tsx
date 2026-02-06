"use client";

import { usePlaygroundStore } from "@/stores/playground";
import { useTemplate } from "@/hooks/use-templates";
import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { HelpIcon } from "@/components/ui/HelpIcon";
import { useSettingsStore } from "@/stores/settings";
import { shallow } from "zustand/shallow";
import type { LineExplanation } from "@solana-playground/types";

export function StatePanel() {
  const params = useParams();
  const templateId = params.templateId as string;
  const { data: template, isLoading } = useTemplate(templateId);
  const {
    hoveredLine,
    currentFunctionSpec,
    setCurrentFunctionSpec,
    code,
  } = usePlaygroundStore(
    (state) => ({
      hoveredLine: state.hoveredLine,
      currentFunctionSpec: state.currentFunctionSpec,
      setCurrentFunctionSpec: state.setCurrentFunctionSpec,
      code: state.code,
    }),
    shallow
  );
  const { explanationsEnabled, setExplanationsEnabled } = useSettingsStore();
  const lineExplanations = useMemo(
    () => (template?.explanations ?? []) as LineExplanation[],
    [template?.explanations]
  );

  const lineText = useMemo(() => {
    if (hoveredLine === null) return null;
    const lines = code.split("\n");
    return lines[hoveredLine - 1] ?? "";
  }, [code, hoveredLine]);

  const lookupLineExplanation = useMemo(() => {
    if (hoveredLine === null) return null;
    const exact = lineExplanations.find(
      (entry: LineExplanation) => entry.line === hoveredLine
    );
    if (exact) {
      return exact;
    }
    if (!lineText) return null;
    const trimmed = lineText.trim();
    if (!trimmed) return null;
    return null;
  }, [hoveredLine, lineExplanations, lineText]);

  useEffect(() => {
    if (!explanationsEnabled) {
      setCurrentFunctionSpec(null);
      return;
    }
    if (hoveredLine !== null && template?.functionSpecs?.length) {
      const spec = template.functionSpecs.find(
        (entry: typeof template.functionSpecs[number]) =>
          hoveredLine >= entry.lineRange[0] && hoveredLine <= entry.lineRange[1]
      );
      setCurrentFunctionSpec(spec || null);
    } else {
      setCurrentFunctionSpec(null);
    }
  }, [hoveredLine, template, setCurrentFunctionSpec, explanationsEnabled]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel flex h-full flex-col"
      >
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Explanation</h2>
        </div>
      </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="panel flex min-h-[420px] flex-col"
    >
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Explanation</h2>
        </div>
        <HelpIcon
          content="Cursor-driven explanation of the function you're inside."
          side="left"
        />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {!explanationsEnabled && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-xs text-muted-foreground">
              Explanations are off
            </div>
            <div className="mt-4">
              <button
                onClick={() => setExplanationsEnabled(true)}
                className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
              >
                Enable explanations
              </button>
            </div>
          </div>
        )}

        {explanationsEnabled && currentFunctionSpec && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Function Focus: {currentFunctionSpec.title}
            </h3>
            <AnimatePresence>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 overflow-hidden"
              >
                <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-4">
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                      <span>What It Does</span>
                      <Badge variant="info" size="sm">Intent</Badge>
                    </div>
                    <div className="text-sm text-foreground leading-relaxed">
                      {currentFunctionSpec.does}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                      <span>Why It Exists</span>
                      <Badge variant="info" size="sm">Concept</Badge>
                    </div>
                    <div className="text-sm text-foreground leading-relaxed">
                      {currentFunctionSpec.why}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                      <span>What Breaks If Removed</span>
                      <Badge variant="destructive" size="sm">Critical</Badge>
                    </div>
                    <div className="text-sm text-destructive leading-relaxed">
                      {currentFunctionSpec.breaksIfRemoved}
                    </div>
                  </div>
                  {currentFunctionSpec.securityImplications && (
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                        <span>Security Implications</span>
                        <Badge variant="warning" size="sm">Security</Badge>
                      </div>
                      <div className="text-sm text-foreground leading-relaxed">
                        {currentFunctionSpec.securityImplications}
                      </div>
                    </div>
                  )}
                  {currentFunctionSpec.concepts.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                        <span>Concepts</span>
                        <Badge variant="success" size="sm">Solana</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {currentFunctionSpec.concepts.map((concept) => (
                          <Badge key={concept} variant="info" size="sm">
                            {concept}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.section>
        )}

        {explanationsEnabled &&
          !currentFunctionSpec &&
          lookupLineExplanation &&
          typeof lookupLineExplanation !== "string" && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Line Focus
            </h3>
            <div className="p-4 rounded-lg bg-muted/20 border border-border text-sm text-foreground space-y-3">
              <div className="text-sm text-foreground">{lookupLineExplanation.summary}</div>
              {lookupLineExplanation.why && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold text-muted-foreground">Why:</span>{" "}
                  {lookupLineExplanation.why}
                </div>
              )}
              {lookupLineExplanation.risk && (
                <div className="text-xs text-warning">
                  <span className="font-semibold text-warning">Risk:</span>{" "}
                  {lookupLineExplanation.risk}
                </div>
              )}
              {lookupLineExplanation.concepts && lookupLineExplanation.concepts.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {lookupLineExplanation.concepts.map((concept) => (
                    <Badge key={concept} variant="info" size="sm">
                      {concept}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </motion.section>
        )}

        {explanationsEnabled && !currentFunctionSpec && lookupLineExplanation === null && (
          <div className="text-center py-12">
            <div className="inline-block p-4 rounded-full bg-muted mb-4">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Hover inside a function to see its intent and impact
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
