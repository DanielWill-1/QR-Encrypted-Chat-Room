import type { PacketType, PlainPacket } from "@/types/packets";
import type { CryptoSession } from "@/types/crypto";
import { PACKET_VERSION } from "@/config/constants";
import { makePacketId, nowMs } from "@/lib/utils/id";
import { buildNonce, buildAad, encryptAesGcm, decryptAesGcm } from "@/lib/crypto/aead";

export interface EncryptedPacket {
  pid: string;
  v: number;
  sid: string;
  epoch: number;
  seq: number;
  type: PacketType;
  ciphertext: string;
  tag: string;
}

export function buildPlaintextPacket(
  type: PacketType,
  payload: Record<string, unknown>
): PlainPacket {
  return {
    id: makePacketId(),
    type,
    v: PACKET_VERSION,
    ts: nowMs(),
    payload,
  };
}

export async function encodePacket(
  session: CryptoSession,
  seq: number,
  packet: PlainPacket
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const plaintext = encoder.encode(JSON.stringify(packet));
  const aad = buildAad(session.sessionId, PACKET_VERSION, packet.type, session.keyEpoch, seq);
  const nonce = buildNonce(session.keyEpoch, seq);
  const ciphertext = await encryptAesGcm(session.sendKey, nonce, plaintext, aad);

  const tag = ciphertext.slice(-16);
  const ct = ciphertext.slice(0, -16);

  const envelope = {
    pid: "ep2p-chat",
    v: PACKET_VERSION,
    sid: session.sessionId,
    epoch: session.keyEpoch,
    seq,
    type: packet.type,
    ciphertext: btoa(String.fromCharCode(...ct)),
    tag: btoa(String.fromCharCode(...tag)),
  };

  return encoder.encode(JSON.stringify(envelope)).buffer as ArrayBuffer;
}

export async function decodePacket(
  session: CryptoSession,
  frame: ArrayBuffer
): Promise<PlainPacket | null> {
  const decoder = new TextDecoder();
  const text = decoder.decode(new Uint8Array(frame));

  let envelope: EncryptedPacket;
  try {
    envelope = JSON.parse(text);
  } catch {
    return null;
  }

  if (envelope.sid !== session.sessionId) return null;
  if (envelope.v !== PACKET_VERSION) return null;
  if (envelope.epoch !== session.keyEpoch) return null;

  const aad = buildAad(session.sessionId, PACKET_VERSION, envelope.type, envelope.epoch, envelope.seq);
  const nonce = buildNonce(envelope.epoch, envelope.seq);

  const ctBytes = Uint8Array.from(atob(envelope.ciphertext), (c) => c.charCodeAt(0));
  const tagBytes = Uint8Array.from(atob(envelope.tag), (c) => c.charCodeAt(0));
  const combined = new Uint8Array(ctBytes.length + tagBytes.length);
  combined.set(ctBytes);
  combined.set(tagBytes, ctBytes.length);

  let plaintext: Uint8Array;
  try {
    plaintext = await decryptAesGcm(session.receiveKey, nonce, combined, aad);
  } catch {
    return null;
  }

  const packet = JSON.parse(decoder.decode(plaintext));
  return packet as PlainPacket;
}
