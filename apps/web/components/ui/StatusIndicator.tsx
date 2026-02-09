"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface StatusIndicatorProps {
  status: "success" | "error" | "warning" | "info" | "loading";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const statusConfig = {
  success: {
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success-light",
  },
  error: {
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive-light",
  },
  warning: {
    icon: AlertCircle,
    color: "text-warning",
    bg: "bg-warning-light",
  },
  info: {
    icon: Info,
    color: "text-info",
    bg: "bg-info-light",
  },
  loading: {
    color: "text-primary",
    bg: "bg-primary-light",
  },
};

const sizeConfig = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export function StatusIndicator({
  status,
  size = "md",
  className,
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  const Icon = "icon" in config ? config.icon : null;

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full ring-1 ring-inset ring-white/10",
        config.bg,
        className
      )}
    >
      {status === "loading" ? (
        <LoadingSpinner
          size={size}
          className={cn(config.color, "px-2 py-1")}
          text="Loading..."
        />
      ) : (
        Icon && <Icon className={cn(config.color, sizeConfig[size])} />
      )}
    </div>
  );
}
