"use client";

import { Panel, PanelGroup, PanelResizeHandle, type MixedSizes } from "react-resizable-panels";
import { useEffect, Fragment } from "react";

interface ResizablePanelsProps {
  children: React.ReactNode[];
  storageKey?: string;
  direction?: "horizontal" | "vertical";
  defaultSizes?: number[];
}

export function ResizablePanels({
  children,
  storageKey,
  direction = "horizontal",
  defaultSizes,
}: ResizablePanelsProps) {
  useEffect(() => {
    // Load saved sizes from localStorage if available
    if (storageKey && typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          // Apply saved sizes if they exist
          JSON.parse(saved);
        } catch {
          // Ignore parse errors
        }
      }
    }
  }, [storageKey]);

  const handleResize = (sizes: MixedSizes[]) => {
    if (storageKey && typeof window !== "undefined") {
      const numericSizes = sizes.map((s) => {
        if (typeof s === "number") return s;
        if (typeof s === "object" && s !== null) {
          if ("sizePercentage" in s && typeof s.sizePercentage === "number") {
            return s.sizePercentage;
          }
          if ("sizePixels" in s && typeof s.sizePixels === "number") {
            return s.sizePixels;
          }
        }
        return 0;
      });
      localStorage.setItem(storageKey, JSON.stringify(numericSizes));
    }
  };

  return (
    <PanelGroup
      direction={direction}
      onLayout={(sizes) => handleResize(sizes)}
      className="w-full min-h-[70vh]"
    >
      {children.map((child, index) => (
        <Fragment key={index}>
          <Panel
            defaultSizePercentage={defaultSizes?.[index] || 100 / children.length}
            minSizePercentage={15}
            maxSizePercentage={70}
          >
            <div className="h-full w-full min-h-0">{child}</div>
          </Panel>
          {index < children.length - 1 && (
            <PanelResizeHandle className="w-1 bg-border hover:bg-primary/50 transition-colors duration-fast relative group">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-0.5 h-8 bg-muted-foreground/30 group-hover:bg-primary rounded-full transition-colors duration-fast" />
              </div>
            </PanelResizeHandle>
          )}
        </Fragment>
      ))}
    </PanelGroup>
  );
}
