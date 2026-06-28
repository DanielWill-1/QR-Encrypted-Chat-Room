export const PROTOCOL_ID = "ep2p-chat";
export const QR_VERSION = 1;
export const PACKET_VERSION = 1;
export const SESSION_ID_BYTES = 16;
export const HANDSHAKE_NONCE_BYTES = 16;
export const INVITE_TTL_MS = 10 * 60 * 1000;
export const CONNECTION_TIMEOUT_MS = 45_000;
export const AUTH_TIMEOUT_MS = 15_000;
export const TEXT_MAX_BYTES = 16_384;
export const IMAGE_MAX_BYTES = 20 * 1024 * 1024;
export const FILE_CHUNK_SIZE = 64 * 1024;
export const FILE_MAX_BYTES = 100 * 1024 * 1024;
export const MAX_SESSIONS = 8;
export const PING_INTERVAL_MS = 10_000;
export const PING_MISS_THRESHOLD = 3;
export const DESTROY_CLEANUP_MS = 2_000;

export const RTC_CONFIG: RTCConfiguration = {
  iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
};

export const SIGNALING_DEFAULT_URL = "ws://localhost:3001";
