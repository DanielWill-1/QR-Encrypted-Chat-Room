import type { ReactNode } from "react";

interface Props {
  variant?: "light" | "strong" | "modal";
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  hover?: boolean;
  padded?: boolean;
}

export function GlassPanel({ variant = "light", className = "", children, onClick, hover, padded = false }: Props) {
  const base =
    variant === "strong"
      ? "glass-level-2"
      : variant === "modal"
        ? "glass-level-2"
        : "glass-level-1";

  return (
    <div
      className={`${base} ${padded ? (variant === "modal" ? "rounded-xl p-xl" : "rounded-xl p-md") : ""} ${hover ? "glass-hover transition-all duration-300" : ""} ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
