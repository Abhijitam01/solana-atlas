import { createWithEqualityFn } from "zustand/traditional";

export type PanelId =
  | "map"
  | "explanation"
  | "execution"
  | "inspector"
  | "checklist"
  | "mermaid"
  | "tests";

export type LayoutMode = "code-only" | "code-map" | "code-exec";

interface LayoutState {
  panels: Record<PanelId, boolean>;
  sidebarVisible: boolean;
  mobileSidebarOpen: boolean;
  sidebarWidth: number;
  zenMode: boolean;
  layoutMode: LayoutMode;
  togglePanel: (panel: PanelId) => void;
  setPanel: (panel: PanelId, open: boolean) => void;
  closeAllPanels: () => void;
  toggleZenMode: () => void;
  setLayoutMode: (mode: LayoutMode) => void;
  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setSidebarWidth: (width: number) => void;
}

const initialPanels: Record<PanelId, boolean> = {
  map: false,
  explanation: false,
  execution: false,
  inspector: false,
  checklist: false,
  mermaid: false,
  tests: false,
};

export const useLayoutStore = createWithEqualityFn<LayoutState>((set) => ({
  panels: { ...initialPanels },
  sidebarVisible: true,
  mobileSidebarOpen: false,
  // 5% wider than previous 256px default.
  sidebarWidth: 269,
  zenMode: false,
  layoutMode: "code-only",
  togglePanel: (panel) =>
    set((state) => ({
      panels: { ...state.panels, [panel]: !state.panels[panel] },
    })),
  setPanel: (panel, open) =>
    set((state) => ({
      panels: { ...state.panels, [panel]: open },
    })),
  closeAllPanels: () => set({ panels: { ...initialPanels }, layoutMode: "code-only" }),
  toggleZenMode: () =>
    set((state) => {
      const nextZen = !state.zenMode;
      return {
        zenMode: nextZen,
        sidebarVisible: !nextZen,
        panels: nextZen ? { ...initialPanels } : { ...initialPanels },
        layoutMode: "code-only",
      };
    }),
  setLayoutMode: (mode) =>
    set(() => {
      if (mode === "code-map") {
        return {
          layoutMode: mode,
          panels: { ...initialPanels, map: true },
        };
      }
      if (mode === "code-exec") {
        return {
          layoutMode: mode,
          panels: { ...initialPanels, execution: true },
        };
      }
      return {
        layoutMode: "code-only",
        panels: { ...initialPanels },
      };
    }),
  toggleMobileSidebar: () =>
    set((state) => ({
      mobileSidebarOpen: !state.mobileSidebarOpen,
    })),
  setMobileSidebarOpen: (open) =>
    set({ mobileSidebarOpen: open }),
  setSidebarWidth: (width) =>
    set({ sidebarWidth: Math.max(220, Math.min(520, Math.round(width))) }),
}));
