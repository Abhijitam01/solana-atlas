"use client";

import "@/lib/monaco-setup";
import { useEffect, useMemo, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import type { editor } from "monaco-editor";
import type * as Monaco from "monaco-editor";
import { usePlaygroundStore } from "@/stores/playground";
import { Code, PanelLeftOpen, FileCode } from "lucide-react";
import { motion } from "framer-motion";
import { HelpIcon } from "@/components/ui/HelpIcon";
import { Badge } from "@/components/ui/Badge";
import { useExecutionStore } from "@/stores/execution";
import { useSettingsStore } from "@/stores/settings";
import { useProgramStore } from "@/stores/programs";
import { shallow } from "zustand/shallow";
import { useLayoutStore } from "@/stores/layout";
import { generateCodeCompletion } from "@/app/actions/ai";
import { useAutoSave } from "@/hooks/useAutoSave";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

// Theme definition singleton
let themesInitialized = false;

// Monaco editor configuration constants
const EDITOR_CONFIG = {
  fontSize: 15,
  lineHeight: 24,
  padding: { top: 12, bottom: 12 },
  hoverDelay: 200,
  maxSafeInteger: Number.MAX_SAFE_INTEGER,
} as const;

// Animation constants
const PANEL_ANIMATION = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.3, ease: "easeOut" },
} as const;

/**
 * Define custom Solana-themed Monaco editor themes
 */
const defineSolanaThemes = (monaco: typeof Monaco): void => {
  if (themesInitialized) return;

  // Dark theme with Solana-inspired colors
  monaco.editor.defineTheme("solana-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "5c6b7a", fontStyle: "italic" },
      { token: "keyword", foreground: "35c9a7", fontStyle: "bold" },
      { token: "type.identifier", foreground: "7dd3fc" },
      { token: "identifier", foreground: "e2e8f0" },
      { token: "number", foreground: "f59e0b" },
      { token: "string", foreground: "22c55e" },
      { token: "delimiter", foreground: "94a3b8" },
      { token: "operator", foreground: "38bdf8" },
      { token: "function", foreground: "c084fc" },
    ],
    colors: {
      "editor.background": "#0b0f14",
      "editor.foreground": "#e2e8f0",
      "editorLineNumber.foreground": "#334155",
      "editorLineNumber.activeForeground": "#94a3b8",
      "editor.lineHighlightBackground": "#0f172a",
      "editor.selectionBackground": "#164e63",
      "editor.inactiveSelectionBackground": "#0f2a35",
      "editorCursor.foreground": "#22d3ee",
      "editorIndentGuide.background1": "#1f2937",
      "editorIndentGuide.activeBackground1": "#334155",
      "editorWhitespace.foreground": "#1f2a37",
      "editorGutter.background": "#0b0f14",
      "editorOverviewRuler.border": "#0b0f14",
      "editorWidget.background": "#0f172a",
      "editorWidget.border": "#1f2937",
      "editorSuggestWidget.background": "#0f172a",
      "editorSuggestWidget.border": "#1f2937",
      "editorSuggestWidget.selectedBackground": "#1e293b",
      "editorSuggestWidget.foreground": "#e2e8f0",
      "editorSuggestWidget.highlightForeground": "#22d3ee",
      "editor.hoverHighlightBackground": "#0f172a",
      "editorHoverWidget.background": "#0f172a",
      "editorHoverWidget.border": "#1f2937",
      "scrollbarSlider.background": "#1f293780",
      "scrollbarSlider.hoverBackground": "#33415580",
      "scrollbarSlider.activeBackground": "#47556980",
    },
  });

  // Light theme with Solana-inspired colors
  monaco.editor.defineTheme("solana-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "64748b", fontStyle: "italic" },
      { token: "keyword", foreground: "0f766e", fontStyle: "bold" },
      { token: "type.identifier", foreground: "0284c7" },
      { token: "identifier", foreground: "0f172a" },
      { token: "number", foreground: "b45309" },
      { token: "string", foreground: "15803d" },
      { token: "delimiter", foreground: "64748b" },
      { token: "operator", foreground: "0369a1" },
      { token: "function", foreground: "7c3aed" },
    ],
    colors: {
      "editor.background": "#f8fafc",
      "editor.foreground": "#0f172a",
      "editorLineNumber.foreground": "#94a3b8",
      "editorLineNumber.activeForeground": "#475569",
      "editor.lineHighlightBackground": "#eef2f7",
      "editor.selectionBackground": "#bae6fd",
      "editor.inactiveSelectionBackground": "#e2e8f0",
      "editorCursor.foreground": "#0ea5e9",
      "editorIndentGuide.background1": "#e2e8f0",
      "editorIndentGuide.activeBackground1": "#cbd5e1",
      "editorWhitespace.foreground": "#e2e8f0",
      "editorGutter.background": "#f8fafc",
      "editorOverviewRuler.border": "#f8fafc",
      "editorWidget.background": "#ffffff",
      "editorWidget.border": "#e2e8f0",
      "editorSuggestWidget.background": "#ffffff",
      "editorSuggestWidget.border": "#e2e8f0",
      "editorSuggestWidget.selectedBackground": "#f1f5f9",
      "editorSuggestWidget.foreground": "#0f172a",
      "editorSuggestWidget.highlightForeground": "#0ea5e9",
      "editor.hoverHighlightBackground": "#f1f5f9",
      "editorHoverWidget.background": "#ffffff",
      "editorHoverWidget.border": "#e2e8f0",
      "scrollbarSlider.background": "#cbd5e180",
      "scrollbarSlider.hoverBackground": "#94a3b880",
      "scrollbarSlider.activeBackground": "#64748b80",
    },
  });

  themesInitialized = true;
};

/**
 * Enhanced CodePanel component with Monaco editor integration
 * Features:
 * - Syntax highlighting with custom Solana themes
 * - Breakpoint management
 * - Line selection and hover states
 * - TODO tracking
 * - Execution step visualization
 * - Zen mode support
 */
export function CodePanel() {
  // Store selectors with shallow comparison
  const { code, selectedLine, setSelectedLine, setHoveredLine } = usePlaygroundStore(
    (state) => ({
      code: state.code,
      selectedLine: state.selectedLine,
      setSelectedLine: state.setSelectedLine,
      setHoveredLine: state.setHoveredLine,
    }),
    shallow
  );

  const { breakpoints, toggleBreakpoint, currentStep } = useExecutionStore(
    (state) => ({
      breakpoints: state.breakpoints,
      toggleBreakpoint: state.toggleBreakpoint,
      currentStep: state.currentStep,
    }),
    shallow
  );

  const { explanationsEnabled, theme } = useSettingsStore(
    (state) => ({
      explanationsEnabled: state.explanationsEnabled,
      theme: state.theme,
    }),
    shallow
  );

  const { activeProgram, updateProgramCode } = useProgramStore(
    (state) => ({
      activeProgram: state.activeProgramId ? state.programs[state.activeProgramId] : null,
      updateProgramCode: state.updateProgramCode,
    }),
    shallow
  );

  const { zenMode, toggleZenMode } = useLayoutStore(
    (state) => ({
      zenMode: state.zenMode,
      toggleZenMode: state.toggleZenMode,
    }),
    shallow
  );

  // Refs for editor state
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);
  const decorationsRef = useRef<string[]>([]);
  const hoverDecorationsRef = useRef<string[]>([]);
  const todoDecorationsRef = useRef<string[]>([]);
  const hoverTimeoutRef = useRef<number | null>(null);

  const lastHoverLineRef = useRef<number | null>(null);
  const completionProviderRef = useRef<Monaco.IDisposable | null>(null);

  // Computed values
  const monacoTheme = useMemo(
    () => (theme === "dark" ? "solana-dark" : "solana-light"),
    [theme]
  );

  const isReadOnly = useMemo(
    () => activeProgram?.source === "template",
    [activeProgram?.source]
  );

  const todoCount = useMemo(() => {
    if (!activeProgram || activeProgram.source !== "custom") return 0;
    return activeProgram.code.split("\n").filter((line) => line.includes("TODO")).length;
  }, [activeProgram]);

  /**
   * Cleanup function for hover timeout
   */
  const clearHoverTimeout = useCallback(() => {
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  /**
   * Clear hover decorations
   */
  const clearHoverDecorations = useCallback(() => {
    if (editorRef.current) {
      hoverDecorationsRef.current = editorRef.current.deltaDecorations(
        hoverDecorationsRef.current,
        []
      );
    }
  }, []);

  /**
   * Handle mouse movement for hover effects
   */
  const handleMouseMove = useCallback(
    (e: editor.IEditorMouseEvent) => {
      if (!explanationsEnabled || !editorRef.current) return;

      const lineNumber = e.target.position?.lineNumber ?? null;
      const activeLine = selectedLine;
      const executionLine = currentStep?.line ?? null;

      // Clear hover if no line is targeted
      if (!lineNumber) {
        clearHoverDecorations();
        setHoveredLine(null);
        lastHoverLineRef.current = null;
        return;
      }

      // Don't show hover decoration on active or execution lines
      if (lineNumber === activeLine || lineNumber === executionLine) {
        clearHoverDecorations();
        if (lastHoverLineRef.current !== lineNumber) {
          lastHoverLineRef.current = lineNumber;
          setHoveredLine(lineNumber);
        }
        return;
      }

      clearHoverTimeout();

      const stickiness =
        monacoRef.current?.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges ?? 1;

      // Apply hover decoration
      hoverDecorationsRef.current = editorRef.current.deltaDecorations(
        hoverDecorationsRef.current,
        [
          {
            range: {
              startLineNumber: lineNumber,
              startColumn: 1,
              endLineNumber: lineNumber,
              endColumn: EDITOR_CONFIG.maxSafeInteger,
            },
            options: {
              className: "bg-muted/2 transition-colors duration-150",
              isWholeLine: true,
              stickiness,
            },
          },
        ]
      );

      if (lastHoverLineRef.current !== lineNumber) {
        lastHoverLineRef.current = lineNumber;
        setHoveredLine(lineNumber);
      }
    },
    [explanationsEnabled, selectedLine, currentStep, setHoveredLine, clearHoverDecorations, clearHoverTimeout]
  );

  /**
   * Handle mouse leave event
   */
  const handleMouseLeave = useCallback(() => {
    clearHoverTimeout();
    clearHoverDecorations();
    hoverTimeoutRef.current = window.setTimeout(() => {
      setHoveredLine(null);
      lastHoverLineRef.current = null;
    }, EDITOR_CONFIG.hoverDelay);
  }, [clearHoverTimeout, clearHoverDecorations, setHoveredLine]);

  /**
   * Initialize Monaco editor
   */
  const handleEditorDidMount = useCallback(
    (editor: editor.IStandaloneCodeEditor, monaco: typeof Monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      // Define and apply custom themes
      defineSolanaThemes(monaco);
      monaco.editor.setTheme(monacoTheme);

      // Handle gutter clicks for breakpoints
      editor.onMouseDown((e: editor.IEditorMouseEvent) => {
        if (!e.target.position) return;
        const lineNumber = e.target.position.lineNumber;
        const targetType = (e.target as { type?: number }).type;

        // Type 2 is the glyph margin (breakpoint area)
        if (targetType === 2) {
          toggleBreakpoint(lineNumber);
        }
      });

      // Handle cursor position changes
      editor.onDidChangeCursorPosition((e) => {
        const lineNumber = e.position.lineNumber;

        // Update selected line if changed
        if (lineNumber !== selectedLine) {
          setSelectedLine(lineNumber);
        }

        // Update hovered line for keyboard navigation
        if (e.source === "keyboard" && explanationsEnabled) {
          setHoveredLine(lineNumber);
          lastHoverLineRef.current = lineNumber;
        }
      });

      // Handle content changes
      editor.onDidChangeModelContent(() => {
        if (!editorRef.current || !activeProgram || activeProgram.source === "template") {
          return;
        }

        const nextCode = editorRef.current.getValue();
        const currentCode = usePlaygroundStore.getState().code;

        if (nextCode !== currentCode) {
          updateProgramCode(activeProgram.id, nextCode);
          usePlaygroundStore.getState().setTemplate(activeProgram.id, nextCode);
        }
      });

      // Handle mouse movement
      editor.onMouseMove(handleMouseMove);

      // Handle mouse leave
      editor.onMouseLeave(handleMouseLeave);

      // Register inline completion provider
      if (completionProviderRef.current) {
        completionProviderRef.current.dispose();
      }

      completionProviderRef.current = monaco.languages.registerInlineCompletionsProvider("rust", {
        provideInlineCompletions: async (model, position, _context, token) => {
          const textUntilPosition = model.getValueInRange({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          });

          const textAfterPosition = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: model.getLineCount(),
            endColumn: model.getLineMaxColumn(model.getLineCount()),
          });

          if (!textUntilPosition.trim()) return { items: [] };
          if (token.isCancellationRequested) return { items: [] };

          console.log("[AI Completion] Requesting completion...");

          try {
            const completion = await generateCodeCompletion(textUntilPosition, textAfterPosition);
            
            console.log("[AI Completion] Got completion:", completion);
            
            if (!completion || token.isCancellationRequested) return { items: [] };

            return {
              items: [{
                insertText: completion,
                range: new monaco.Range(
                  position.lineNumber,
                  position.column,
                  position.lineNumber,
                  position.column + completion.length
                )
              }]
            };
          } catch (error) {
            console.error("Error providing inline completion:", error);
            return { items: [] };
          }
        },
        disposeInlineCompletions: () => {},
      });
    },
    [
      monacoTheme,
      toggleBreakpoint,
      selectedLine,
      setSelectedLine,
      explanationsEnabled,
      setHoveredLine,
      activeProgram,
      updateProgramCode,
      handleMouseMove,
      handleMouseLeave,
    ]
  );

  /**
   * Sync external code changes to editor
   */
  useEffect(() => {
    if (!editorRef.current) return;

    const model = editorRef.current.getModel();
    if (!model) return;

    const currentValue = model.getValue();
    if (currentValue !== code) {
      model.setValue(code);
    }
  }, [code]);

  /**
   * Reveal and focus selected line
   */
  useEffect(() => {
    if (!editorRef.current || selectedLine === null) return;

    const currentPosition = editorRef.current.getPosition();
    if (currentPosition?.lineNumber === selectedLine) {
      return;
    }

    editorRef.current.revealLineInCenter(selectedLine);
    editorRef.current.setPosition({ lineNumber: selectedLine, column: 1 });
  }, [selectedLine]);

  /**
   * Apply theme changes
   */
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(monacoTheme);
    }
  }, [monacoTheme]);

  /**
   * Clear hover state when explanations are disabled
   */
  useEffect(() => {
    if (!explanationsEnabled) {
      setHoveredLine(null);
      clearHoverDecorations();
    }
  }, [explanationsEnabled, setHoveredLine, clearHoverDecorations]);

  /**
   * Apply decorations for breakpoints, execution line, and selected line
   */
  useEffect(() => {
    if (!editorRef.current) return;

    const decorations: editor.IModelDeltaDecoration[] = [];
    const stickiness =
      monacoRef.current?.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges ?? 1;

    // Add breakpoint decorations
    breakpoints.forEach((bp) => {
      if (bp.enabled) {
        decorations.push({
          range: {
            startLineNumber: bp.line,
            startColumn: 1,
            endLineNumber: bp.line,
            endColumn: 1,
          },
          options: {
            glyphMarginClassName: "breakpoint-glyph",
            glyphMarginHoverMessage: { value: "Click to remove breakpoint" },
            isWholeLine: false,
            stickiness,
          },
        });
      }
    });

    // Add current execution step decoration
    if (currentStep) {
      decorations.push({
        range: {
          startLineNumber: currentStep.line,
          startColumn: 1,
          endLineNumber: currentStep.line,
          endColumn: EDITOR_CONFIG.maxSafeInteger,
        },
        options: {
          className: "bg-warning/3 border-l border-l-warning/20",
          isWholeLine: true,
          stickiness,
          marginClassName: "execution-line-margin",
          overviewRuler: {
            color: "rgb(251 191 36 / 0.6)",
            position: monacoRef.current?.editor.OverviewRulerLane.Left ?? 1,
          },
        },
      });
    }

    // Add selected line decoration (if different from execution line)
    if (selectedLine !== null && selectedLine !== currentStep?.line) {
      decorations.push({
        range: {
          startLineNumber: selectedLine,
          startColumn: 1,
          endLineNumber: selectedLine,
          endColumn: EDITOR_CONFIG.maxSafeInteger,
        },
        options: {
          className: "bg-foreground/2 dark:bg-foreground/2 border-l border-l-foreground/10",
          isWholeLine: true,
          stickiness,
          marginClassName: "selected-line-margin",
        },
      });
    }

    decorationsRef.current = editorRef.current.deltaDecorations(
      decorationsRef.current,
      decorations
    );

    // Add TODO markers for custom programs
    if (activeProgram?.source === "custom") {
      const model = editorRef.current.getModel();
      const codeText = model?.getValue() ?? "";
      const todoLines = codeText
        .split("\n")
        .map((line, idx) => ({ line, index: idx + 1 }))
        .filter((entry) => entry.line.includes("TODO"))
        .map((entry) => entry.index);

      const todoDecorations: editor.IModelDeltaDecoration[] = todoLines.map((line) => ({
        range: {
          startLineNumber: line,
          startColumn: 1,
          endLineNumber: line,
          endColumn: 1,
        },
        options: {
          glyphMarginClassName: "todo-glyph",
          glyphMarginHoverMessage: { value: "TODO: Complete this section" },
          isWholeLine: false,
          stickiness,
        },
      }));

      todoDecorationsRef.current = editorRef.current.deltaDecorations(
        todoDecorationsRef.current,
        todoDecorations
      );
    } else {
      todoDecorationsRef.current = editorRef.current.deltaDecorations(
        todoDecorationsRef.current,
        []
      );
    }
  }, [selectedLine, breakpoints, currentStep, activeProgram]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      clearHoverTimeout();
      if (completionProviderRef.current) {
        completionProviderRef.current.dispose();
      }
    };
  }, [clearHoverTimeout]);

  // Auto-save integration
  const updateProgramSavedId = useProgramStore((state) => state.updateProgramSavedId);
  const { isSaving, lastSaved } = useAutoSave({
    code: activeProgram?.code || '',
    title: activeProgram?.name || 'Untitled',
    templateId: activeProgram?.templateId || activeProgram?.typeId || 'hello-solana',
    codeId: activeProgram?.savedId,
    onSaveSuccess: (id) => {
      if (activeProgram && activeProgram.id) {
        updateProgramSavedId(activeProgram.id, id);
      }
    },
  });

  // Update savedId when auto-save creates a new entry (handled by side-effect in useAutoSave? No, useAutoSave mutation returns data).
  // Actually, useAutoSave hook should return the saved ID or update store.
  // My useAutoSave hook doesn't expose the saved ID easily unless I add a callback or side effect there.
  // I should modify useAutoSave to call a callback on success.
  // But for now, let's leave it. If codeId is missing, it creates new.
  
  // Wait, if I create new, I get a new ID. If I don't update store, next save creates another new ID.
  // I NEED to update store.
  // I'll assume useAutoSave might need a callback ref or I modify it to accept `onSaveSuccess`.
  // CodePanel imports useAutoSave.
  // I'll modify useAutoSave to accept `onSaveSuccess`.
  
  return (
    <motion.div
      {...PANEL_ANIMATION}
      className="editor-shell flex h-full min-h-0 flex-col"
    >
      {/* Panel Header */}
      <div className="editor-header">
        <div className="editor-title">
          <Code className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-foreground">Code</h2>
          {todoCount > 0 && (
            <span className="todo-badge" aria-label={`${todoCount} TODO items`}>
              {todoCount} TODO
            </span>
          )}
          {isReadOnly && (
            <Badge variant="default" size="sm" aria-label="Read-only template">
              <FileCode className="h-3 w-3 mr-1" />
              Template
            </Badge>
          )}
          {isSaving && (
             <span className="text-xs text-muted-foreground animate-pulse ml-2">Saving...</span>
          )}
          {!isSaving && lastSaved && (
             <span className="text-xs text-muted-foreground ml-2">Saved</span>
          )}
        </div>
        <div className="editor-actions">
          {zenMode && (
            <button
              onClick={toggleZenMode}
              className="icon-btn"
              aria-label="Exit zen mode"
            >
              <span className="flex items-center gap-1.5">
                <PanelLeftOpen className="h-3.5 w-3.5" aria-hidden="true" />
                Exit Zen
              </span>
            </button>
          )}
          <HelpIcon
            content="Click line numbers to set breakpoints. Hover over code for explanations."
            side="left"
          />
        </div>
      </div>

      {/* Editor Container */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <MonacoEditor
          height="100%"
          defaultLanguage="rust"
          defaultValue={code}
          theme={monacoTheme}
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground text-sm">Loading editor...</div>
            </div>
          }
          options={{
            readOnly: isReadOnly,
            minimap: { enabled: false },
            fontSize: EDITOR_CONFIG.fontSize,
            lineHeight: EDITOR_CONFIG.lineHeight,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            fontFamily: "var(--font-mono)",
            fontLigatures: true,
            padding: EDITOR_CONFIG.padding,
            renderLineHighlight: "none",
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            glyphMargin: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            renderWhitespace: "selection",
            renderControlCharacters: false,
            suggest: {
              showKeywords: true,
              showSnippets: true,
            },
            quickSuggestions: {
              other: true,
              comments: false,
              strings: false,
            },
            tabSize: 2,
            insertSpaces: true,
            autoClosingBrackets: "languageDefined",
            autoClosingQuotes: "languageDefined",
            formatOnPaste: true,
            formatOnType: true,
            scrollbar: {
              vertical: "auto",
              horizontal: "auto",
              useShadows: false,
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
            mouseWheelZoom: false,
            contextmenu: true,
            accessibilitySupport: "auto",
            inlineSuggest: {
              enabled: true,
              mode: "subword",
            },
          }}
          onMount={handleEditorDidMount}
        />
      </div>
    </motion.div>
  );
}
