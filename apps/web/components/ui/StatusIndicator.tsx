"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, AlertCircle, Info, Loader2 } from "lucide-react";

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
    icon: Loader2,
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
  const Icon = config.icon;
  const isAnimated = status === "loading";

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full ring-1 ring-inset ring-white/10",
        config.bg,
        className
      )}
    >
      <Icon
        className={cn(
          config.color,
          sizeConfig[size],
          isAnimated && "animate-spin"
        )}
      />
    </div>
  );
}
