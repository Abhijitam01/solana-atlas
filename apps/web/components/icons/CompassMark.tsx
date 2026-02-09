"use client";

import * as React from "react";

export interface CompassMarkProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

/**
 * Minimal, crisp compass mark used as the core Solana Atlas icon.
 * Uses currentColor for strokes so it can adapt to any context.
 */
export function CompassMark({ size = 32, ...props }: CompassMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <rect
        x="5"
        y="5"
        width="22"
        height="22"
        rx="4"
        ry="4"
        stroke="currentColor"
        strokeWidth="1.4"
        opacity="0.55"
      />
      <path
        d="M16 7.5V24.5M7.5 16H24.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M11 21C13.2 18.3 14.8 17.2 18 16.3C20.7 15.6 21.9 14.8 23 13"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M12.2 9.8L16 6.5L19.8 9.8L16 18.5L12.2 9.8Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="1.4" fill="currentColor" />
    </svg>
  );
}


