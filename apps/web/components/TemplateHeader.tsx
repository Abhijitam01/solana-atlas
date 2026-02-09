"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { usePlaygroundStore } from "@/stores/playground";
import { useTemplates } from "@/hooks/use-templates";
import type { TemplateMetadata } from "@solana-playground/types";
import { ChevronLeft, ChevronRight, Play, Database, Eye, EyeOff, Moon, Sun, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { Tooltip } from "@/components/ui/Tooltip";
import { useSettingsStore } from "@/stores/settings";
import { shallow } from "zustand/shallow";
import { Logo } from "@/components/Logo";
import { AuthButton } from "@/components/auth/AuthButton";
import { useAuth } from "@/components/providers/AuthProvider";

interface TemplateHeaderProps {
  template: {
    id: string;
    metadata: TemplateMetadata;
  };
}

export function TemplateHeader({ template }: TemplateHeaderProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();
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
    playgroundTheme,
    setPlaygroundTheme,
  } = useSettingsStore();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const currentIndex = templates?.findIndex((t) => t.id === template.id) ?? -1;
  const hasNext = currentIndex >= 0 && currentIndex < (templates?.length ?? 0) - 1;
  const hasPrev = currentIndex > 0;
  const nextTemplate = hasNext ? templates?.[currentIndex + 1] : null;
  const prevTemplate = hasPrev ? templates?.[currentIndex - 1] : null;

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-card/70 shadow-sm backdrop-blur">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 lg:py-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-8">
          <div className="flex items-center gap-3 sm:gap-6 w-full lg:w-auto min-w-0">
            <Logo height={60} className="sm:h-[80px] flex-shrink-0" />
            <div className="h-4 sm:h-6 w-px bg-border flex-shrink-0 hidden sm:block" />
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
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
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <h1 className="text-lg sm:text-2xl md:text-3xl font-semibold leading-tight text-foreground truncate">
                    {template.metadata.name}
                  </h1>
                  <Badge
                    variant={template.metadata.difficulty === "beginner" ? "success" : "info"}
                    size="sm"
                    className="flex-shrink-0"
                  >
                    {template.metadata.difficulty}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-0.5 max-w-2xl line-clamp-2 sm:line-clamp-none">
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
          <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto justify-end lg:justify-start flex-wrap">
            <div className="flex items-center gap-1 sm:gap-2 rounded-xl bg-muted/50 p-1 sm:p-1.5">
              <Tooltip content="Select playground theme">
                <select
                  value={playgroundTheme}
                  onChange={(e) => setPlaygroundTheme(e.target.value as "default" | "grid")}
                  className="rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold text-foreground bg-background transition-all duration-fast border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary appearance-none pr-6 sm:pr-8"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.5rem center',
                  }}
                >
                  <option value="default">Theme: Default</option>
                  <option value="grid">Theme: Grid</option>
                </select>
              </Tooltip>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 rounded-xl bg-muted/50 p-1 sm:p-1.5">
              <Tooltip content={`Explanations ${explanationsEnabled ? "on" : "off"}`}>
                <button
                  onClick={toggleExplanations}
                  className={`flex items-center gap-1 sm:gap-2 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold transition-all duration-fast ${
                    explanationsEnabled
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {explanationsEnabled ? (
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                  <span className="hidden sm:inline">Explain</span>
                </button>
              </Tooltip>
              <Tooltip content={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-1 sm:gap-2 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold text-muted-foreground transition-all duration-fast hover:text-foreground"
                >
                  {theme === "dark" ? (
                    <Moon className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    <Sun className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                  <span className="hidden sm:inline">{theme === "dark" ? "Dark" : "Light"}</span>
                </button>
              </Tooltip>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 rounded-xl bg-muted/50 p-1 sm:p-1.5">
              <Tooltip content="Use pre-computed execution results">
                <button
                  onClick={() => setExecutionMode("precomputed")}
                  className={`flex items-center gap-1 sm:gap-2 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold transition-all duration-fast ${
                    executionMode === "precomputed"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Database className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Pre-computed</span>
                </button>
              </Tooltip>
              <Tooltip content="Execute code live (coming soon)">
                <button
                  onClick={() => setExecutionMode("live")}
                  className={`flex items-center gap-1 sm:gap-2 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold transition-all duration-fast ${
                    executionMode === "live"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Live (soon)</span>
                </button>
              </Tooltip>
            </div>
            <StatusIndicator
              status={executionMode === "precomputed" ? "success" : "info"}
              size="sm"
              className="hidden sm:block"
            />
            {user && (
              <Tooltip content="Sign Out">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1 sm:gap-2 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-fast"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </Tooltip>
            )}
            <div className="ml-0 sm:ml-2 lg:ml-4">
              <AuthButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
