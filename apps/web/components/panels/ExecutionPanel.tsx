"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Rocket, ChevronDown, ChevronUp, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTemplate } from "@/hooks/use-templates";
import { usePlaygroundStore } from "@/stores/playground";
import { useExecutionStore } from "@/stores/execution";
import { ExecutionControl } from "@/components/panels/ExecutionControl";
import { HelpIcon } from "@/components/ui/HelpIcon";
import { Badge } from "@/components/ui/Badge";
import { StateDiff } from "@/components/ui/StateDiff";
import { StateTimeline, TimelineStep } from "@/components/ui/StateTimeline";
import { decodeExecutionError } from "@/lib/error-decoder";
import { shallow } from "zustand/shallow";
import type {
  AccountState,
  AccountStateAfter,
  ExecutionResult,
  ExecutionScenario,
  FlowStep,
} from "@solana-playground/types";

export function ExecutionPanel() {
  const params = useParams();
  const templateId = params.templateId as string;
  const { data: template, isLoading } = useTemplate(templateId);
  const {
    executionMode,
    setExecutionMode,
    currentScenario,
    setCurrentScenario,
    executionResult,
    setExecutionResult,
    setSelectedLine,
    selectedFlowStepId,
    setSelectedFlowStepId,
    executeScenario,
    isExecuting,
  } = usePlaygroundStore(
    (state) => ({
      executionMode: state.executionMode,
      setExecutionMode: state.setExecutionMode,
      currentScenario: state.currentScenario,
      setCurrentScenario: state.setCurrentScenario,
      executionResult: state.executionResult,
      setExecutionResult: state.setExecutionResult,
      setSelectedLine: state.setSelectedLine,
      selectedFlowStepId: state.selectedFlowStepId,
      setSelectedFlowStepId: state.setSelectedFlowStepId,
      executeScenario: state.executeScenario,
      isExecuting: state.isExecuting,
    }),
    shallow
  );
  const { executionState } = useExecutionStore();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["flow", "results"])
  );
  const [viewMode, setViewMode] = useState<"comparison" | "timeline">("comparison");
  const [lastRun, setLastRun] = useState<{
    name: string;
    at: number;
    status?: "success" | "failed";
  } | null>(null);

  const scenarios: ExecutionScenario[] = useMemo(
    () => template?.precomputedState?.scenarios ?? [],
    [template?.precomputedState?.scenarios]
  );
  const flow: FlowStep[] = useMemo(
    () => template?.programMap?.flow ?? [],
    [template?.programMap?.flow]
  );

  useEffect(() => {
    if (
      template?.precomputedState?.scenarios.length &&
      !currentScenario &&
      executionMode === "precomputed"
    ) {
      setCurrentScenario(template.precomputedState.scenarios[0].name);
    }
  }, [template, currentScenario, executionMode, setCurrentScenario]);

  const scenario: ExecutionScenario | null = useMemo(() => {
    if (executionMode !== "precomputed") return null;
    if (scenarios.length === 0) return null;
    const match = scenarios.find((s) => s.name === currentScenario);
    return match ?? scenarios[0]!;
  }, [executionMode, scenarios, currentScenario]);

  const accountsBefore: AccountState[] = useMemo(
    () => executionResult?.accountsBefore || scenario?.accountsBefore || [],
    [scenario, executionResult]
  );
  const accountsAfter: AccountStateAfter[] = useMemo(
    () => executionResult?.accountsAfter || scenario?.accountsAfter || [],
    [scenario, executionResult]
  );
  const logs: string[] = useMemo(
    () => executionResult?.logs || scenario?.logs || [],
    [scenario, executionResult]
  );
  const trace: ExecutionResult["trace"] = useMemo(
    () => executionResult?.trace || [],
    [executionResult]
  );
  const decodedError = useMemo(
    () => decodeExecutionError(executionResult?.error),
    [executionResult?.error]
  );

  const timelineSteps: TimelineStep[] = useMemo(() => {
    return [
      {
        id: "before",
        label: "Initial State",
        timestamp: Date.now() - 10000,
        state: accountsBefore.reduce((acc: Record<string, AccountState>, account) => {
          acc[account.address] = account;
          return acc;
        }, {}),
        completed: true,
      },
      {
        id: "after",
        label: "Final State",
        timestamp: Date.now(),
        state: accountsAfter.reduce((acc: Record<string, AccountStateAfter>, account) => {
          acc[account.address] = account;
          return acc;
        }, {}),
        completed: true,
      },
    ];
  }, [accountsBefore, accountsAfter]);

  const runScenario = async (nextScenario: typeof scenarios[number], stepId?: string) => {
    setExecutionResult(null);
    setLastRun({ name: nextScenario.name, at: Date.now() });
    if (executionMode === "live") {
      await executeScenario(nextScenario.name, nextScenario.instruction, stepId);
      return;
    }
    setExecutionMode("precomputed");
    setCurrentScenario(nextScenario.name);
    setExecutionResult({
      success: true,
      scenario: nextScenario.name,
      accountsBefore: nextScenario.accountsBefore,
      accountsAfter: nextScenario.accountsAfter,
      logs: nextScenario.logs,
      computeUnits: nextScenario.computeUnits,
      trace: [],
    });
  };

  const runStep = (stepId: string) => {
    const match =
      scenarios.find((s) => s.instruction === stepId) ||
      scenarios.find((s) => s.name.toLowerCase().includes(stepId.toLowerCase())) ||
      undefined;
    if (match) {
      setSelectedFlowStepId(stepId);
      void runScenario(match, stepId);
    }
  };

  useEffect(() => {
    if (!executionResult) return;
    setLastRun((prev) =>
      prev
        ? {
            ...prev,
            status: executionResult.success ? "success" : "failed",
          }
        : prev
    );
  }, [executionResult]);

  const toggleSection = (section: string) => {
    const next = new Set(expandedSections);
    if (next.has(section)) {
      next.delete(section);
    } else {
      next.add(section);
    }
    setExpandedSections(next);
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel flex h-full flex-col"
        data-panel="execution"
      >
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Rocket className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Execution</h2>
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
        transition={{ duration: 0.3, delay: 0.25 }}
        className="panel flex min-h-[420px] flex-col"
        data-panel="execution"
      >
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Rocket className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Execution</h2>
          {(executionState !== "idle" || isExecuting) && (
            <Badge variant="info" size="sm" className="animate-pulse">
              {isExecuting ? "running" : executionState}
            </Badge>
          )}
          {lastRun && (
            <Badge
              variant={lastRun.status === "failed" ? "destructive" : "success"}
              size="sm"
            >
              {lastRun.status === "failed" ? "failed" : "last run"}
            </Badge>
          )}
        </div>
        <HelpIcon
          content="Run individual steps or full scenarios and inspect state changes."
          side="left"
        />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Execution Mode
            </h3>
            <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-1 shadow-inner">
              <button
                onClick={() => setExecutionMode("precomputed")}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  executionMode === "precomputed"
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Precomputed
              </button>
              <button
                onClick={() => setExecutionMode("live")}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  executionMode === "live"
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Live
              </button>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {executionMode === "precomputed"
              ? "Instant, deterministic snapshots for learning. No real transactions."
              : "Runs a real transaction and streams logs from the validator/backend."}
          </div>
        </section>

        <ExecutionControl variant="inline" />

        <section className="space-y-3">
          <button
            onClick={() => toggleSection("flow")}
            className="w-full flex items-center justify-between text-left"
          >
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Step Runner
            </h3>
            {expandedSections.has("flow") ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          <AnimatePresence>
            {expandedSections.has("flow") && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2 overflow-hidden"
              >
                {flow.length === 0 && (
                  <div className="text-xs text-muted-foreground">
                    No flow steps found for this template.
                  </div>
                )}
                {flow.map((step) => (
                  <div
                    key={step.id}
                    className={`p-3 rounded-lg border flex items-center justify-between gap-3 ${
                      selectedFlowStepId === step.id
                        ? "bg-primary-light/40 border-primary/60"
                        : "bg-muted/20 border-border"
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSelectedFlowStepId(step.id);
                        if (step.lineRange?.[0]) {
                          setSelectedLine(step.lineRange[0]);
                        }
                      }}
                      className="text-left flex-1"
                    >
                      <div className="text-sm font-semibold text-foreground">
                        {step.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {step.description}
                      </div>
                    </button>
                    <button
                      onClick={() => runStep(step.id)}
                      className="btn-primary text-xs"
                    >
                      <Play className="w-3 h-3" />
                      Run
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section className="space-y-3">
          <button
            onClick={() => toggleSection("results")}
            className="w-full flex items-center justify-between text-left"
          >
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Results
            </h3>
            {expandedSections.has("results") ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          <AnimatePresence>
            {expandedSections.has("results") && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {scenario?.description || "Select a scenario or run a step."}
                  </div>
                  {executionMode === "precomputed" && scenarios.length > 1 && (
                    <select
                      value={currentScenario || scenarios[0]?.name || ""}
                      onChange={(e) => setCurrentScenario(e.target.value)}
                      className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground transition-all duration-fast focus-ring"
                    >
                      {scenarios.map((s) => (
                        <option key={s.name} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                {scenario && (
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="info" size="sm">
                      Instruction: {scenario.instruction}
                    </Badge>
                    <Badge variant="default" size="sm">
                      Compute Units: {executionResult?.computeUnits ?? scenario.computeUnits}
                    </Badge>
                  </div>
                )}

                {executionResult && executionResult.success === false && (
                  <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive space-y-2">
                    <div className="font-semibold">
                      {decodedError?.title || "Execution Failed"}
                    </div>
                    <div className="text-destructive/90">
                      {decodedError?.summary ||
                        executionResult.error ||
                        "Execution failed. Check logs for details."}
                    </div>
                    {decodedError?.fixes?.length ? (
                      <ul className="list-disc pl-4 text-destructive/90 space-y-1">
                        {decodedError.fixes.map((fix) => (
                          <li key={fix}>{fix}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                )}

            <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-1 w-fit shadow-inner">
                  <button
                    onClick={() => setViewMode("comparison")}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      viewMode === "comparison"
                        ? "bg-background text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Comparison
                  </button>
                  <button
                    onClick={() => setViewMode("timeline")}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      viewMode === "timeline"
                        ? "bg-background text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Timeline
                  </button>
                </div>

                {viewMode === "comparison" ? (
                  <div className="space-y-4">
                    {accountsBefore.map((account) => {
                      const accountAfter = accountsAfter.find(
                        (a) => a.address === account.address
                      );
                      if (!accountAfter) return null;

                      return (
                        <motion.div
                          key={account.address}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 rounded-lg bg-muted/30 border border-border"
                        >
                          <div className="text-xs font-semibold text-muted-foreground mb-3 font-mono">
                            {account.label}
                          </div>
                          <StateDiff
                            before={{
                              lamports: account.lamports,
                              data: account.data,
                            }}
                            after={{
                              lamports: accountAfter.lamports,
                              data: accountAfter.data,
                              changes: accountAfter.changes,
                            }}
                            label="State Changes"
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <StateTimeline
                    steps={timelineSteps}
                    currentStep={1}
                    onStepClick={() => {}}
                  />
                )}

                {trace.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-2">
                      <span>Instruction Trace</span>
                      <Badge variant="info" size="sm">
                        Trace
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {trace.map((entry, idx) => (
                        <div
                          key={`${entry.program}-${idx}`}
                          className="rounded-lg border border-border bg-muted/20 p-3"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono text-foreground">
                              {entry.program}
                            </span>
                            <Badge
                              variant={
                                entry.status === "success"
                                  ? "success"
                                  : entry.status === "failed"
                                  ? "destructive"
                                  : "default"
                              }
                              size="sm"
                            >
                              {entry.status}
                            </Badge>
                          </div>
                          {entry.logs.length > 0 && (
                            <div className="mt-2 space-y-1 font-mono text-xs text-muted-foreground">
                              {entry.logs.slice(0, 5).map((log, logIdx) => (
                                <div key={`${entry.program}-${logIdx}`}>{log}</div>
                              ))}
                              {entry.logs.length > 5 && (
                                <div className="text-xs text-muted-foreground">
                                  +{entry.logs.length - 5} more
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(logs.length > 0 || executionMode === "live") && (
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                      <span>Logs</span>
                      <Badge variant="info" size="sm">
                        Output
                      </Badge>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      {logs.length === 0 ? (
                        <div className="text-xs text-muted-foreground">
                          {executionMode === "precomputed"
                            ? "No logs are available for this snapshot."
                            : "Run an instruction to see live logs here."}
                        </div>
                      ) : (
                        <div className="space-y-1 font-mono text-xs">
                          {logs.map((log, idx) => (
                            <div
                              key={`${log}-${idx}`}
                              className="text-foreground flex items-start gap-2"
                            >
                              <span className="text-muted-foreground">$</span>
                              <span>{log}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </motion.div>
  );
}
