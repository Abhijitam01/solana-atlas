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
  Sparkles,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { scaffoldProgram } from "@/lib/scaffold";
import { motion, AnimatePresence } from "framer-motion";
import { shallow } from "zustand/shallow";
import { useLayoutStore } from "@/stores/layout";
import { useSettingsStore } from "@/stores/settings";
import { usePlaygroundStore } from "@/stores/playground";
import { useAuth } from "@/components/providers/AuthProvider";
import { LoginModal } from "@/components/auth/LoginModal";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/Toast";

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isMatrixTheme?: boolean;
}

function SidebarSection({ title, children, defaultOpen = true, isMatrixTheme }: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold uppercase tracking-wider mb-1 hover:bg-muted/10 rounded transition-colors ${
          isMatrixTheme ? "text-[#00ff00]" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-1 px-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ProgramSidebar() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const { data: allTemplates } = useTemplates(false);
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
  const { panels, togglePanel, setPanel, toggleZenMode, zenMode, layoutMode, setLayoutMode, mobileSidebarOpen, toggleMobileSidebar } =
    useLayoutStore(
      (state) => ({
        panels: state.panels,
        togglePanel: state.togglePanel,
        setPanel: state.setPanel,
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
  const [sourceType, setSourceType] = useState<"standard" | "template">("standard");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [programName, setProgramName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { setTemplate, reset: resetPlayground } = usePlaygroundStore(
    (state) => ({
      setTemplate: state.setTemplate,
      reset: state.reset,
    }),
    shallow
  );

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



  const handleCreate = async () => {
    // Check if user is authenticated before creating a new program
    if (!user) {
      setShowModal(false);
      setShowAuthModal(true);
      return;
    }

    // Prevent double-clicking
    if (isCreating) {
      return;
    }

    setIsCreating(true);
    console.log("Creating new program...", { sourceType, selectedType, selectedTemplateId, programName });

    try {
      let code = "";
      let typeId = "custom";
      // Check if Program Name is empty, default to "Untitled Program"
      let finalName = programName.trim() || "Untitled Program";
      let checklist: string[] = [];
      let templateData: any | null = null;

      if (sourceType === "standard") {
        // Standard: Create a blank/scaffolded program based on a type (default: hello-solana or custom)
        const type = PROGRAM_TYPES.find((item) => item.id === selectedType);
        if (!type) {
          // Fallback to custom/empty if not found
          typeId = "custom";
          code = "// Write your program here\n";
          toast.warning("Selected program type not found, using blank template");
        } else {
          typeId = type.id;
          code = type.scaffold;
          // If user didn't type a name, use the type label
          if (!programName.trim()) {
            finalName = `${type.label}${isPracticeMode ? " (Practice)" : ""}`;
          }
        }
      } else {
        // Template: Fetch and load template
        if (!selectedTemplateId) {
          toast.error("Please select a template");
          setIsCreating(false);
          return;
        }

        const template = allTemplates?.find((t) => t.id === selectedTemplateId);
        if (!template) {
          toast.error(`Template not found: ${selectedTemplateId}`);
          setIsCreating(false);
          return;
        }

        try {
          console.log(`Fetching template: /api/templates/${template.id}`);
          const res = await fetch(`/api/templates/${template.id}`);
          
          if (!res.ok) {
            const errorText = await res.text();
            let errorMessage = `Failed to load template: ${res.status}`;
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.error || errorMessage;
            } catch {
              errorMessage = errorText || errorMessage;
            }
            throw new Error(errorMessage);
          }

          const data = await res.json();
          
          if (!data.code) {
            throw new Error("Template loaded but contains no code");
          }

          console.log("Template loaded successfully:", data.id, "Code length:", data.code.length);
          templateData = data;
          code = data.code;
          typeId = "custom"; // Template-based programs become "custom" owned by user
          
          if (!programName.trim()) {
            finalName = `${template.name}${isPracticeMode ? " (Practice)" : ""}`;
          }

          // Use checklist from template API, or default to empty (API handles default though)
          if (data.checklist && Array.isArray(data.checklist)) {
            checklist = data.checklist;
          }
        } catch (e) {
          const errorMessage = e instanceof Error ? e.message : "Unknown error loading template";
          console.error("Template loading error:", e);
          toast.error(`Failed to load template: ${errorMessage}`);
          setIsCreating(false);
          return;
        }
      }

      if (!code) {
        toast.error("No code generated. Please try again.");
        setIsCreating(false);
        return;
      }

      if (isPracticeMode) {
        code = scaffoldProgram(code); // Replaces content with TODOs
      }

      // Force hard state switch
      // 1. Create program atomically with all metadata
      console.log("Creating program session:", { finalName, typeId, codeLength: code.length });
      const newProgram = createProgram(
        finalName,
        typeId as any,
        code,
        checklist,
        templateData?.metadata,
        templateData?.programMap,
        templateData?.functionSpecs,
        templateData?.precomputedState
      );

      console.log("Program created with ID:", newProgram.id);

      // 2. Set active program FIRST (Store)
      //    This ensures activeProgram is available for sync effects
      setActiveProgram(newProgram.id);
      console.log("Active program set to:", newProgram.id);

      // 3. Update Playground Editor State (CRITICAL)
      //    Set the code FIRST, then reset other state (but preserve code)
      //    This ensures code is set before any sync effects run
      setTemplate(newProgram.id, code);
      console.log("Playground state updated with code, length:", code.length);
      
      // Reset other playground state (selection, execution, etc.) but preserve code
      // Use the store's reset function but then immediately restore the code
      resetPlayground();
      // Immediately restore the code after reset
      setTemplate(newProgram.id, code);
      
      // 4. Force editor update by ensuring state is consistent
      //    Use requestAnimationFrame to ensure React has processed the state updates
      requestAnimationFrame(() => {
        const playgroundCode = usePlaygroundStore.getState().code;
        const programCode = useProgramStore.getState().programs[newProgram.id]?.code;
        if (playgroundCode !== programCode && programCode) {
          console.warn("Code mismatch detected after state update, syncing...");
          usePlaygroundStore.getState().setTemplate(newProgram.id, programCode);
        }
      });

      // Ensure the contextual checklist is visible for the new workspace
      if (!panels.checklist) {
        setPanel("checklist", true);
      }

      toast.success(`Program "${finalName}" created successfully!`);
      
      // Reset form state
      setProgramName("");
      setSelectedType(PROGRAM_TYPES[0]?.id ?? "hello-solana");
      setSelectedTemplateId(null);
      setSourceType("standard");
      setIsPracticeMode(false);
      setShowModal(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error creating program:", error);
      toast.error(`Failed to create program: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
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
      <aside
        className={`w-64 flex-shrink-0 border-r border-border/70 backdrop-blur h-screen overflow-hidden flex flex-col fixed md:relative z-50 transition-transform duration-300 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${
        isGridTheme 
          ? "bg-[#0A0A0A]/80 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px]"
          : isMatrixTheme
          ? "bg-[#000000] bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"
          : "bg-card/60"
        }`}
        style={{ top: 0, left: 0 }}
      >
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

      <div className={`p-4 pb-8 space-y-2 text-sm flex-1 overflow-y-auto ${
        isMatrixTheme ? "text-[#00ff00]" : ""
      }`}>
        {/* My Programs Section */}
        <SidebarSection title="My Programs" defaultOpen={true} isMatrixTheme={isMatrixTheme}>
           {customPrograms.length > 0 ? (
            customPrograms.map((program) => (
              <button
                key={program.id}
                onClick={() => {
                  try {
                    console.log("Switching to program:", program.id, program.name);
                    setActiveProgram(program.id);
                    // Hard switch to the selected program workspace
                    resetPlayground();
                    setTemplate(program.id, program.code);
                    console.log("Program switched, code length:", program.code.length);
                    if (typeof window !== "undefined" && window.innerWidth < 768) {
                      toggleMobileSidebar();
                    }
                  } catch (error) {
                    console.error("Error switching program:", error);
                    toast.error(`Failed to switch to program: ${program.name}`);
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
            ))
           ) : (
             <div className="px-3 py-2 text-xs text-muted-foreground italic">
               No programs yet. Create one!
             </div>
           )}
        </SidebarSection>

        {/* Layouts Section */}
        <SidebarSection title="Layouts" defaultOpen={false} isMatrixTheme={isMatrixTheme}>
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
        </SidebarSection>

        {/* Panels Section */}
        <SidebarSection title="Panels" defaultOpen={true} isMatrixTheme={isMatrixTheme}>
            {panelItems.map((panel) => {
              const isOpen = panels[panel.id];
              const Icon = panel.icon;
              return (
                <button
                  key={panel.id}
                  onClick={() => {
                    togglePanel(panel.id);
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
        </SidebarSection>

        {/* Open Template Section */}
        <SidebarSection title="Open Template" defaultOpen={false} isMatrixTheme={isMatrixTheme}>
          <div className="space-y-1">
             <div className="px-1 pb-1">
                <input 
                  type="text" 
                  placeholder="Filter templates..." 
                  className="w-full bg-muted/20 border border-border/50 rounded px-2 py-1 text-xs focus:outline-none focus:border-primary/50"
                  onClick={(e) => e.stopPropagation()}
                />
             </div>
            {allTemplates?.map((template) => (
              <button
                key={template.id}
                onClick={async () => {
                  try {
                    console.log("Opening template:", template.id);
                    const existing = programs[`template-${template.id}`];
                    if (existing) {
                      console.log("Template already loaded, switching to:", existing.id);
                      setActiveProgram(existing.id);
                      // Hard switch to the selected template workspace
                      resetPlayground();
                      setTemplate(existing.id, existing.code);
                    } else {
                      console.log("Loading template from API:", template.id);
                      // Template not loaded yet, navigate to route which will load it
                      // The route handler will load the template and create the program session
                    }
                    router.push(`/playground/${template.id}`);
                    if (typeof window !== "undefined" && window.innerWidth < 768) {
                      toggleMobileSidebar();
                    }
                  } catch (error) {
                    console.error("Error opening template:", error);
                    toast.error(`Failed to open template: ${template.name}`);
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
            {!allTemplates?.length && (
              <div className={`text-xs px-3 py-2 ${isMatrixTheme ? "text-[#00ff00]" : "text-muted-foreground"}`}>No templates loaded.</div>
            )}
          </div>
        </SidebarSection>

        {/* Focus Mode */}
        <div className="mt-4 pt-4 border-t border-border/20 px-1">
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


              <div className="mt-4 grid gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Program Source</span>
                  <div className="flex bg-muted/30 rounded-lg p-1">
                    <button
                      onClick={() => setSourceType("standard")}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        sourceType === "standard"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Standard
                    </button>
                    <button
                      onClick={() => setSourceType("template")}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        sourceType === "template"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Templates
                    </button>
                  </div>
                </div>

                {sourceType === "standard" ? (
                  <div className="grid gap-2 max-h-[240px] overflow-y-auto pr-2">
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
                ) : (
                  <div className="grid gap-2 max-h-[240px] overflow-y-auto pr-2">
                    {allTemplates?.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplateId(template.id)}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${
                          selectedTemplateId === template.id
                            ? "border-primary bg-primary-light/60"
                            : "border-border bg-muted/20 hover:border-[#14F195]"
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-foreground">{template.name}</div>
                          <div className="text-xs text-muted-foreground">{template.description}</div>
                        </div>
                        {selectedTemplateId === template.id && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </button>
                    ))}
                    {!allTemplates?.length && (
                      <div className="text-sm text-muted-foreground py-4 text-center">
                        No templates found.
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isPracticeMode ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground"}`}>
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">Practice Mode</div>
                      <div className="text-xs text-muted-foreground">Replace code logic with TODOs</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={isPracticeMode}
                      onChange={(e) => setIsPracticeMode(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
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
                  onClick={() => {
                    setShowModal(false);
                    // Reset form state when closing modal
                    setProgramName("");
                    setSelectedType(PROGRAM_TYPES[0]?.id ?? "hello-solana");
                    setSelectedTemplateId(null);
                    setSourceType("standard");
                    setIsPracticeMode(false);
                    setIsCreating(false);
                  }}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreate} 
                  className="btn-primary"
                  disabled={
                    isCreating ||
                    (sourceType === "standard"
                      ? !selectedType
                      : !selectedTemplateId)
                  }
                >
                  {isCreating ? "Creating..." : "Create Program"}
                </button>
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

      {/* Toast notifications */}
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
    </aside>
    </>
  );
}
