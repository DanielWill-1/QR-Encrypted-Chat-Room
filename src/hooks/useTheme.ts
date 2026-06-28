import { useStore } from "@/state/store";
import { useEffect } from "react";

export function useTheme() {
  const theme = useStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return {
    theme,
    setTheme: (t: "dark" | "light") => useStore.getState().setTheme(t),
  };
}
