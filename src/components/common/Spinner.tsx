interface Props {
  size?: "sm" | "md";
  className?: string;
}

export function Spinner({ size = "md", className = "" }: Props) {
  const pixels = size === "sm" ? 16 : 24;
  return (
    <div
      className={`border-2 border-outline/30 border-t-primary rounded-full animate-spin ${className}`}
      style={{ width: pixels, height: pixels }}
    />
  );
}
