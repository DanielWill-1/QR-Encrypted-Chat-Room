import type { CryptoSession } from "@/types/crypto";

export async function deriveSessionKeys(
  sessionId: string,
  sharedSecret: CryptoKey,
  transcriptHash: Uint8Array,
  role: "host" | "joiner"
): Promise<CryptoSession> {
  const info = new Uint8Array([
    ...new TextEncoder().encode(`ep2p-session-${sessionId}`),
    ...transcriptHash,
  ]);

  const baseKey = await crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: transcriptHash,
      info,
    },
    sharedSecret,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  const sendInfo = new TextEncoder().encode(
    `ep2p ${role === "host" ? "host->joiner" : "joiner->host"} aead v1`
  );
  const recvInfo = new TextEncoder().encode(
    `ep2p ${role === "host" ? "joiner->host" : "host->joiner"} aead v1`
  );

  const sendKey = await crypto.subtle.deriveKey(
    { name: "HKDF", hash: "SHA-256", salt: new Uint8Array(0), info: sendInfo },
    sharedSecret,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  const receiveKey = await crypto.subtle.deriveKey(
    { name: "HKDF", hash: "SHA-256", salt: new Uint8Array(0), info: recvInfo },
    sharedSecret,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  return {
    sessionId,
    keyEpoch: 0,
    sendKey,
    receiveKey,
    sharedSecret,
    transcriptHash,
  };
}

export async function computeTranscriptHash(
  sessionId: string,
  hostPublicKey: string,
  joinerPublicKey: string,
  hostNonce: Uint8Array,
  joinerNonce: Uint8Array
): Promise<Uint8Array> {
  const parts = [
    "ep2p-handshake-v1",
    sessionId,
    hostPublicKey,
    joinerPublicKey,
    bytesToHex(hostNonce),
    bytesToHex(joinerNonce),
  ];
  const data = new TextEncoder().encode(parts.join("|"));
  const hash = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hash);
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
