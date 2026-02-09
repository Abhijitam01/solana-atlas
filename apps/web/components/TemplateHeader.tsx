"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { usePlaygroundStore } from "@/stores/playground";
import { useTemplates } from "@/hooks/use-templates";
import type { TemplateMetadata } from "@solana-playground/types";
import { ChevronLeft, ChevronRight, Play, Database, Eye, EyeOff, Moon, Sun } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { Tooltip } from "@/components/ui/Tooltip";
import { useSettingsStore } from "@/stores/settings";
import { shallow } from "zustand/shallow";
import { Logo } from "@/components/Logo";
import { AuthButton } from "@/components/auth/AuthButton";

interface TemplateHeaderProps {
  template: {
    id: string;
    metadata: TemplateMetadata;
  };
}

export function TemplateHeader({ template }: TemplateHeaderProps) {
  const router = useRouter();
  const { data: templates } = useTemplates();
  const { executionMode, setExecutionMode } = usePlaygroundStore(
    (state) => ({
      executionMode: state.executionMode,
      setExecutionMode: state.setExecutionMode,
    }),
    shallow
  );
  const {
    explanationsEnabled,
    toggleExplanations,
    theme,
    toggleTheme,
  } = useSettingsStore();

  const currentIndex = templates?.findIndex((t) => t.id === template.id) ?? -1;
  const hasNext = currentIndex >= 0 && currentIndex < (templates?.length ?? 0) - 1;
  const hasPrev = currentIndex > 0;
  const nextTemplate = hasNext ? templates?.[currentIndex + 1] : null;
  const prevTemplate = hasPrev ? templates?.[currentIndex - 1] : null;

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-card/70 shadow-sm backdrop-blur">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Logo size={32} />
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-3">
              {hasPrev && prevTemplate && (
                <Tooltip content={`Previous: ${prevTemplate.name}`}>
                  <button
                    onClick={() => router.push(`/playground/${prevTemplate.id}`)}
                    className="rounded-xl p-2 text-muted-foreground transition-all duration-fast hover:bg-muted/60 hover:text-foreground"
                    aria-label="Previous template"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </Tooltip>
              )}
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold text-foreground">
                    {template.metadata.name}
                  </h1>
                  <Badge
                    variant={template.metadata.difficulty === "beginner" ? "success" : "info"}
                    size="sm"
                  >
                    {template.metadata.difficulty}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {template.metadata.description}
                </p>
              </div>
              {hasNext && nextTemplate && (
                <Tooltip content={`Next: ${nextTemplate.name}`}>
                  <button
                    onClick={() => router.push(`/playground/${nextTemplate.id}`)}
                    className="rounded-xl p-2 text-muted-foreground transition-all duration-fast hover:bg-muted/60 hover:text-foreground"
                    aria-label="Next template"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </Tooltip>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-1.5">
              <Tooltip content={`Explanations ${explanationsEnabled ? "on" : "off"}`}>
                <button
                  onClick={toggleExplanations}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-fast ${
                    explanationsEnabled
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {explanationsEnabled ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                  <span>Explain</span>
                </button>
              </Tooltip>
              <Tooltip content={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-all duration-fast hover:text-foreground"
                >
                  {theme === "dark" ? (
                    <Moon className="w-4 h-4" />
                  ) : (
                    <Sun className="w-4 h-4" />
                  )}
                  <span>{theme === "dark" ? "Dark" : "Light"}</span>
                </button>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-1.5">
              <Tooltip content="Use pre-computed execution results">
                <button
                  onClick={() => setExecutionMode("precomputed")}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-fast ${
                    executionMode === "precomputed"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Database className="w-4 h-4" />
                  <span>Pre-computed</span>
                </button>
              </Tooltip>
              <Tooltip content="Execute code live (coming soon)">
                <button
                  onClick={() => setExecutionMode("live")}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-fast ${
                    executionMode === "live"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Play className="w-4 h-4" />
                  <span>Live (soon)</span>
                </button>
              </Tooltip>
            </div>
            <StatusIndicator
              status={executionMode === "precomputed" ? "success" : "info"}
              size="sm"
            />
            <div className="ml-4">
              <AuthButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
