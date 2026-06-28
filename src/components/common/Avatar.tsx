import { useMemo } from "react";

interface Props {
  seed: string;
  size?: number;
  className?: string;
  rounded?: "full" | "lg";
}

const COLORS = ["#a078ff", "#0566d9", "#4cd7f6", "#d0bcff", "#adc6ff"];

export function Avatar({ seed, size = 40, className = "", rounded = "full" }: Props) {
  const { bgColor, ellipses } = useMemo(() => generateIdenticon(seed), [seed]);

  return (
    <div
      className={`overflow-hidden shrink-0 border border-white/10 ${rounded === "lg" ? "rounded-lg" : "rounded-full"} ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <rect width={40} height={40} fill={bgColor} />
        {ellipses.map((e, i) => (
          <ellipse key={i} cx={e.cx} cy={e.cy} rx={e.rx} ry={e.ry} fill="rgba(255,255,255,0.3)" />
        ))}
      </svg>
    </div>
  );
}

function hashString(str: string): number[] {
  const nums: number[] = [];
  for (let i = 0; i < str.length; i++) {
    nums.push(str.charCodeAt(i));
  }
  while (nums.length < 16) nums.push(0);
  return nums;
}

function generateIdenticon(seed: string) {
  const hash = hashString(seed);
  const colorIdx = hash[0] % COLORS.length;
  const bgColor = COLORS[colorIdx];
  const ellipses: { cx: number; cy: number; rx: number; ry: number }[] = [];

  for (let i = 0; i < 4; i++) {
    const cx = (hash[i * 3 + 1] % 30) + 5;
    const cy = (hash[i * 3 + 2] % 30) + 5;
    const r = (hash[i * 3 + 3] % 10) + 4;
    const rx = r + (hash[i * 3 + 4] % 4);
    const ry = r + (hash[i * 3 + 5] % 4);
    ellipses.push({ cx, cy, rx, ry });
  }

  return { bgColor, ellipses };
}
