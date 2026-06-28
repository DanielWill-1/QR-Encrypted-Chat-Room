import { useStore } from "./store";
import type { Session } from "@/types/session";

export function useActiveSession(): Session | null {
  const id = useStore((s) => s.activeSessionId);
  return useStore((s) => (id ? s.sessions[id] : null));
}

export function useSessionList(): Session[] {
  return useStore((s) =>
    s.sessionOrder.map((id) => s.sessions[id]).filter(Boolean)
  );
}

export function useUnreadCount(): number {
  return useStore((s) =>
    Object.values(s.sessions).reduce((sum, sess) => sum + (sess.unreadCount ?? 0), 0)
  );
}
