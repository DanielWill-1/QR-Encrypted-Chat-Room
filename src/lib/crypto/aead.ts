import type { CryptoSession } from "@/types/crypto";

export function buildNonce(keyEpoch: number, seq: number): Uint8Array {
  const nonce = new Uint8Array(12);
  const view = new DataView(nonce.buffer);
  view.setUint32(0, keyEpoch, false);
  view.setBigUint64(4, BigInt(seq), false);
  return nonce;
}

export function buildAad(
  sessionId: string,
  protocolVersion: number,
  packetType: string,
  keyEpoch: number,
  seq: number
): Uint8Array {
  const enc = new TextEncoder();
  const sidBytes = enc.encode(sessionId);
  const typeBytes = enc.encode(packetType);
  const aad = new Uint8Array(4 + 4 + sidBytes.length + 2 + typeBytes.length);
  const view = new DataView(aad.buffer);
  let offset = 0;
  view.setUint32(offset, protocolVersion, false);
  offset += 4;
  view.setUint32(offset, keyEpoch, false);
  offset += 4;
  aad.set(sidBytes, offset);
  offset += sidBytes.length;
  view.setUint16(offset, typeBytes.length, false);
  offset += 2;
  aad.set(typeBytes, offset);
  return aad;
}

export async function encryptAesGcm(
  key: CryptoKey,
  nonce: Uint8Array,
  plaintext: Uint8Array,
  aad: Uint8Array
): Promise<Uint8Array> {
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce, additionalData: aad },
    key,
    plaintext
  );
  return new Uint8Array(encrypted);
}

export async function decryptAesGcm(
  key: CryptoKey,
  nonce: Uint8Array,
  ciphertext: Uint8Array,
  aad: Uint8Array
): Promise<Uint8Array> {
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: nonce, additionalData: aad },
    key,
    ciphertext
  );
  return new Uint8Array(decrypted);
}
