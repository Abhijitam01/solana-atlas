"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTemplate, useTemplates } from "@/hooks/use-templates";
import { usePlaygroundStore } from "@/stores/playground";
import { trpc } from "@/lib/trpc-client";
import { CodePanel } from "@/components/panels/CodePanel";
import { MapPanel } from "@/components/panels/MapPanel";
import { StatePanel } from "@/components/panels/StatePanel";
import { ExecutionPanel } from "@/components/panels/ExecutionPanel";
import { AccountInspectorPanel } from "@/components/panels/AccountInspectorPanel";
import { ProgramChecklistPanel } from "@/components/panels/ProgramChecklistPanel";
import { MermaidPanel } from "@/components/panels/MermaidPanel";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/Toast";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { useLearningPathStore } from "@/stores/learning-path";
import { shallow } from "zustand/shallow";
import { ProgramSidebar } from "@/components/ProgramSidebar";
import { useProgramStore } from "@/stores/programs";
import { useActiveProgram } from "@/hooks/use-active-program";
import { useLayoutStore } from "@/stores/layout";
import { useSettingsStore } from "@/stores/settings";
import { AnimatePresence, motion } from "framer-motion";
import { OnboardingGuide } from "@/components/onboarding/OnboardingGuide";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type ImperativePanelHandle,
} from "react-resizable-panels";
import { Menu, HelpCircle } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";

export default function PlaygroundPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.templateId as string;
  const { data: routeTemplate, isLoading: isRouteLoading } = useTemplate(templateId);
  const { activeProgram, template, isLoading } = useActiveProgram();
  const { setTemplate } = usePlaygroundStore(
    (state) => ({
      setTemplate: state.setTemplate,
    }),
    shallow
  );
  const { markStepComplete, markFirstTxComplete } = useLearningPathStore();
  const { executionResult, executionMode } = usePlaygroundStore(
    (state) => ({
      executionResult: state.executionResult,
      executionMode: state.executionMode,
    }),
    shallow
  );
  const { toasts, dismissToast, error: showToastError } = useToast();
  const { panels, toggleZenMode, sidebarVisible, toggleMobileSidebar } = useLayoutStore(
    (state) => ({
      panels: state.panels,
      toggleZenMode: state.toggleZenMode,
      sidebarVisible: state.sidebarVisible,
      toggleMobileSidebar: state.toggleMobileSidebar,
    })
  );
  const { playgroundTheme } = useSettingsStore(
    (state) => ({
      playgroundTheme: state.playgroundTheme,
    }),
    shallow
  );
  const sidePanelRef = useRef<ImperativePanelHandle>(null);
  const anyPanelOpen =
    panels.map || panels.explanation || panels.execution || panels.inspector || panels.checklist || panels.mermaid;

  const codeId = useSearchParams().get("code");
  const { openTemplateProgram, openUserProgram } = useProgramStore(
    (state) => ({ openTemplateProgram: state.openTemplateProgram, openUserProgram: state.openUserProgram }),
    shallow
  );

  // Fetch user code if codeId is present
  const { data: userCode, isLoading: isUserCodeLoading, error: userCodeError } = trpc.code.getById.useQuery(
    { id: codeId! },
    { enabled: !!codeId }
  );

  useEffect(() => {
    if (userCode) {
      if (routeTemplate) {
        if (!userCode.code) {
          showToastError("Failed to load code. Please try again.");
          return;
        }
        console.log("Opening user program:", userCode.id);
        openUserProgram({
          id: userCode.id,
          templateId: userCode.templateId,
          title: userCode.title,
          code: userCode.code,
          template: routeTemplate,
        });
      }
      return;
    }

    if (!routeTemplate || codeId || isUserCodeLoading) {
      return;
    }

    const shouldSkipAutoload =
      activeProgram?.source === "custom" ||
      (activeProgram?.source === "template" && activeProgram.templateId === routeTemplate.id);

    if (shouldSkipAutoload) {
      return;
    }

    console.log("Opening template program:", routeTemplate.id);
    try {
      openTemplateProgram(routeTemplate);
      console.log("Template program opened successfully");
    } catch (error) {
      console.error("Error opening template program:", error);
      showToastError(`Failed to open template: ${routeTemplate.metadata.name}`);
    }
  }, [
    routeTemplate,
    userCode,
    codeId,
    openTemplateProgram,
    openUserProgram,
    isUserCodeLoading,
    showToastError,
    activeProgram?.id,
    activeProgram?.source,
    activeProgram?.templateId,
  ]);

  // Handle error loading user code
  useEffect(() => {
    if (userCodeError && codeId) {
      showToastError("Failed to load your saved code. Please try again.");
    }
  }, [userCodeError, codeId, showToastError]);

  useEffect(() => {
    if (template) {
      console.log("Setting template in playground store:", template.id, "Code length:", template.code.length);
      setTemplate(template.id, template.code);
    }
  }, [template, setTemplate]);

  useEffect(() => {
    if (templateId && executionResult?.success && executionMode === "live") {
      markStepComplete(templateId);
      if (templateId === "hello-solana") {
        markFirstTxComplete();
      }
    }
  }, [templateId, executionResult, executionMode, markStepComplete, markFirstTxComplete]);

  // Get template list for navigation
  const { data: templates } = useTemplates();

  // Keyboard shortcuts (command palette handles its own shortcuts)
  useKeyboardShortcuts([
    {
      key: "ArrowRight",
      meta: true,
      handler: () => {
        if (templates && templates.length > 0) {
          const currentIndex = templates.findIndex((t) => t.id === templateId);
          if (currentIndex >= 0 && currentIndex < templates.length - 1) {
            const nextTemplate = templates[currentIndex + 1];
            if (nextTemplate) {
              router.push(`/playground/${nextTemplate.id}`);
            }
          }
        }
      },
    },
    {
      key: "ArrowLeft",
      meta: true,
      handler: () => {
        if (templates && templates.length > 0) {
          const currentIndex = templates.findIndex((t) => t.id === templateId);
          if (currentIndex > 0) {
            const prevTemplate = templates[currentIndex - 1];
            if (prevTemplate) {
              router.push(`/playground/${prevTemplate.id}`);
            }
          }
        }
      },
    },
    {
      key: "z",
      meta: true,
      shift: true,
      handler: () => toggleZenMode(),
    },
    {
      key: "1",
      meta: true,
      handler: () => useLayoutStore.getState().setLayoutMode("code-only"),
    },
    {
      key: "2",
      meta: true,
      handler: () => useLayoutStore.getState().setLayoutMode("code-map"),
    },
    {
      key: "3",
      meta: true,
      handler: () => useLayoutStore.getState().setLayoutMode("code-exec"),
    },
  ]);

  useEffect(() => {
    if (!sidePanelRef.current) return;
    if (anyPanelOpen) {
      sidePanelRef.current.expand();
    } else {
      sidePanelRef.current.collapse();
    }
  }, [anyPanelOpen]);

  if (isLoading || isRouteLoading || (codeId && isUserCodeLoading)) {
    // Skeleton loading state for playground (sidebar + code + right panels)
    return (
      <div className="h-screen flex bg-[#000000] text-[#cccccc]">
        {/* Left sidebar skeleton */}
        <div className="hidden md:flex w-64 flex-shrink-0 border-r border-border/70 bg-card/60">
          <div className="p-4 w-full space-y-4 animate-pulse">
            <div className="h-10 rounded-lg bg-[#1f2933]" />
            <div className="space-y-2">
              <div className="h-3 w-24 rounded bg-[#1f2933]" />
              <div className="h-3 w-32 rounded bg-[#1f2933]" />
              <div className="h-3 w-20 rounded bg-[#1f2933]" />
            </div>
            <div className="space-y-2 pt-2 border-t border-border/50">
              <div className="h-3 w-28 rounded bg-[#1f2933]" />
              <div className="h-3 w-36 rounded bg-[#1f2933]" />
              <div className="h-3 w-24 rounded bg-[#1f2933]" />
            </div>
          </div>
        </div>

        {/* Main code + right panels skeleton */}
        <div className="flex-1 flex flex-col">
          {/* Top bar skeleton */}
          <div className="h-11 border-b border-border/70 bg-[#0b0f14] flex items-center px-4 animate-pulse">
            <div className="h-4 w-24 rounded bg-[#1f2933]" />
            <div className="h-3 w-16 rounded bg-[#1f2933] ml-3" />
          </div>

          <div className="flex flex-1 min-h-0">
            {/* Code editor skeleton */}
            <div className="flex-1 border-r border-border/70 bg-[#05070a] p-4 space-y-3 animate-pulse">
              <div className="h-4 w-40 rounded bg-[#1f2933]" />
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-[#111827]" />
                <div className="h-3 w-[92%] rounded bg-[#111827]" />
                <div className="h-3 w-[88%] rounded bg-[#111827]" />
                <div className="h-3 w-[96%] rounded bg-[#111827]" />
                <div className="h-3 w-[75%] rounded bg-[#111827]" />
              </div>
              <div className="space-y-2 pt-4">
                <div className="h-3 w-[90%] rounded bg-[#111827]" />
                <div className="h-3 w-[85%] rounded bg-[#111827]" />
                <div className="h-3 w-[70%] rounded bg-[#111827]" />
              </div>
            </div>

            {/* Right panels skeleton */}
            <div className="hidden lg:flex w-[30%] flex-col bg-[#05070a] border-l border-border/70 p-4 space-y-4 animate-pulse">
              <div className="h-4 w-28 rounded bg-[#1f2933]" />
              <div className="h-20 rounded-lg bg-[#111827]" />
              <div className="h-4 w-24 rounded bg-[#1f2933]" />
              <div className="h-24 rounded-lg bg-[#111827]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!template && !isRouteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1e1e1e]">
        <div className="text-center">
          <h1 className="text-xl font-mono font-bold text-[#cccccc] mb-2">
            Template not found
          </h1>
          <p className="text-[#888888] font-mono text-sm">
            The template you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  const isGridTheme = playgroundTheme === "grid";
  const isMatrixTheme = playgroundTheme === "matrix";

  return (
    <>
      <div
        className={`relative h-screen overflow-hidden ${
          isGridTheme
            ? "bg-[#0A0A0A] text-[#cccccc]"
            : isMatrixTheme
            ? "bg-[#000000] text-[#00ff00]"
            : "bg-[#1e1e1e] text-[#cccccc] grid-pattern-dark"
        }`}
      >

        {/* Grid background overlay for grid theme */}
        {isGridTheme && (
          <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none z-0" />
        )}

        {/* Matrix background overlay for matrix theme */}
        {isMatrixTheme && (
          <>
            <div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-0" />
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,0,0.05)_0%,transparent_50%)] pointer-events-none z-0" />
          </>
        )}

        <div className="flex min-h-screen relative z-10">
          {/* Mobile sidebar toggle button */}
          <button
            onClick={toggleMobileSidebar}
            className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-card/90 backdrop-blur border border-border/70 text-foreground hover:bg-card transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          {/* Global help button to reopen onboarding */}
          <div className="fixed top-4 right-4 z-50">
            <Tooltip content="Open the onboarding guide" side="left">
              <button
                type="button"
                className="p-2 rounded-lg bg-card/90 backdrop-blur border border-border/70 text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
                aria-label="Open onboarding guide"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("solana-playground-open-onboarding"));
                  }
                }}
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </Tooltip>
          </div>
          {sidebarVisible && <ProgramSidebar />}
          <div className="flex flex-1 min-w-0">
            <PanelGroup direction="horizontal" className="w-full h-screen">
              <Panel minSizePercentage={60} defaultSizePercentage={70}>
                <div
                  className={`min-w-0 h-full min-h-0 ${
                    isGridTheme 
                      ? "bg-[#000000]" 
                      : isMatrixTheme
                      ? "bg-[#000000]"
                      : ""
                  }`}
                >
                  <CodePanel />
                </div>
              </Panel>
              <PanelResizeHandle
                className={`w-1 bg-border hover:bg-[#14F195]/50 transition-colors duration-fast relative group ${
                  anyPanelOpen ? "" : "opacity-0 pointer-events-none"
                }`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-0.5 h-8 bg-muted-foreground/30 group-hover:bg-[#14F195] rounded-full transition-colors duration-fast" />
                </div>
              </PanelResizeHandle>
              <Panel
                ref={sidePanelRef}
                collapsible
                collapsedSizePercentage={0}
                minSizePercentage={20}
                defaultSizePercentage={30}
              >
                <AnimatePresence>
                  {anyPanelOpen && (
                    <motion.aside
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ duration: 0.2 }}
                    data-panel-container
                    className={`h-full border-l border-border/70 backdrop-blur flex flex-col overflow-hidden max-h-screen ${
                        isGridTheme
                          ? "bg-[#000000]"
                          : isMatrixTheme
                          ? "bg-card/70"
                          : "bg-card/70"
                      }`}
                    >
                      <div className="flex-1 overflow-y-auto space-y-4 p-4 pb-8 max-h-full overscroll-contain">
                        {panels.map && <MapPanel />}
                        {panels.explanation && <StatePanel />}
                        {panels.checklist && <ProgramChecklistPanel />}
                        {panels.inspector && <AccountInspectorPanel />}
                        {panels.execution && <ExecutionPanel />}
                        {panels.mermaid && <MermaidPanel />}
                      </div>
                    </motion.aside>
                  )}
                </AnimatePresence>
              </Panel>
            </PanelGroup>
          </div>
        </div>
      </div>
      <CommandPalette />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <OnboardingGuide />
    </>
  );
}
