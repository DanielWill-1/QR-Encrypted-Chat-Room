import type { SessionId, PacketId, TransferId } from "./session";

export type PacketType =
  | "JOIN"
  | "WELCOME"
  | "TEXT"
  | "IMAGE"
  | "FILE"
  | "FILE_CHUNK"
  | "PING"
  | "PONG"
  | "TYPING"
  | "ACK"
  | "LEAVE"
  | "DESTROY_SESSION";

export interface PacketEnvelope {
  pid: string;
  v: number;
  sid: string;
  epoch: number;
  seq: number;
  type: PacketType;
  ciphertext: string;
  tag: string;
}

export interface TextPayload {
  body: string;
  encoding: "utf-8";
}

export interface TypingPayload {
  active: boolean;
  ttlMs: number;
}

export interface AckPayload {
  packetId: PacketId;
  status: "received" | "failed";
}

export interface PingPayload {
  nonce: string;
  sentAt: number;
}

export interface JoinPayload {
  sid: string;
  joinerPub: string;
  joinerNonce: string;
  features: string[];
}

export interface WelcomePayload {
  hostNonce: string;
  transcriptHash: string;
}

export interface LeavePayload {
  reason: string;
}

export interface DestroyPayload {
  reason: string;
  deleteImmediately: boolean;
}

export interface ImageMetaPayload {
  transferId: TransferId;
  name: string;
  mime: string;
  size: number;
  sha256: string;
  chunkSize: number;
  chunkCount: number;
  width?: number;
  height?: number;
}

export interface FileMetaPayload {
  transferId: TransferId;
  name: string;
  mime: string;
  size: number;
  sha256: string;
  chunkSize: number;
  chunkCount: number;
}

export interface FileChunkPayload {
  transferId: TransferId;
  index: number;
  bytes: string;
}

export type PacketPayload =
  | { type: "TEXT"; payload: TextPayload }
  | { type: "TYPING"; payload: TypingPayload }
  | { type: "ACK"; payload: AckPayload }
  | { type: "PING"; payload: PingPayload }
  | { type: "PONG"; payload: PingPayload }
  | { type: "JOIN"; payload: JoinPayload }
  | { type: "WELCOME"; payload: WelcomePayload }
  | { type: "LEAVE"; payload: LeavePayload }
  | { type: "DESTROY_SESSION"; payload: DestroyPayload }
  | { type: "IMAGE"; payload: ImageMetaPayload }
  | { type: "FILE"; payload: FileMetaPayload }
  | { type: "FILE_CHUNK"; payload: FileChunkPayload };

export interface PlainPacket {
  id: PacketId;
  type: PacketType;
  v: number;
  ts: number;
  payload: Record<string, unknown>;
}
