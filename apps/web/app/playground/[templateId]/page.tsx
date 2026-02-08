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
import { AnimatePresence, motion } from "framer-motion";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type ImperativePanelHandle,
} from "react-resizable-panels";

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
  const { panels, toggleZenMode, sidebarVisible } = useLayoutStore(
    (state) => ({
      panels: state.panels,
      toggleZenMode: state.toggleZenMode,
      sidebarVisible: state.sidebarVisible,
    })
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading template...</p>
        </div>
      </div>
    );
  }

  if (!template && !isRouteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Template not found
          </h1>
          <p className="text-muted-foreground">
            The template you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative min-h-screen overflow-visible bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.08),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.08),transparent_35%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-60 [background:linear-gradient(180deg,rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:40px_40px]" />
        <div className="flex min-h-screen">
          {sidebarVisible && <ProgramSidebar />}
          <div className="flex flex-1 min-w-0">
            <PanelGroup direction="horizontal" className="w-full h-screen">
              <Panel minSizePercentage={60} defaultSizePercentage={70}>
                <div className="min-w-0 h-full min-h-0">
                  <CodePanel />
                </div>
              </Panel>
              <PanelResizeHandle
                className={`w-1 bg-border hover:bg-primary/50 transition-colors duration-fast relative group ${
                  anyPanelOpen ? "" : "opacity-0 pointer-events-none"
                }`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-0.5 h-8 bg-muted-foreground/30 group-hover:bg-primary rounded-full transition-colors duration-fast" />
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
                      className="h-full border-l border-border/70 bg-card/70 backdrop-blur"
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
    </>
  );
}
