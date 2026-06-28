import { useStore } from "@/state/store";
import { useMemo } from "react";
import type { AppView } from "@/types/app";

export function useView(): AppView {
  const activeId = useStore((s) => s.activeSessionId);
  const navView = useStore((s) => s.navView);

  return useMemo(() => {
    if (activeId) return "chat";
    return navView ?? "landing";
  }, [activeId, navView]);
}
