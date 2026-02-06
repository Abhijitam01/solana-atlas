"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTemplates } from "@/hooks/use-templates";
import { usePlaygroundStore } from "@/stores/playground";
import { shallow } from "zustand/shallow";
import { Search, Code, Home, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { data: templates } = useTemplates();
  const { setExecutionMode } = usePlaygroundStore(
    (state) => ({ setExecutionMode: state.setExecutionMode }),
    shallow
  );

  // Open command palette with Cmd/Ctrl+K
  useKeyboardShortcuts([
    {
      key: "k",
      meta: true,
      handler: () => {
        setIsOpen(true);
      },
    },
    {
      key: "Escape",
      handler: () => {
        setIsOpen(false);
        setSearchQuery("");
      },
    },
  ]);

  const commands: Command[] = useMemo(() => {
    const baseCommands: Command[] = [
      {
        id: "home",
        label: "Go to Home",
        description: "Navigate to templates page",
        icon: <Home className="w-4 h-4" />,
        action: () => {
          router.push("/");
          setIsOpen(false);
        },
        keywords: ["home", "templates", "back"],
      },
      {
        id: "precomputed",
        label: "Switch to Pre-computed Mode",
        description: "Use pre-computed execution results",
        icon: <Code className="w-4 h-4" />,
        action: () => {
          setExecutionMode("precomputed");
          setIsOpen(false);
        },
        keywords: ["precomputed", "pre", "computed", "mode"],
      },
      {
        id: "live",
        label: "Switch to Live Mode",
        description: "Execute code live",
        icon: <Code className="w-4 h-4" />,
        action: () => {
          setExecutionMode("live");
          setIsOpen(false);
        },
        keywords: ["live", "execute", "mode"],
      },
    ];

    const templateCommands: Command[] =
      templates?.map((template) => ({
        id: `template-${template.id}`,
        label: template.name,
        description: template.description,
        icon: <Code className="w-4 h-4" />,
        action: () => {
          router.push(`/playground/${template.id}`);
          setIsOpen(false);
        },
        keywords: [
          template.name.toLowerCase(),
          template.description.toLowerCase(),
          template.difficulty.toLowerCase(),
          ...template.description.split(" ").map((w) => w.toLowerCase()),
        ],
      })) || [];

    return [...baseCommands, ...templateCommands];
  }, [templates, router, setExecutionMode]);

  const filteredCommands = useMemo(() => {
    if (!searchQuery.trim()) return commands;

    const query = searchQuery.toLowerCase();
    return commands.filter((cmd) =>
      cmd.keywords.some((keyword) => keyword.includes(query)) ||
      cmd.label.toLowerCase().includes(query) ||
      cmd.description?.toLowerCase().includes(query)
    );
  }, [commands, searchQuery]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl mx-4 z-50"
          >
            <div className="bg-card border border-border rounded-xl shadow-xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search commands, templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {filteredCommands.length === 0 ? (
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    No commands found
                  </div>
                ) : (
                  <div className="py-2">
                    {filteredCommands.map((command, index) => (
                      <button
                        key={command.id}
                        onClick={command.action}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                          index === selectedIndex
                            ? "bg-primary-light/50 text-foreground"
                            : "text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <div className="text-muted-foreground">
                          {command.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{command.label}</div>
                          {command.description && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {command.description}
                            </div>
                          )}
                        </div>
                        {index === selectedIndex && (
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="px-4 py-2 border-t border-border bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-background border border-border">
                      ↑↓
                    </kbd>
                    <span>Navigate</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-background border border-border">
                      Enter
                    </kbd>
                    <span>Select</span>
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-background border border-border">
                    Esc
                  </kbd>
                  <span>Close</span>
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
