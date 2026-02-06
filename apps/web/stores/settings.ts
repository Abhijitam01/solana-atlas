import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeMode = "dark" | "light";

interface SettingsState {
  explanationsEnabled: boolean;
  theme: ThemeMode;
  toggleExplanations: () => void;
  setExplanationsEnabled: (enabled: boolean) => void;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      explanationsEnabled: true,
      theme: "dark",
      toggleExplanations: () =>
        set((state) => ({ explanationsEnabled: !state.explanationsEnabled })),
      setExplanationsEnabled: (enabled) => set({ explanationsEnabled: enabled }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "solana-playground-settings",
      partialize: (state) => ({
        explanationsEnabled: state.explanationsEnabled,
        theme: state.theme,
      }),
    }
  )
);
