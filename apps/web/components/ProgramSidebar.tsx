"use client";

import { useMemo, useState } from "react";
import { useTemplates } from "@/hooks/use-templates";
import { useRouter } from "next/navigation";
import { useProgramStore } from "@/stores/programs";
import { PROGRAM_TYPES } from "@/lib/program-types";
import {
  Plus,
  Check,
  Map as MapIcon,
  BookOpen,
  Rocket,
  ShieldCheck,
  ListChecks,
  PanelLeftClose,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { shallow } from "zustand/shallow";
import { useLayoutStore } from "@/stores/layout";

export function ProgramSidebar() {
  const router = useRouter();
  const { data: templates } = useTemplates();
  const {
    programs,
    activeProgramId,
    createProgram,
    setActiveProgram,
  } = useProgramStore(
    (state) => ({
      programs: state.programs,
      activeProgramId: state.activeProgramId,
      createProgram: state.createProgram,
      setActiveProgram: state.setActiveProgram,
    }),
    shallow
  );
  const { panels, togglePanel, toggleZenMode, zenMode, layoutMode, setLayoutMode } =
    useLayoutStore(
      (state) => ({
        panels: state.panels,
        togglePanel: state.togglePanel,
        toggleZenMode: state.toggleZenMode,
        zenMode: state.zenMode,
        layoutMode: state.layoutMode,
        setLayoutMode: state.setLayoutMode,
      })
    );

  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState(PROGRAM_TYPES[0]?.id ?? "hello-solana");
  const [programName, setProgramName] = useState("");
  const [moreSection, setMoreSection] = useState<
    "panels" | "templates" | "programs" | null
  >(null);

  const panelItems = [
    { id: "map" as const, label: "Program Map", icon: MapIcon },
    { id: "explanation" as const, label: "Explanation", icon: BookOpen },
    { id: "execution" as const, label: "Execution", icon: Rocket },
    { id: "inspector" as const, label: "Account Inspector", icon: ShieldCheck },
    { id: "checklist" as const, label: "Program Checklist", icon: ListChecks },
  ];
  const layoutItems = [
    { id: "code-only" as const, label: "Code Only" },
    { id: "code-map" as const, label: "Code + Map" },
    { id: "code-exec" as const, label: "Code + Execution" },
  ];

  const customPrograms = useMemo(
    () => Object.values(programs).filter((program) => program.source === "custom"),
    [programs]
  );

  const MAX_VISIBLE = {
    panels: 4,
    templates: 3,
    programs: 3,
  };

  const visiblePanels = panelItems.slice(0, MAX_VISIBLE.panels);
  const overflowPanels = panelItems.slice(MAX_VISIBLE.panels);

  const visibleTemplates = templates?.slice(0, MAX_VISIBLE.templates) ?? [];
  const overflowTemplates = templates?.slice(MAX_VISIBLE.templates) ?? [];

  const visiblePrograms = customPrograms.slice(0, MAX_VISIBLE.programs);
  const overflowPrograms = customPrograms.slice(MAX_VISIBLE.programs);

  const resolveVisiblePrograms = () => {
    if (!activeProgramId) return visiblePrograms;
    const active = customPrograms.find((program) => program.id === activeProgramId);
    if (!active) return visiblePrograms;
    const alreadyVisible = visiblePrograms.some((program) => program.id === active.id);
    if (alreadyVisible) return visiblePrograms;
    return [...visiblePrograms.slice(0, Math.max(0, MAX_VISIBLE.programs - 1)), active];
  };

  const resolveVisibleTemplates = () => {
    if (!activeProgramId) return visibleTemplates;
    const activeTemplateId = activeProgramId.startsWith("template-")
      ? activeProgramId.replace("template-", "")
      : null;
    if (!activeTemplateId) return visibleTemplates;
    const active = templates?.find((template) => template.id === activeTemplateId);
    if (!active) return visibleTemplates;
    const alreadyVisible = visibleTemplates.some((template) => template.id === active.id);
    if (alreadyVisible) return visibleTemplates;
    return [...visibleTemplates.slice(0, Math.max(0, MAX_VISIBLE.templates - 1)), active];
  };

  const resolvedPrograms = resolveVisiblePrograms();
  const resolvedTemplates = resolveVisibleTemplates();

  const handleCreate = () => {
    const type = PROGRAM_TYPES.find((item) => item.id === selectedType);
    if (!type) return;
    const name = programName.trim() || `${type.label} Draft`;
    createProgram(name, type.id);
    setProgramName("");
    setShowModal(false);
  };

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border/70 bg-card/60 backdrop-blur h-screen overflow-hidden flex flex-col">
      <div className="p-4 border-b border-border/70">
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary w-full"
        >
          <Plus className="w-4 h-4" />
          New Program
        </button>
      </div>

      <div className="p-4 space-y-6 text-sm flex-1 overflow-hidden">
        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
            Panels
          </div>
          <div className="space-y-1">
            {visiblePanels.map((panel) => {
              const isOpen = panels[panel.id];
              const Icon = panel.icon;
              return (
                <button
                  key={panel.id}
                  onClick={() => togglePanel(panel.id)}
                  className={`w-full text-left rounded-lg px-3 py-2 transition-colors flex items-center justify-between ${
                    isOpen
                      ? "bg-primary-light/60 text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {panel.label}
                  </span>
                  {isOpen && <span className="h-2 w-2 rounded-full bg-primary" />}
                </button>
              );
            })}
            {overflowPanels.length > 0 && (
              <button
                onClick={() => setMoreSection("panels")}
                className="w-full text-left rounded-lg px-3 py-2 transition-colors text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              >
                +{overflowPanels.length} more
              </button>
            )}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
            Layouts
          </div>
          <div className="space-y-1">
            {layoutItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setLayoutMode(item.id)}
                className={`w-full text-left rounded-lg px-3 py-2 transition-colors ${
                  layoutMode === item.id
                    ? "bg-primary-light/60 text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
            Open Template
          </div>
          <div className="space-y-1">
            {resolvedTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  const existing = programs[`template-${template.id}`];
                  if (existing) {
                    setActiveProgram(existing.id);
                  }
                  router.push(`/playground/${template.id}`);
                }}
                className={`w-full text-left rounded-lg px-3 py-2 transition-colors ${
                  activeProgramId === `template-${template.id}`
                    ? "bg-primary-light/60 text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {template.name}
              </button>
            ))}
            {!templates?.length && (
              <div className="text-xs text-muted-foreground">No templates loaded.</div>
            )}
            {overflowTemplates.length > 0 && (
              <button
                onClick={() => setMoreSection("templates")}
                className="w-full text-left rounded-lg px-3 py-2 transition-colors text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              >
                +{overflowTemplates.length} more
              </button>
            )}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
            My Programs
          </div>
          <div className="space-y-1">
            {resolvedPrograms.map((program) => (
              <button
                key={program.id}
                onClick={() => setActiveProgram(program.id)}
                className={`w-full text-left rounded-lg px-3 py-2 transition-colors ${
                  activeProgramId === program.id
                    ? "bg-primary-light/60 text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {program.name}
              </button>
            ))}
            {customPrograms.length === 0 && (
              <div className="text-xs text-muted-foreground">No drafts yet.</div>
            )}
            {overflowPrograms.length > 0 && (
              <button
                onClick={() => setMoreSection("programs")}
                className="w-full text-left rounded-lg px-3 py-2 transition-colors text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              >
                +{overflowPrograms.length} more
              </button>
            )}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
            Focus
          </div>
          <button
            onClick={toggleZenMode}
            className={`w-full text-left rounded-lg px-3 py-2 transition-colors flex items-center gap-2 ${
              zenMode
                ? "bg-primary-light/60 text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <PanelLeftClose className="w-4 h-4" />
            {zenMode ? "Exit Zen Mode" : "Zen Mode"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-[520px] rounded-2xl bg-card border border-border/70 p-6 shadow-2xl"
            >
              <div className="text-lg font-semibold text-foreground">Create a New Program</div>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a program type to scaffold guided code.
              </p>

              <div className="mt-4 grid gap-2">
                {PROGRAM_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${
                      selectedType === type.id
                        ? "border-primary bg-primary-light/60"
                        : "border-border bg-muted/20 hover:border-primary/60"
                    }`}
                  >
                    <div>
                      <div className="text-sm font-semibold text-foreground">{type.label}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </div>
                    {selectedType === type.id && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <input
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Program name (optional)"
                  value={programName}
                  onChange={(event) => setProgramName(event.target.value)}
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button onClick={handleCreate} className="btn-primary">
                  Create Program
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {moreSection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              className="w-[520px] max-h-[70vh] overflow-hidden rounded-2xl bg-card border border-border/70 p-4 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-2 pb-3">
                <div className="text-sm font-semibold text-foreground">
                  {moreSection === "panels"
                    ? "Panels"
                    : moreSection === "templates"
                    ? "Templates"
                    : "My Programs"}
                </div>
                <button
                  onClick={() => setMoreSection(null)}
                  className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
                  Close
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 px-2 pb-2">
                {moreSection === "panels" &&
                  panelItems.map((panel) => {
                    const Icon = panel.icon;
                    const isOpen = panels[panel.id];
                    return (
                      <button
                        key={panel.id}
                        onClick={() => {
                          togglePanel(panel.id);
                          setMoreSection(null);
                        }}
                        className={`w-full text-left rounded-lg px-3 py-2 transition-colors flex items-center justify-between ${
                          isOpen
                            ? "bg-primary-light/60 text-foreground"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {panel.label}
                        </span>
                        {isOpen && <span className="h-2 w-2 rounded-full bg-primary" />}
                      </button>
                    );
                  })}
                {moreSection === "templates" &&
                  templates?.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => {
                        const existing = programs[`template-${template.id}`];
                        if (existing) {
                          setActiveProgram(existing.id);
                        }
                        router.push(`/playground/${template.id}`);
                        setMoreSection(null);
                      }}
                      className={`w-full text-left rounded-lg px-3 py-2 transition-colors ${
                        activeProgramId === `template-${template.id}`
                          ? "bg-primary-light/60 text-foreground"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      {template.name}
                    </button>
                  ))}
                {moreSection === "programs" &&
                  customPrograms.map((program) => (
                    <button
                      key={program.id}
                      onClick={() => {
                        setActiveProgram(program.id);
                        setMoreSection(null);
                      }}
                      className={`w-full text-left rounded-lg px-3 py-2 transition-colors ${
                        activeProgramId === program.id
                          ? "bg-primary-light/60 text-foreground"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      {program.name}
                    </button>
                  ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
