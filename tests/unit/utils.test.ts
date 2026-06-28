import { describe, it, expect } from "vitest";
import { base64UrlEncode, base64UrlDecode, bytesToHex, hexToBytes } from "@/lib/utils/base64";

describe("base64UrlEncode / base64UrlDecode", () => {
  it("round-trips bytes", () => {
    const bytes = new Uint8Array([0, 1, 2, 255, 128, 64, 32]);
    const encoded = base64UrlEncode(bytes);
    const decoded = base64UrlDecode(encoded);
    expect(decoded).toEqual(bytes);
  });

  it("produces URL-safe strings", () => {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    const encoded = base64UrlEncode(bytes);
    expect(encoded).not.toContain("+");
    expect(encoded).not.toContain("/");
    expect(encoded).not.toContain("=");
  });

  it("handles empty bytes", () => {
    expect(base64UrlEncode(new Uint8Array(0))).toBe("");
    expect(base64UrlDecode("")).toEqual(new Uint8Array(0));
  });
});

describe("bytesToHex / hexToBytes", () => {
  it("round-trips", () => {
    const bytes = new Uint8Array([0x0a, 0xff, 0x00, 0xab]);
    const hex = bytesToHex(bytes);
    expect(hex).toBe("0aff00ab");
    expect(hexToBytes(hex)).toEqual(bytes);
  });
});
