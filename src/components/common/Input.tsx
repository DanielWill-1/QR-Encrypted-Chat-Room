import type { InputHTMLAttributes, ReactNode } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
}

export function Input({ icon, rightIcon, className = "", containerClassName = "", ...props }: Props) {
  return (
    <div className={`input-pill rounded-lg flex items-center px-md py-sm gap-sm ${containerClassName}`}>
      {icon && <span className="text-on-surface-variant shrink-0">{icon}</span>}
      <input
        className="bg-transparent border-none outline-none w-full text-on-surface placeholder-on-surface-variant/50 focus:ring-0 p-0 font-[Geist] text-[13px]"
        {...props}
      />
      {rightIcon && <span className="text-on-surface-variant shrink-0">{rightIcon}</span>}
    </div>
  );
}
