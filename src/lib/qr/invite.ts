import { base64UrlEncode, base64UrlDecode } from "@/lib/utils/base64";
import { canonicalJson, decodeUtf8, encodeUtf8 } from "@/lib/utils/json";
import { computeChecksum, verifyChecksum } from "./checksum";
import { inviteSchema, type InvitePayload } from "@/lib/protocol/schemas";
import { QR_VERSION } from "@/config/constants";

const QR_PREFIX = "ep2p1.";

export function encodeInvite(payload: InvitePayload): Promise<string> {
  const jsonBytes = canonicalJson(payload);
  const encoded = base64UrlEncode(jsonBytes);
  return computeChecksum(encodeUtf8(`ep2p-invite-v1`)).then((cs) =>
    `${QR_PREFIX}${encoded}.${cs}`
  );
}

export async function decodeInvite(value: string): Promise<InvitePayload> {
  const trimmed = value.trim();
  if (!trimmed.startsWith(QR_PREFIX)) {
    throw new InviteError("Invalid invitation format: wrong prefix");
  }

  const rest = trimmed.slice(QR_PREFIX.length);
  const lastDot = rest.lastIndexOf(".");
  if (lastDot < 0) {
    throw new InviteError("Invalid invitation format: missing checksum");
  }

  const encodedPayload = rest.slice(0, lastDot);
  const checksum = rest.slice(lastDot + 1);

  const jsonBytes = base64UrlDecode(encodedPayload);
  const verifyData = encodeUtf8(`ep2p-invite-v1`);

  const combined = new Uint8Array(verifyData.length + jsonBytes.length);
  combined.set(verifyData);
  combined.set(jsonBytes, verifyData.length);

  const valid = await verifyChecksum(combined, checksum);
  if (!valid) {
    throw new InviteError("Invalid invitation: checksum mismatch");
  }

  const json = JSON.parse(decodeUtf8(jsonBytes));

  if (json.v !== QR_VERSION) {
    throw new InviteError(
      `Unsupported invitation version: got ${json.v}, expected ${QR_VERSION}`
    );
  }

  if (json.expiresAt < Date.now()) {
    throw new InviteError("This invitation has expired");
  }

  const result = inviteSchema.safeParse(json);
  if (!result.success) {
    throw new InviteError(`Invalid invitation: ${result.error.message}`);
  }

  return result.data;
}

export class InviteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InviteError";
  }
}
