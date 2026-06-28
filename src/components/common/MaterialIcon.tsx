interface Props {
  name: string;
  filled?: boolean;
  size?: number;
  className?: string;
}

export function MaterialIcon({ name, filled = false, size = 20, className = "" }: Props) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontSize: `${size}px`,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}`,
      }}
    >
      {name}
    </span>
  );
}
