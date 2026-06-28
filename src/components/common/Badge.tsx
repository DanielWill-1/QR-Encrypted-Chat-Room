import type { ReactNode } from "react";
import { MaterialIcon } from "./MaterialIcon";

interface Props {
  variant?: "primary" | "secondary" | "tertiary" | "error";
  label: string;
  icon?: string;
  pulse?: boolean;
  className?: string;
}

const variants: Record<string, string> = {
  primary: "text-primary border-primary/30 bg-primary/10",
  secondary: "text-secondary border-secondary/30 bg-secondary/10",
  tertiary: "text-tertiary border-tertiary/30 bg-tertiary/10",
  error: "text-error border-error/30 bg-error/10",
};

export function Badge({ variant = "primary", label, icon, pulse, className = "" }: Props) {
  return (
    <span className={`font-[Geist] text-[12px] tracking-[0.05em] font-semibold border px-xs py-[2px] rounded-full uppercase flex items-center gap-xs ${variants[variant]} ${className}`}>
      {pulse && <span className={`w-2 h-2 rounded-full bg-current animate-pulse`} />}
      {icon && <MaterialIcon name={icon} size={14} filled />}
      {label}
    </span>
  );
}
