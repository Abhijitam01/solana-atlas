"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "info" | "destructive";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  className,
}: BadgeProps) {
  const variantStyles = {
    default: "bg-primary-light/80 text-primary border border-primary/20",
    success: "bg-success-light/80 text-success border border-success/20",
    warning: "bg-warning-light/80 text-warning border border-warning/20",
    info: "bg-info-light/80 text-info border border-info/20",
    destructive: "bg-destructive-light/80 text-destructive border border-destructive/20",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-xs",
    lg: "px-4 py-1.5 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium uppercase tracking-wide",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}
