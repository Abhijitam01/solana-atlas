"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Code, Map, Rocket, BookOpen, CheckCircle2, PanelLeftClose } from "lucide-react";
import { useLayoutStore } from "@/stores/layout";
import { usePlaygroundStore } from "@/stores/playground";

const ONBOARDING_KEY = "solana-playground-onboarding-completed";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: typeof Code;
  targetElement?: string; // CSS selector or data attribute for element to highlight
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function OnboardingGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const highlightRef = useRef<HTMLDivElement | null>(null);
  
  const {
    togglePanel,
    setLayoutMode,
    toggleMobileSidebar,
    mobileSidebarOpen,
    zenMode,
    toggleZenMode,
    closeAllPanels,
  } = useLayoutStore(
    (state) => ({
      togglePanel: state.togglePanel,
      setLayoutMode: state.setLayoutMode,
      toggleMobileSidebar: state.toggleMobileSidebar,
      mobileSidebarOpen: state.mobileSidebarOpen,
      zenMode: state.zenMode,
      toggleZenMode: state.toggleZenMode,
      closeAllPanels: state.closeAllPanels,
    })
  );

  const { setSelectedLine } = usePlaygroundStore(
    (state) => ({
      setSelectedLine: state.setSelectedLine,
    })
  );

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      // Show onboarding after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Highlight target element for each step
  useEffect(() => {
    if (!isOpen) return;

    const step = steps[currentStep];
    if (!step?.targetElement) {
      setHighlightedElement(null);
      return;
    }

    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      const element = document.querySelector(step.targetElement!) as HTMLElement;
      if (element) {
        setHighlightedElement(element);
        // Scroll element into view
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        setHighlightedElement(null);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [currentStep, isOpen]);

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to Solana Playground!",
      description: "Learn Solana development through interactive, explorable code. This guide will show you the key features.",
      icon: Code,
    },
    {
      id: "explanations",
      title: "Line-by-Line Explanations",
      description: "Click on any code line to see detailed explanations. The explanation panel will appear on the right showing what the code does and why it matters.",
      icon: BookOpen,
      targetElement: '[data-panel-container]', // Target side panel area
      action: {
        label: "Open Explanation Panel",
        onClick: () => {
          togglePanel("explanation");
          setLayoutMode("code-only");
          // Select a line to show explanation
          setSelectedLine(7);
        },
      },
    },
    {
      id: "code-panel",
      title: "Interactive Code Editor",
      description: "This is your code editor. You can edit Solana programs here. Try clicking on a line number to see explanations, or start typing to see AI-powered completions!",
      icon: Code,
      targetElement: '.editor-shell', // Target code editor
    },
    {
      id: "program-map",
      title: "Program Map",
      description: "Visualize your program's structure - see instructions, accounts, PDAs, and CPI calls at a glance. Click 'Panels' in the sidebar to open it.",
      icon: Map,
      targetElement: '[data-panel-container]', // Target side panel area
      action: {
        label: "Open Program Map",
        onClick: () => {
          togglePanel("map");
          setLayoutMode("code-map");
        },
      },
    },
    {
      id: "execution",
      title: "Run & Inspect",
      description: "Execute your programs and see real-time state changes. Watch accounts transform, view balances, and trace execution flow.",
      icon: Rocket,
      targetElement: '[data-panel-container]', // Target side panel area
      action: {
        label: "Open Execution Panel",
        onClick: () => {
          togglePanel("execution");
          setLayoutMode("code-exec");
        },
      },
    },
    {
      id: "zen-mode",
      title: "Zen Mode",
      description: "Focus on your code without distractions. Zen mode hides the sidebar and panels, giving you a clean coding experience. You can toggle it from the sidebar.",
      icon: PanelLeftClose,
      targetElement: '[data-zen-toggle]', // Target zen mode button
      action: {
        label: zenMode ? "Exit Zen Mode" : "Try Zen Mode",
        onClick: () => {
          if (!zenMode) {
            toggleZenMode();
          }
        },
      },
    },
    {
      id: "complete",
      title: "You're All Set!",
      description: "Start exploring templates from the sidebar, or create your own program. Happy coding!",
      icon: CheckCircle2,
    },
  ];

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(ONBOARDING_KEY, "true");
    setHighlightedElement(null);
    // After onboarding, reset layout so user can discover panels themselves
    closeAllPanels();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!isOpen) return null;

  const step = steps[currentStep];
  if (!step) return null;
  const Icon = step.icon;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  // Calculate highlight position if element exists
  const highlightStyle = highlightedElement
    ? (() => {
        const rect = highlightedElement.getBoundingClientRect();
        return {
          position: "fixed" as const,
          top: `${rect.top}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          zIndex: 99,
        };
      })()
    : null;

  return (
    <>
      {/* Highlight overlay for target element */}
      <AnimatePresence>
        {highlightedElement && highlightStyle && (
          <motion.div
            ref={highlightRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={highlightStyle}
            className="pointer-events-none"
          >
            <div className="absolute inset-0 border-4 border-primary rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] animate-pulse" />
            {/* Arrow pointing to element */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
              <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg text-sm font-semibold whitespace-nowrap">
                👆 Look here!
              </div>
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-primary mx-auto" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding dialog */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border/70 rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 relative z-[101]"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Progress indicator */}
            <div className="flex gap-2 mb-6">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    index <= currentStep ? "bg-primary" : "bg-border"
                  }`}
                />
              ))}
            </div>

            {/* Step content */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <Icon className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">{step.title}</h2>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Action button */}
            {step.action && !isLastStep && (
              <button
                onClick={() => {
                  step.action?.onClick();
                  // Close mobile sidebar if open on mobile
                  if (typeof window !== "undefined" && window.innerWidth < 768 && mobileSidebarOpen) {
                    toggleMobileSidebar();
                  }
                  // Move to next step after a delay
                  setTimeout(() => {
                    handleNext();
                  }, 500);
                }}
                className="w-full mb-4 btn-primary"
              >
                {step.action.label}
              </button>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevious}
                  disabled={isFirstStep}
                  className="px-4 py-2 rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  {isLastStep ? "Get Started" : "Next"}
                  {!isLastStep && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
