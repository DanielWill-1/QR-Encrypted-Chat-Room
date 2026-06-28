import type { MouseEventHandler } from "react";
import { MaterialIcon } from "./MaterialIcon";

interface Props {
  icon: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  label: string;
  variant?: "default" | "primary" | "danger";
  size?: "sm" | "md";
  className?: string;
}

export function IconButton({ icon, onClick, label, variant = "default", size = "md", className = "" }: Props) {
  const base =
    variant === "primary"
      ? "text-primary hover:bg-primary/10"
      : variant === "danger"
        ? "text-error hover:bg-error/10"
        : "text-on-surface-variant hover:text-on-surface hover:bg-white/5";

  const sizes: Record<string, string> = {
    sm: "p-xs",
    md: "p-sm",
  };

  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={`rounded-full flex items-center justify-center transition-colors ${base} ${sizes[size]} ${className}`}
    >
      <MaterialIcon name={icon} size={size === "sm" ? 16 : 20} />
    </button>
  );
}
