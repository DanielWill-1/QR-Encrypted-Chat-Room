import { create } from "zustand";
import type { AppState, AppConfig } from "@/types/app";
import type { SessionId, Session } from "@/types/session";
import { SIGNALING_DEFAULT_URL, RTC_CONFIG } from "@/config/constants";

const DEFAULT_CONFIG: AppConfig = {
  signalingUrl: SIGNALING_DEFAULT_URL,
  rtc: { iceServers: RTC_CONFIG.iceServers ?? [] },
  displayName: "Ghost_Operator",
  theme: "dark",
  glassOpacity: 40,
  accentColor: "primary",
  autoDestroy: true,
  listenPort: 44321,
  maxSessions: 8,
};

export const useStore = create<{
  // State
  view: AppState["view"];
  navView: AppState["navView"];
  activeSessionId: SessionId | null;
  sessions: Record<string, Session>;
  sessionOrder: string[];
  theme: "dark" | "light";
  toasts: AppState["toasts"];
  auditLog: AppState["auditLog"];
  config: AppConfig;

  // Actions
  setView: (view: AppState["view"]) => void;
  setNavView: (view: AppState["navView"]) => void;
  setActiveSession: (id: SessionId | null) => void;
  addSession: (session: Session) => void;
  updateSession: (id: SessionId, updates: Partial<Session>) => void;
  removeSession: (id: SessionId) => void;
  setTheme: (theme: "dark" | "light") => void;
  addToast: (toast: AppState["toasts"][number]) => void;
  removeToast: (id: string) => void;
  addLogEntry: (entry: AppState["auditLog"][number]) => void;
  updateConfig: (updates: Partial<AppConfig>) => void;
  destroySession: (id: SessionId) => void;
}>((set) => ({
  view: "landing",
  navView: null,
  activeSessionId: null,
  sessions: {},
  sessionOrder: [],
  theme: "dark",
  toasts: [],
  auditLog: [],
  config: DEFAULT_CONFIG,

  setView: (view) => set({ view }),
  setNavView: (navView) => set({ navView }),
  setActiveSession: (id) => set({ activeSessionId: id }),
  addSession: (session) =>
    set((s) => ({
      sessions: { ...s.sessions, [session.id]: session },
      sessionOrder: [session.id, ...s.sessionOrder],
    })),
  updateSession: (id, updates) =>
    set((s) => ({
      sessions: {
        ...s.sessions,
        [id]: { ...s.sessions[id], ...updates },
      },
    })),
  removeSession: (id) =>
    set((s) => {
      const { [id]: _, ...rest } = s.sessions;
      return {
        sessions: rest,
        sessionOrder: s.sessionOrder.filter((sid) => sid !== id),
        activeSessionId: s.activeSessionId === id ? null : s.activeSessionId,
      };
    }),
  setTheme: (theme) => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    set({ theme });
  },
  addToast: (toast) => set((s) => ({ toasts: [...s.toasts, toast] })),
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  addLogEntry: (entry) => set((s) => ({ auditLog: [...s.auditLog, entry] })),
  updateConfig: (updates) =>
    set((s) => ({ config: { ...s.config, ...updates } })),

  destroySession: (id) => {
    set((s) => {
      if (!s.sessions[id]) return s;
      return {
        sessions: {
          ...s.sessions,
          [id]: { ...s.sessions[id], state: "destroyed" as const, messages: [] },
        },
      };
    });
    setTimeout(() => {
      set((s) => {
        if (!s.sessions[id]) return s;
        const { [id]: _, ...rest } = s.sessions;
        return {
          sessions: rest,
          sessionOrder: s.sessionOrder.filter((sid) => sid !== id),
          activeSessionId: s.activeSessionId === id ? null : s.activeSessionId,
        };
      });
    }, 2000);
  },
}));
