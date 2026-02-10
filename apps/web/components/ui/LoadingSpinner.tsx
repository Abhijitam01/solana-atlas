interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function LoadingSpinner({
  size = "md",
  className = "",
  text = "Loading",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium text-foreground/70 ${sizeClasses[size]} ${className}`}
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      <span className="loading-dot" style={{ animationDelay: "0s" }} />
      <span className="loading-dot" style={{ animationDelay: "0.2s" }} />
      <span className="loading-dot" style={{ animationDelay: "0.4s" }} />
    </span>
  );
}
