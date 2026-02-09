"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  /** Size of the square logo mark in pixels */
  size?: number;
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
 */
export function Logo({ 
  size = 40, 
  showWordmark = true, 
  className = "",
  useFullLogo = false 
}: LogoProps) {
  // If using full logo, show the complete logo with text
  if (useFullLogo) {
    return (
      <Link href="/" className={`flex items-center ${className}`}>
        <Image
          src="/logo/solana-atlas-full.png"
          alt="Solana Atlas"
          width={size * 4}
          height={size}
          className="h-auto w-auto max-h-[60px] object-contain"
          priority
        />
      </Link>
    );
  }

  // Otherwise, show icon + optional wordmark
  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo/icon.png"
          alt="Solana Atlas"
          width={size}
          height={size}
          className="w-full h-full object-contain"
          priority
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


