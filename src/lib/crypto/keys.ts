import { base64UrlEncode, base64UrlDecode } from "@/lib/utils/base64";

const ECDH_CURVE = "P-256";
const KEY_USAGES: KeyUsage[] = ["deriveBits"];

export interface EcdhKeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

export async function generateEcdhKeyPair(): Promise<EcdhKeyPair> {
  const pair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: ECDH_CURVE },
    true,
    KEY_USAGES
  );
  return pair as unknown as EcdhKeyPair;
}

export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey("spki", key);
  return base64UrlEncode(new Uint8Array(raw));
}

export async function importPublicKey(encoded: string): Promise<CryptoKey> {
  const bytes = base64UrlDecode(encoded);
  return crypto.subtle.importKey(
    "spki",
    bytes,
    { name: "ECDH", namedCurve: ECDH_CURVE },
    true,
    []
  );
}

export async function deriveSharedSecret(
  privateKey: CryptoKey,
  remotePublicKey: CryptoKey
): Promise<CryptoKey> {
  const bits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: remotePublicKey },
    privateKey,
    256
  );
  return crypto.subtle.importKey(
    "raw",
    bits,
    { name: "HKDF" },
    false,
    ["deriveKey"]
  );
}

export function shortFingerprint(publicKeyBytes: Uint8Array): string {
  const hex = Array.from(publicKeyBytes.slice(0, 5))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  return `${hex.slice(0, 4)}-${hex.slice(4)}`;
}
