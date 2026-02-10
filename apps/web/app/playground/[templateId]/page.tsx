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
import { Menu } from "lucide-react";

export default function PlaygroundPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.templateId as string;
  const { data: routeTemplate, isLoading: isRouteLoading } = useTemplate(templateId);
  const { template, isLoading } = useActiveProgram();
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
  const toast = useToast();
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
    panels.map || panels.explanation || panels.execution || panels.inspector || panels.checklist;

  const codeId = useSearchParams().get("code");
  const { openTemplateProgram, openUserProgram } = useProgramStore(
    (state) => ({ openTemplateProgram: state.openTemplateProgram, openUserProgram: state.openUserProgram }),
    shallow
  );

  // Fetch user code if codeId is present
  const { data: userCode, isLoading: isUserCodeLoading } = trpc.code.getById.useQuery(
    { id: codeId! },
    { enabled: !!codeId }
  );

  useEffect(() => {
    if (userCode) {
      if (routeTemplate) {
        openUserProgram({
          id: userCode.id,
          templateId: userCode.templateId,
          title: userCode.title,
          code: userCode.code,
          template: routeTemplate,
        });
      }
    } else if (routeTemplate && !codeId && !isUserCodeLoading) {
      openTemplateProgram(routeTemplate);
    }
  }, [routeTemplate, userCode, codeId, openTemplateProgram, openUserProgram, isUserCodeLoading]);

  useEffect(() => {
    if (template) {
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

  if (isLoading || isRouteLoading) {
    // Simple text-based loading
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1e1e1e] text-[#cccccc] font-mono">
        <div className="text-sm">Loading...</div>
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
        className={`relative min-h-screen overflow-visible ${
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
                      className={`h-full border-l border-border/70 backdrop-blur ${
                        isGridTheme
                          ? "bg-[#000000]"
                          : isMatrixTheme
                          ? "bg-card/70"
                          : "bg-card/70"
                      }`}
                    >
                      <div className="h-full overflow-y-auto space-y-4">
                        {panels.map && <MapPanel />}
                        {panels.explanation && <StatePanel />}
                        {panels.checklist && <ProgramChecklistPanel />}
                        {panels.inspector && <AccountInspectorPanel />}
                        {panels.execution && <ExecutionPanel />}
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
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
      <OnboardingGuide />
    </>
  );
}
