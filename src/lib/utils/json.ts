const encoder = new TextEncoder();

export function canonicalJson(value: unknown): Uint8Array {
  const sorted = deepSort(value);
  const json = JSON.stringify(sorted);
  return encoder.encode(json);
}

function deepSort(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(deepSort);
  }
  if (value !== null && typeof value === "object") {
    const keys = Object.keys(value).sort();
    const result: Record<string, unknown> = {};
    for (const key of keys) {
      result[key] = deepSort((value as Record<string, unknown>)[key]);
    }
    return result;
  }
  return value;
}

export function encodeUtf8(str: string): Uint8Array {
  return encoder.encode(str);
}

export function decodeUtf8(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}
