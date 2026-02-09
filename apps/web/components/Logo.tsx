"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  /** Height of the logo in pixels */
  height?: number;
  /** If true, shows the SOLANA ATLAS wordmark next to the icon */
  showWordmark?: boolean;
  /** Optional className for the outer wrapper */
  className?: string;
  /** Use full logo (with text) instead of just icon */
  useFullLogo?: boolean;
}

/**
 * Brand logo used in the main navigation and app headers.
 * Uses the actual logo image files from /public/logo/
 * The full logo includes the compass icon with N/E/S/W and "SOLANA ATLAS" text on black background.
 */
export function Logo({ 
  height = 48, 
  showWordmark = true, 
  className = "",
  useFullLogo = true 
}: LogoProps) {
  // Use full logo by default - shows the complete logo with compass + "SOLANA ATLAS" text
  if (useFullLogo) {
    return (
      <Link href="/" className={`flex items-center ${className}`}>
        <div 
          className="relative flex items-center"
          style={{ height: `${height}px` }}
        >
          <Image
            src="/logo/solana-atlas-full.png"
            alt="Solana Atlas"
            width={400}
            height={100}
            className="h-full w-auto object-contain"
            style={{ 
              height: `${height}px`,
              width: "auto",
              maxWidth: "none"
            }}
            priority
            unoptimized
          />
        </div>
      </Link>
    );
  }

  // Icon-only fallback
  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: height, height: height }}
      >
        <Image
          src="/logo/icon.png"
          alt="Solana Atlas"
          width={height}
          height={height}
          className="w-full h-full object-contain"
          priority
          unoptimized
        />
      </div>
      {showWordmark && (
        <span className="font-semibold tracking-[0.18em] text-sm md:text-base uppercase text-[#FAFAFA]">
          Solana Atlas
        </span>
      )}
    </Link>
  );
}


