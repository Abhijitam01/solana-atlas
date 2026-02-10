import { createWithEqualityFn } from "zustand/traditional";
import { persist } from "zustand/middleware";

type ThemeMode = "dark" | "light";
type PlaygroundTheme = "default" | "grid" | "matrix";

interface SettingsState {
  explanationsEnabled: boolean;
  theme: ThemeMode;
  playgroundTheme: PlaygroundTheme;
  toggleExplanations: () => void;
  setExplanationsEnabled: (enabled: boolean) => void;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  setPlaygroundTheme: (theme: PlaygroundTheme) => void;
}

export const useSettingsStore = createWithEqualityFn<SettingsState>()(
  persist(
    (set) => ({
      explanationsEnabled: true,
      theme: "dark",
      // Use the grid playground theme by default; others remain available as options
      playgroundTheme: "grid",
      toggleExplanations: () =>
        set((state) => ({ explanationsEnabled: !state.explanationsEnabled })),
      setExplanationsEnabled: (enabled) => set({ explanationsEnabled: enabled }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
      setTheme: (theme) => set({ theme }),
      setPlaygroundTheme: (theme) => set({ playgroundTheme: theme }),
    }),
    {
      name: "solana-playground-settings",
      partialize: (state) => ({
        explanationsEnabled: state.explanationsEnabled,
        theme: state.theme,
        playgroundTheme: state.playgroundTheme,
      }),
    }
  )
);
