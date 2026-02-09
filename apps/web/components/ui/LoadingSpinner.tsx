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
      className={`loading-wave font-medium text-foreground/70 ${sizeClasses[size]} ${className}`}
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      {Array.from(text).map((char, idx) => (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={`${char}-${idx}`}
          className="loading-wave__char"
          style={{ animationDelay: `${idx * 0.08}s` }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}
