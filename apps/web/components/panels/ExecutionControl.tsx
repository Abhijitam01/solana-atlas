"use client";

import { Play, Pause, Square, RotateCcw, SkipForward, ArrowDown, ArrowUp } from "lucide-react";
import { useExecutionStore } from "@/stores/execution";
import { usePlaygroundStore } from "@/stores/playground";
import { shallow } from "zustand/shallow";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";

interface ExecutionControlProps {
  variant?: "panel" | "inline";
}

export function ExecutionControl({ variant = "panel" }: ExecutionControlProps) {
  const {
    executionState,
    currentStep,
    currentStepIndex,
    steps,
    setExecutionState,
    setCurrentStepIndex,
    reset,
  } = useExecutionStore();
  const { setSelectedLine } = usePlaygroundStore(
    (state) => ({ setSelectedLine: state.setSelectedLine }),
    shallow
  );

  const handlePlay = () => {
    setExecutionState("running");
    // TODO: Resume execution
  };

  const handlePause = () => {
    setExecutionState("paused");
    // TODO: Pause execution
  };

  const handleStop = () => {
    setExecutionState("idle");
    reset();
  };

  const handleStepOver = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      if (steps[nextIndex]) {
        setSelectedLine(steps[nextIndex].line);
      }
    } else {
      setExecutionState("finished");
    }
  };

  const handleStepInto = () => {
    // TODO: Step into function call
    handleStepOver();
  };

  const handleStepOut = () => {
    // TODO: Step out of current function
    handleStepOver();
  };

  const handleReset = () => {
    reset();
    setExecutionState("idle");
    setSelectedLine(null);
  };

  const isRunning = executionState === "running";
  const isPaused = executionState === "paused";
  const isStepping = executionState === "stepping";
  const canStep = isPaused || isStepping || executionState === "idle";
  const hasSteps = steps.length > 0;
  const playbackEnabled = false;

  const content = (
    <div className={variant === "panel" ? "flex-1 p-4 space-y-4" : "space-y-4"}>
        {/* Control Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {!isRunning ? (
            <Tooltip content={playbackEnabled ? "Start execution" : "Playback coming soon"}>
              <button
                onClick={handlePlay}
                disabled={!hasSteps || !playbackEnabled}
                className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Play"
              >
                <Play className="w-4 h-4" />
              </button>
            </Tooltip>
          ) : (
            <Tooltip content={playbackEnabled ? "Pause execution" : "Playback coming soon"}>
              <button
                onClick={handlePause}
                disabled={!playbackEnabled}
                className="p-2 rounded-lg bg-warning text-warning-foreground hover:bg-warning/90 transition-colors"
                aria-label="Pause"
              >
                <Pause className="w-4 h-4" />
              </button>
            </Tooltip>
          )}

          <Tooltip content="Stop execution">
            <button
              onClick={handleStop}
              disabled={executionState === "idle"}
              className="p-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Stop"
            >
              <Square className="w-4 h-4" />
            </button>
          </Tooltip>

          <div className="w-px h-6 bg-border" />

          <Tooltip content="Step over (execute current line)">
            <button
              onClick={handleStepOver}
              disabled={!canStep || !hasSteps}
              className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Step over"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </Tooltip>

          <Tooltip content={playbackEnabled ? "Step into (enter function)" : "Step into coming soon"}>
            <button
              onClick={handleStepInto}
              disabled={!canStep || !hasSteps || !playbackEnabled}
              className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Step into"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </Tooltip>

          <Tooltip content={playbackEnabled ? "Step out (exit function)" : "Step out coming soon"}>
            <button
              onClick={handleStepOut}
              disabled={!canStep || !hasSteps || !playbackEnabled}
              className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Step out"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </Tooltip>

          <div className="w-px h-6 bg-border" />

          <Tooltip content="Reset execution">
            <button
              onClick={handleReset}
              className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
              aria-label="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>

        {/* Step Info */}
        {currentStep && (
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <div className="text-xs font-semibold text-muted-foreground mb-2">
              Current Step
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Line:</span>
                <span className="font-mono text-foreground">{currentStep.line}</span>
              </div>
              {currentStep.instruction && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Instruction:</span>
                  <span className="font-mono text-foreground text-xs">
                    {currentStep.instruction}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Step:</span>
                <span className="text-foreground">
                  {currentStepIndex + 1} / {steps.length}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Progress */}
        {steps.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground">
              Execution Progress
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
                }}
                className="h-full bg-primary rounded-full transition-all duration-300"
              />
            </div>
          </div>
        )}
    </div>
  );

  if (variant === "inline") {
    return <div className="rounded-lg border border-border bg-muted/20 p-4">{content}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel flex h-full flex-col"
    >
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Play className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Execution Control</h2>
        </div>
        {executionState !== "idle" && (
          <Badge
            variant={
              executionState === "running"
                ? "success"
                : executionState === "paused"
                ? "warning"
                : "info"
            }
            size="sm"
          >
            {executionState}
          </Badge>
        )}
      </div>
      {content}
    </motion.div>
  );
}
