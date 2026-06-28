import type { SessionId, Session } from "./session";
import type { RtcConfig } from "./transport";

export type Brand<T, B extends string> = T & { readonly __brand: B };

export type PacketId = Brand<string, "PacketId">;
export type TransferId = Brand<string, "TransferId">;

export type AppView =
  | "landing"
  | "dashboard"
  | "chat"
  | "peers"
  | "vault"
  | "qrPairing"
  | "pairingCode"
  | "logs"
  | "settings";

export interface Toast {
  id: string;
  type: "info" | "success" | "error" | "warning";
  message: string;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  event: string;
  sessionId?: SessionId;
  detail: string;
  level: "info" | "warning" | "error";
  icon: string;
}

export interface AppConfig {
  signalingUrl: string;
  rtc: RtcConfig;
  displayName: string;
  theme: "dark" | "light";
  glassOpacity: number;
  accentColor: string;
  autoDestroy: boolean;
  listenPort: number;
  maxSessions: number;
}

export interface AppState {
  view: AppView;
  navView: AppView | null;
  activeSessionId: SessionId | null;
  sessions: Record<string, Session>;
  sessionOrder: string[];
  theme: "dark" | "light";
  toasts: Toast[];
  auditLog: LogEntry[];
  config: AppConfig;
  isScanning: boolean;
}
