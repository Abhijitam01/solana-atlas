"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from '@trpc/client';
import { useState, useEffect } from "react";
import { useSettingsStore } from "@/stores/settings";
import { trpc } from "@/lib/trpc-client";
import { AuthProvider } from "@/components/providers/AuthProvider";
import superjson from "superjson";

function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );
  
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
        }),
      ],
    })
  );

  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("solana-playground-settings");
    if (!stored) {
      setTheme("dark");
    }
  }, [setTheme]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
