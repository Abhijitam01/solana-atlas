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
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { shallow } from "zustand/shallow";
import { useLayoutStore } from "@/stores/layout";
import { useSettingsStore } from "@/stores/settings";
import { useAuth } from "@/components/providers/AuthProvider";
import { LoginModal } from "@/components/auth/LoginModal";

export function ProgramSidebar() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: allTemplates } = useTemplates(false);
  const { data: featuredTemplates } = useTemplates(true);
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  
  // Use featured templates initially, show all when expanded
  const templates = showAllTemplates ? allTemplates : featuredTemplates;
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
  const { panels, togglePanel, toggleZenMode, zenMode, layoutMode, setLayoutMode, mobileSidebarOpen, toggleMobileSidebar } =
    useLayoutStore(
      (state) => ({
        panels: state.panels,
        togglePanel: state.togglePanel,
        toggleZenMode: state.toggleZenMode,
        zenMode: state.zenMode,
        layoutMode: state.layoutMode,
        setLayoutMode: state.setLayoutMode,
        mobileSidebarOpen: state.mobileSidebarOpen,
        toggleMobileSidebar: state.toggleMobileSidebar,
      })
    );

  const [showModal, setShowModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
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
    templates: 3, // Show only 3 templates initially
    programs: 3,
  };

  const visiblePanels = panelItems.slice(0, MAX_VISIBLE.panels);
  const overflowPanels = panelItems.slice(MAX_VISIBLE.panels);

  // Show all templates if expanded, otherwise show up to 13 featured
  const visibleTemplates = templates?.slice(0, MAX_VISIBLE.templates) ?? [];
  const overflowTemplates = showAllTemplates ? [] : (allTemplates?.slice(MAX_VISIBLE.templates) ?? []);

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
    const active = allTemplates?.find((template) => template.id === activeTemplateId);
    if (!active) return visibleTemplates;
    const alreadyVisible = visibleTemplates.some((template) => template.id === active.id);
    if (alreadyVisible) return visibleTemplates;
    // If active template is not in visible list, add it and ensure we don't exceed limit
    const currentList = showAllTemplates ? allTemplates ?? [] : featuredTemplates ?? [];
    const activeIndex = currentList.findIndex((t) => t.id === activeTemplateId);
    if (activeIndex >= 0 && activeIndex < MAX_VISIBLE.templates) {
      return visibleTemplates;
    }
    return [...visibleTemplates.slice(0, Math.max(0, MAX_VISIBLE.templates - 1)), active];
  };

  const resolvedPrograms = resolveVisiblePrograms();
  const resolvedTemplates = resolveVisibleTemplates();

  const handleCreate = () => {
    // Check if user is authenticated before creating a new program
    if (!user) {
      setShowModal(false);
      setShowAuthModal(true);
      return;
    }

    const type = PROGRAM_TYPES.find((item) => item.id === selectedType);
    if (!type) return;
    const name = programName.trim() || `${type.label} Draft`;
    createProgram(name, type.id);
    setProgramName("");
    setShowModal(false);
  };

  const handleNewProgramClick = () => {
    // Check if user is authenticated before opening create modal
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setShowModal(true);
  };

  // Get playground theme from settings store
  const { playgroundTheme } = useSettingsStore(
    (state) => ({
      playgroundTheme: state.playgroundTheme,
    }),
    shallow
  );
  
  const isGridTheme = playgroundTheme === "grid";
  const isMatrixTheme = playgroundTheme === "matrix";

  return (
    <>
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleMobileSidebar}
        />
      )}
      <aside className={`w-64 flex-shrink-0 border-r border-border/70 backdrop-blur h-screen overflow-hidden flex flex-col fixed md:relative z-50 transition-transform duration-300 ${
        mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      } ${
        isGridTheme 
          ? "bg-[#0A0A0A]/80 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px]"
          : isMatrixTheme
          ? "bg-[#000000] bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"
          : "bg-card/60"
      }`}>
        {/* Mobile close button */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border/70">
          <span className="text-sm font-semibold text-foreground">Menu</span>
          <button
            onClick={toggleMobileSidebar}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      <div className="p-4 border-b border-border/70">
        <button
          onClick={handleNewProgramClick}
          className="btn-primary w-full"
        >
          <Plus className="w-4 h-4" />
          New Program
        </button>
      </div>

      <div className={`p-4 space-y-6 text-sm flex-1 overflow-y-auto ${
        isMatrixTheme ? "text-[#00ff00]" : ""
      }`}>
        <div>
          <div className={`text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2 ${
            isMatrixTheme ? "text-[#00ff00]" : "text-muted-foreground"
          }`}>
            Panels
          </div>
          <div className="space-y-1">
            {visiblePanels.map((panel) => {
              const isOpen = panels[panel.id];
              const Icon = panel.icon;
              return (
                <button
                  key={panel.id}
                  onClick={() => {
                    togglePanel(panel.id);
                    // Close mobile sidebar after toggling panel
                    if (typeof window !== "undefined" && window.innerWidth < 768) {
                      toggleMobileSidebar();
                    }
                  }}
                  className={`w-full text-left rounded-lg px-3 py-2 transition-colors flex items-center justify-between ${
                    isOpen
                      ? isMatrixTheme
                        ? "bg-[#00ff00]/20 text-[#00ff00]"
                        : "bg-primary-light/60 text-foreground"
                      : isMatrixTheme
                      ? "text-[#00ff00] hover:bg-[#00ff00]/20"
                      : "text-muted-foreground hover:bg-[#14F195]/20 hover:text-[#14F195]"
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
                className="w-full text-left rounded-lg px-3 py-2 transition-colors text-muted-foreground hover:bg-[#14F195]/20 hover:text-[#14F195]"
              >
                +{overflowPanels.length} more
              </button>
            )}
          </div>
        </div>
        <div>
          <div className={`text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2 ${
            isMatrixTheme ? "text-[#00ff00]" : "text-muted-foreground"
          }`}>
            Layouts
          </div>
          <div className="space-y-1">
            {layoutItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setLayoutMode(item.id)}
                className={`w-full text-left rounded-lg px-3 py-2 transition-colors ${
                  layoutMode === item.id
                    ? isMatrixTheme 
                      ? "bg-[#00ff00]/20 text-[#00ff00]"
                      : "bg-primary-light/60 text-foreground"
                    : isMatrixTheme
                    ? "text-[#00ff00] hover:bg-[#00ff00]/20"
                    : "text-muted-foreground hover:bg-[#14F195]/20 hover:text-[#14F195]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className={`text-xs font-semibold uppercase tracking-wider mb-2 flex items-center justify-between ${
            isMatrixTheme ? "text-[#00ff00]" : "text-muted-foreground"
          }`}>
            <span>Open Template</span>
            {!showAllTemplates && allTemplates && allTemplates.length > 3 && (
              <button
                onClick={() => setShowAllTemplates(true)}
                className={`text-xs transition-colors ${
                  isMatrixTheme 
                    ? "text-[#00ff00] hover:text-[#00ff88]"
                    : "text-primary hover:text-[#14F195]"
                }`}
              >
                More ({allTemplates.length - 3})
              </button>
            )}
            {showAllTemplates && (
              <button
                onClick={() => setShowAllTemplates(false)}
                className={`text-xs transition-colors ${
                  isMatrixTheme 
                    ? "text-[#00ff00] hover:text-[#00ff88]"
                    : "text-muted-foreground hover:text-[#14F195]"
                }`}
              >
                Show Featured
              </button>
            )}
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
                  // Close mobile sidebar
                  if (typeof window !== "undefined" && window.innerWidth < 768) {
                    toggleMobileSidebar();
                  }
                }}
                className={`w-full text-left rounded-lg px-3 py-2 transition-colors ${
                  activeProgramId === `template-${template.id}`
                    ? isMatrixTheme
                      ? "bg-[#00ff00]/20 text-[#00ff00]"
                      : "bg-primary-light/60 text-foreground"
                    : isMatrixTheme
                    ? "text-[#00ff00] hover:bg-[#00ff00]/20"
                    : "text-muted-foreground hover:bg-[#14F195]/20 hover:text-[#14F195]"
                }`}
              >
                {template.name}
              </button>
            ))}
            {!templates?.length && (
              <div className={`text-xs ${isMatrixTheme ? "text-[#00ff00]" : "text-muted-foreground"}`}>No templates loaded.</div>
            )}
            {overflowTemplates.length > 0 && (
              <button
                onClick={() => setMoreSection("templates")}
                className="w-full text-left rounded-lg px-3 py-2 transition-colors text-muted-foreground hover:bg-[#14F195]/20 hover:text-[#14F195]"
              >
                +{overflowTemplates.length} more
              </button>
            )}
          </div>
        </div>

        {customPrograms.length > 0 && (
          <div>
            <div className={`text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2 ${
              isMatrixTheme ? "text-[#00ff00]" : "text-muted-foreground"
            }`}>
              My Programs
            </div>
            <div className="space-y-1">
              {resolvedPrograms.map((program) => (
              <button
                key={program.id}
                onClick={() => {
                  setActiveProgram(program.id);
                  // Close mobile sidebar
                  if (typeof window !== "undefined" && window.innerWidth < 768) {
                    toggleMobileSidebar();
                  }
                }}
                className={`w-full text-left rounded-lg px-3 py-2 transition-colors ${
                  activeProgramId === program.id
                    ? isMatrixTheme
                      ? "bg-[#00ff00]/20 text-[#00ff00]"
                      : "bg-primary-light/60 text-foreground"
                    : isMatrixTheme
                    ? "text-[#00ff00] hover:bg-[#00ff00]/20"
                    : "text-muted-foreground hover:bg-[#14F195]/20 hover:text-[#14F195]"
                }`}
              >
                {program.name}
              </button>
            ))}
              {overflowPrograms.length > 0 && (
                <button
                  onClick={() => setMoreSection("programs")}
                  className="w-full text-left rounded-lg px-3 py-2 transition-colors text-muted-foreground hover:bg-[#14F195]/20 hover:text-[#14F195]"
                >
                  +{overflowPrograms.length} more
                </button>
              )}
            </div>
          </div>
        )}
        <div>
          <div className={`text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2 ${
            isMatrixTheme ? "text-[#00ff00]" : "text-muted-foreground"
          }`}>
            Focus
          </div>
          <button
            onClick={toggleZenMode}
            data-zen-toggle
            className={`w-full text-left rounded-lg px-3 py-2 transition-colors flex items-center gap-2 ${
              zenMode
                ? isMatrixTheme
                  ? "bg-[#00ff00]/20 text-[#00ff00]"
                  : "bg-primary-light/60 text-foreground"
                : isMatrixTheme
                ? "text-[#00ff00] hover:bg-[#00ff00]/20"
                : "text-muted-foreground hover:bg-[#14F195]/20 hover:text-[#14F195]"
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
                        : "border-border bg-muted/20 hover:border-[#14F195]"
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
                  className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:text-[#14F195] hover:bg-[#14F195]/20"
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
                            : "text-muted-foreground hover:bg-[#14F195]/20 hover:text-[#14F195]"
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
                        // Close mobile sidebar
                        if (typeof window !== "undefined" && window.innerWidth < 768) {
                          toggleMobileSidebar();
                        }
                      }}
                      className={`w-full text-left rounded-lg px-3 py-2 transition-colors ${
                        activeProgramId === `template-${template.id}`
                          ? "bg-primary-light/60 text-foreground"
                          : "text-muted-foreground hover:bg-[#14F195]/20 hover:text-[#14F195]"
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
                        // Close mobile sidebar
                        if (typeof window !== "undefined" && window.innerWidth < 768) {
                          toggleMobileSidebar();
                        }
                      }}
                      className={`w-full text-left rounded-lg px-3 py-2 transition-colors ${
                        activeProgramId === program.id
                          ? "bg-primary-light/60 text-foreground"
                          : "text-muted-foreground hover:bg-[#14F195]/20 hover:text-[#14F195]"
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

      {/* Auth Required Modal for Creating New Programs */}
      <LoginModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </aside>
    </>
  );
}
