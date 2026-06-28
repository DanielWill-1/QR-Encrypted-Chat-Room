import type { CSSProperties } from "react";

interface Props {
  name: string;
  filled?: boolean;
  size?: number;
  className?: string;
}

export function MaterialIcon({ name, filled = false, size = 20, className = "" }: Props) {
  return (
    <span
      className={`material-symbols-outlined inline-flex shrink-0 items-center justify-center align-middle leading-none ${className}`}
      aria-hidden="true"
      style={{
        fontSize: `${size}px`,
        width: `${size}px`,
        height: `${size}px`,
        overflow: "hidden",
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
      } as CSSProperties}
    >
      {name}
    </span>
  );
}
