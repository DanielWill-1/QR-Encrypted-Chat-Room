import type { ReactNode, ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  children?: ReactNode;
}

export function Button({ variant = "primary", size = "md", icon, children, className = "", ...props }: Props) {
  const base =
    variant === "primary"
      ? "btn-gradient text-white shadow-lg shadow-primary/20 hover:brightness-125"
      : variant === "danger"
        ? "bg-error/10 text-error border border-error/20 hover:bg-error/20"
        : variant === "ghost"
          ? "bg-white/5 border border-white/10 text-on-surface hover:bg-white/10 hover:border-white/20"
          : "bg-white/10 border border-white/10 text-on-surface hover:bg-white/20";

  const sizes: Record<string, string> = {
    sm: "px-sm py-xs text-sm",
    md: "px-md py-sm",
    lg: "px-lg py-md",
  };

  return (
    <button
      className={`rounded-lg font-[Inter] font-medium transition-all active:scale-95 flex items-center justify-center gap-sm ${base} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
