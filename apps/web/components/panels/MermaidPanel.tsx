"use client";

import { useProgramStore } from "@/stores/programs";
import { usePlaygroundStore } from "@/stores/playground";
import { useState, useRef, useEffect, useCallback } from "react";
import { GitBranch, RefreshCw, Copy, Check, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { HelpIcon } from "@/components/ui/HelpIcon";
import { shallow } from "zustand/shallow";
import { generateMermaidDiagram } from "@/app/actions/mermaid-action";
import mermaid from "mermaid";

// Initialize mermaid with dark theme
mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  themeVariables: {
    primaryColor: "#14F195",
    primaryTextColor: "#ffffff",
    primaryBorderColor: "#14F195",
    lineColor: "#8b949e",
    secondaryColor: "#1f2933",
    tertiaryColor: "#0d1117",
    fontFamily: "ui-monospace, monospace",
    fontSize: "14px",
    background: "#0d1117",
    mainBkg: "#161b22",
    nodeBorder: "#14F195",
    clusterBkg: "#161b22",
    clusterBorder: "#30363d",
    titleColor: "#c9d1d9",
    edgeLabelBackground: "#0d1117",
  },
  flowchart: {
    htmlLabels: true,
    curve: "basis",
    padding: 16,
  },
});

export function MermaidPanel() {
  const { activeProgram } = useProgramStore(
    (state) => ({
      activeProgram: state.activeProgramId
        ? state.programs[state.activeProgramId]
        : null,
    }),
    shallow
  );

  const { code } = usePlaygroundStore(
    (state) => ({
      code: state.code,
    }),
    shallow
  );

  const [mermaidDef, setMermaidDef] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);

  const renderDiagram = useCallback(async (definition: string) => {
    if (!diagramRef.current || !definition) return;

    try {
      // Clear previous content and errors
      diagramRef.current.innerHTML = "";
      setError(null);

      // Re-initialize mermaid to clear any previous error state
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        themeVariables: {
          primaryColor: "#14F195",
          primaryTextColor: "#ffffff",
          primaryBorderColor: "#14F195",
          lineColor: "#8b949e",
          secondaryColor: "#1f2933",
          tertiaryColor: "#0d1117",
          fontFamily: "ui-monospace, monospace",
          fontSize: "14px",
          background: "#0d1117",
          mainBkg: "#161b22",
          nodeBorder: "#14F195",
          clusterBkg: "#161b22",
          clusterBorder: "#30363d",
          titleColor: "#c9d1d9",
          edgeLabelBackground: "#0d1117",
        },
        flowchart: {
          htmlLabels: true,
          curve: "basis",
          padding: 16,
        },
      });

      const { svg } = await mermaid.render(
        `mermaid-diagram-${Date.now()}`,
        definition
      );
      diagramRef.current.innerHTML = svg;
    } catch (err) {
      console.error("Mermaid render error:", err);
      setError("Diagram had syntax issues. Click 'Generate' again to retry with a fresh diagram.");
    }
  }, []);

  useEffect(() => {
    if (mermaidDef) {
      renderDiagram(mermaidDef);
    }
  }, [mermaidDef, renderDiagram]);

  const handleGenerate = async () => {
    const sourceCode = code || activeProgram?.code;
    if (!sourceCode) {
      setError("No code available to generate diagram from.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const diagram = await generateMermaidDiagram(sourceCode);
      setMermaidDef(diagram);
    } catch (err) {
      console.error("Mermaid generation error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate diagram. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!mermaidDef) return;
    try {
      await navigator.clipboard.writeText(mermaidDef);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy to clipboard");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel flex h-full flex-col"
    >
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            Mermaid Diagram
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {mermaidDef && (
            <button
              onClick={handleCopy}
              className="rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              title="Copy Mermaid definition"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-green-400" />
                  <span className="text-green-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 ${
              isGenerating
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary/20 text-primary hover:bg-primary/30"
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="w-3 h-3" />
                Generate
              </>
            )}
          </button>
          <HelpIcon
            content="Generate a visual Mermaid diagram from your Solana program code using AI."
            side="left"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto relative min-h-[200px]">
        {error && (
          <div className="mx-4 mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!mermaidDef && !isGenerating && !error && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 px-4">
            <GitBranch className="w-8 h-8 opacity-40" />
            <div className="text-center">
              <p className="text-sm font-medium">No diagram generated yet</p>
              <p className="text-xs mt-1 opacity-70">
                Click &quot;Generate&quot; to create a Mermaid diagram from your
                code
              </p>
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm">Analyzing program structure...</p>
          </div>
        )}

        <div
          ref={diagramRef}
          className={`p-4 ${!mermaidDef || isGenerating ? "hidden" : ""}`}
          style={{ minHeight: 200 }}
        />

        {mermaidDef && !isGenerating && (
          <details className="mx-4 mb-4">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors py-2">
              View raw definition
            </summary>
            <pre className="text-xs bg-muted/30 rounded-lg p-3 overflow-x-auto text-muted-foreground whitespace-pre-wrap break-words">
              {mermaidDef}
            </pre>
          </details>
        )}
      </div>
    </motion.div>
  );
}
