import { SESSION_ID_BYTES } from "@/config/constants";
import { base64UrlEncode } from "./base64";
import type { SessionId } from "@/types/session";
import type { PacketId, TransferId } from "@/types/app";

function randomBytes(n: number): Uint8Array {
  const bytes = new Uint8Array(n);
  crypto.getRandomValues(bytes);
  return bytes;
}

export function makeSessionId(): SessionId {
  return base64UrlEncode(randomBytes(SESSION_ID_BYTES)) as SessionId;
}

export function makePacketId(): PacketId {
  return base64UrlEncode(randomBytes(16)) as PacketId;
}

export function makeTransferId(): TransferId {
  return base64UrlEncode(randomBytes(16)) as TransferId;
}

export function nowMs(): number {
  return Date.now();
}
