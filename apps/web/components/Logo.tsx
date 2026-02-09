"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  /** Height of the logo in pixels */
  height?: number;
  /** If true, shows the SOLANA ATLAS wordmark next to the icon */
  showWordmark?: boolean;
  /** Optional className for the outer wrapper */
  className?: string;
}

/**
 * Brand logo used in the main navigation and app headers.
 * Uses the Gemini-generated logo image as the primary mark with "SOLANA ATLAS" wordmark beside it.
 */
export function Logo({ 
  height = 72, 
  showWordmark = true, 
  className = ""
}: LogoProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <Link href="/" className={`flex items-center gap-2 ${className}`}>
        <div
          className="relative flex items-center justify-center bg-[#14F195] rounded"
          style={{ width: height, height: height }}
        >
          <span className="text-black font-bold text-xs">SA</span>
        </div>
        {showWordmark && (
          <span className="font-semibold tracking-[0.18em] text-sm md:text-base uppercase text-[#FAFAFA]">
            Solana Atlas
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: height, height: height }}
      >
        <Image
          src="/logo/Gemini_Generated_Image_3z7tl23z7tl23z7t.png"
          alt="Solana Atlas"
          width={height}
          height={height}
          className="w-full h-full object-contain"
          priority
          unoptimized
          onError={() => setImageError(true)}
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
