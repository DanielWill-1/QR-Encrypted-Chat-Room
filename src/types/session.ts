import type { Brand } from "./app";

export type SessionId = Brand<string, "SessionId">;
export type PacketId = Brand<string, "PacketId">;
export type TransferId = Brand<string, "TransferId">;

export type SessionState =
  | "idle"
  | "creating"
  | "inviting"
  | "joining"
  | "connecting"
  | "authenticating"
  | "active"
  | "expiring"
  | "expired"
  | "destroying"
  | "destroyed"
  | "error";

export interface PeerInfo {
  alias: string;
  fingerprint: string;
  publicKey: string;
  joinedAt: number;
}

export interface ChatMessage {
  id: PacketId;
  type: "sent" | "received";
  body: string;
  timestamp: number;
  peerAlias?: string;
}

export interface Session {
  id: SessionId;
  state: SessionState;
  createdAt: number;
  expiresAt: number;
  role: "host" | "joiner";
  displayName: string;
  peer?: PeerInfo;
  messages: ChatMessage[];
  inviteString?: string;
  inviteQrDataUrl?: string;
  errorMessage?: string;
  unreadCount: number;
  latency?: number;
  typingPeers?: string[];
}
