import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { StructuredData } from "@/components/seo/StructuredData";

import { getBaseUrl } from "@/lib/seo";

const siteUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Solana Atlas - Interactive Solana Programming Playground",
    template: "%s | Solana Atlas"
  },
  description: "Learn Solana programming through interactive, explorable code. Run real Solana programs, watch state transform, and understand execution—not just syntax. Zero setup. No wallet. Open source.",
  keywords: [
    "Solana",
    "Solana programming",
    "Solana development",
    "blockchain development",
    "Web3",
    "cryptocurrency",
    "Rust",
    "Anchor framework",
    "Solana tutorials",
    "interactive coding",
    "Solana playground",
    "Solana IDE",
    "smart contracts",
    "dApp development",
    "Solana learning"
  ],
  authors: [{ name: "Solana Atlas Team" }],
  creator: "Solana Atlas",
  publisher: "Solana Atlas",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Solana Atlas",
    title: "Solana Atlas - Interactive Solana Programming Playground",
    description: "Learn Solana programming through interactive, explorable code. Run real Solana programs, watch state transform, and understand execution—not just syntax.",
    images: [
      {
        url: "/logo/og.png",
        width: 1200,
        height: 630,
        alt: "Solana Atlas - Interactive Solana Programming Playground",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Solana Atlas - Interactive Solana Programming Playground",
    description: "Learn Solana programming through interactive, explorable code. Zero setup. No wallet. Open source.",
    images: ["/logo/og.png"],
    creator: "@solanaatlas",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon/Gemini_Generated_Image_5j01pm5j01pm5j01.png", sizes: "any" },
    ],
    apple: [
      { url: "/favicon/Gemini_Generated_Image_5j01pm5j01pm5j01.png", sizes: "180x180" },
    ],
    shortcut: "/favicon/Gemini_Generated_Image_5j01pm5j01pm5j01.png",
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // yahoo: "your-yahoo-verification-code",
  },
  category: "education",
};

export const viewport: Metadata["viewport"] = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <StructuredData />
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
