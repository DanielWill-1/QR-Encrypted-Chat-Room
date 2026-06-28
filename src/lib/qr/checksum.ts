const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export async function computeChecksum(data: Uint8Array): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(hash);
  const truncated = bytes.slice(0, 5);
  let bits = 0n;
  for (let i = 0; i < 5; i++) {
    bits = (bits << 8n) | BigInt(truncated[i]);
  }
  let result = "";
  for (let i = 0; i < 8; i++) {
    const idx = Number((bits >> BigInt(35 - i * 5)) & 0x1fn);
    result += BASE32_ALPHABET[idx];
  }
  return result;
}

export async function verifyChecksum(data: Uint8Array, checksum: string): Promise<boolean> {
  const computed = await computeChecksum(data);
  return computed === checksum.toUpperCase();
}
