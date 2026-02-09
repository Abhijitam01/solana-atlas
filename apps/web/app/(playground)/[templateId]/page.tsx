"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTemplate, useTemplates } from "@/hooks/use-templates";
import { usePlaygroundStore } from "@/stores/playground";
import { CodePanel } from "@/components/panels/CodePanel";
import { MapPanel } from "@/components/panels/MapPanel";
import { StatePanel } from "@/components/panels/StatePanel";
import { TemplateHeader } from "@/components/TemplateHeader";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/Toast";
import { ResizablePanels } from "@/components/ui/ResizablePanels";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { AITutor } from "@/components/ai/AITutor";
import { ContextualHints } from "@/components/ai/ContextualHints";
import { HelpIcon } from "@/components/ui/HelpIcon";

export default function PlaygroundPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.templateId as string;
  const { data: template, isLoading } = useTemplate(templateId);
  const { setTemplate, selectedLine } = usePlaygroundStore();
  const toast = useToast();

  useEffect(() => {
    if (template) {
      setTemplate(template.id, template.code);
    }
  }, [template, setTemplate]);

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
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading template...</p>
        </div>
      </div>
    );
  }

  if (!template) {
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
      <div className="h-screen flex flex-col bg-background">
        <TemplateHeader template={{ id: template.id, metadata: template.metadata }} />
        <div className="flex-1 overflow-hidden p-4">
          <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground px-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Quick start</span>
              <span>
                1) Click a line to see its explanation  ·  2) Use Map to explore instructions &amp; accounts  ·  3) Use State to compare before/after accounts.
              </span>
            </div>
            <HelpIcon
              content={
                <div className="space-y-1 text-xs">
                  <p><strong>Shortcuts</strong></p>
                  <p><kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>K</kbd> – Open command palette</p>
                  <p><kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>→</kbd> / <kbd>←</kbd> – Next / previous template</p>
                </div>
              }
              side="left"
            />
          </div>
          <ResizablePanels
            storageKey="playground-panel-sizes"
            defaultSizes={[40, 30, 30]}
          >
            <CodePanel />
            <MapPanel />
            <StatePanel />
          </ResizablePanels>
        </div>
      </div>
      <CommandPalette />
      <AITutor templateId={templateId} currentLine={selectedLine} />
      <ContextualHints />
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
    </>
  );
}


