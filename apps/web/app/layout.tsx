import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "Solana Atlas",
  description: "Learn Solana programming through interactive, explorable code",
  icons: {
    icon: "/favicon/Gemini_Generated_Image_5j01pm5j01pm5j01.png",
    apple: "/favicon/Gemini_Generated_Image_5j01pm5j01pm5j01.png",
    shortcut: "/favicon/Gemini_Generated_Image_5j01pm5j01pm5j01.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
