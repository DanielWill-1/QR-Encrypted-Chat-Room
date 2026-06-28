import { useStore } from "./store";
import { transition } from "./sessionReducer";
import type { SessionId, Session } from "@/types/session";
import type { ChatMessage } from "@/types/session";
import type { LogEntry } from "@/types/app";
import type { PlainPacket } from "@/types/packets";
import type { CryptoSession } from "@/types/crypto";
import { generateEcdhKeyPair, exportPublicKey, importPublicKey, deriveSharedSecret } from "@/lib/crypto/keys";
import { encodeInvite, decodeInvite } from "@/lib/qr/invite";
import { deriveSessionKeys, computeTranscriptHash } from "@/lib/crypto/hkdf";
import { makeSessionId, makePacketId, nowMs } from "@/lib/utils/id";
import { base64UrlEncode } from "@/lib/utils/base64";
import { INVITE_TTL_MS, HANDSHAKE_NONCE_BYTES } from "@/config/constants";
import type { InvitePayload } from "@/lib/protocol/schemas";
import { TransportManager } from "@/lib/transport/TransportManager";
import QRCode from "qrcode";

const sessionCryptos = new Map<string, CryptoSession>();

export function getCrypto(sessionId: string): CryptoSession | undefined {
  return sessionCryptos.get(sessionId);
}

export function setCrypto(sessionId: string, crypto: CryptoSession) {
  sessionCryptos.set(sessionId, crypto);
}

export function removeCrypto(sessionId: string) {
  sessionCryptos.delete(sessionId);
}

const pendingHandshakes = new Map<string, HandshakeState>();

interface HandshakeState {
  keyPair: { publicKey: CryptoKey; privateKey: CryptoKey };
  hostNonce?: Uint8Array;
  joinerNonce?: Uint8Array;
  joinerPub?: string;
  remotePub?: CryptoKey;
}

const transport = TransportManager.getInstance();

transport.registerPacketHandler((sessionId, packet) => {
  if (sessionId === "__control__") return;
  handlePacket(sessionId, packet);
});

function sid(plain: string): SessionId {
  return plain as SessionId;
}

async function handlePacket(sessionId: string, packet: PlainPacket) {
  const store = useStore.getState();
  const s = store.sessions[sid(sessionId)];

  switch (packet.type) {
    case "JOIN": {
      if (!s || s.role !== "host") return;
      await handleJoinAsHost(sessionId, s, packet.payload as { sid: string; joinerPub: string; joinerNonce: string; features: string[] });
      break;
    }
    case "WELCOME": {
      if (!s || s.role !== "joiner") return;
      await handleWelcome(sessionId, s, packet.payload as { hostNonce: string; transcriptHash: string });
      break;
    }
    case "TEXT": {
      if (!s) return;
      const p = packet.payload as { body: string; encoding: string };
      receiveMessage(sid(sessionId), p.body);
      break;
    }
    case "TYPING": {
      if (!s) return;
      const p = packet.payload as { active: boolean; ttlMs: number };
      store.updateSession(sid(sessionId), { typingPeers: [p.active ? "peer" : ""].filter(Boolean) } as never);
      setTimeout(() => {
        const current = useStore.getState().sessions[sid(sessionId)];
        if (current?.typingPeers) {
          useStore.getState().updateSession(sid(sessionId), { typingPeers: [] } as never);
        }
      }, p.ttlMs || 3000);
      break;
    }
    case "PING": {
      if (!s) return;
      const p = packet.payload as { nonce: string; sentAt: number };
      transport.sendEncrypted(sessionId, "PONG", { nonce: p.nonce, sentAt: p.sentAt });
      break;
    }
    case "PONG": {
      if (!s) return;
      const p = packet.payload as { nonce: string; sentAt: number };
      store.updateSession(sid(sessionId), { latency: Date.now() - p.sentAt } as never);
      break;
    }
    case "DESTROY_SESSION": {
      if (!s) return;
      const dp = packet.payload as { reason: string };
      store.updateSession(sid(sessionId), transition(s, "destroying").state as never);
      addLog("Session Destroyed", sid(sessionId), `Peer destroyed session: ${dp.reason}`, "warning", "warning");
      setTimeout(() => {
        transport.destroySession(sessionId);
        removeCrypto(sessionId);
        store.removeSession(sid(sessionId));
      }, 2000);
      break;
    }
    case "LEAVE": {
      if (!s) return;
      const lp = packet.payload as { reason: string };
      store.updateSession(sid(sessionId), { errorMessage: `Peer left: ${lp.reason}` });
      transport.destroySession(sessionId);
      removeCrypto(sessionId);
      break;
    }
  }
}

async function handleJoinAsHost(
  sessionId: string,
  session: Session,
  params: { sid: string; joinerPub: string; joinerNonce: string; features: string[] }
) {
  const store = useStore.getState();
  try {
    store.updateSession(sid(sessionId), transition(session, "authenticating").state as never);
    const hs = pendingHandshakes.get(sessionId);
    if (!hs) throw new Error("No pending handshake");

    const joinerPubKey = await importPublicKey(params.joinerPub);
    const joinerNonceBytes = new Uint8Array(base64UrlDecode(params.joinerNonce));
    const hostNonceBytes = hs.hostNonce!;

    const sharedSecret = await deriveSharedSecret(hs.keyPair.privateKey, joinerPubKey);
    const transcriptHash = await computeTranscriptHash(
      sessionId, await exportPublicKey(hs.keyPair.publicKey),
      params.joinerPub, hostNonceBytes, joinerNonceBytes
    );

    const crypto = await deriveSessionKeys(sessionId, sharedSecret, transcriptHash, "host");
    setCrypto(sessionId, crypto);
    transport.setCrypto(sessionId, crypto);

    transport.sendRaw(sessionId, {
      type: "WELCOME", id: makePacketId(), v: 1, ts: nowMs(),
      payload: { hostNonce: base64UrlEncode(hostNonceBytes), transcriptHash: base64UrlEncode(transcriptHash) },
    });

    store.updateSession(sid(sessionId), transition(session, "active").state as never);
    store.updateSession(sid(sessionId), {
      peer: { alias: `Peer-${sessionId.slice(0, 6)}`, fingerprint: params.joinerPub.slice(0, 11), publicKey: params.joinerPub, joinedAt: nowMs() },
    });

    pendingHandshakes.delete(sessionId);
    addLog("Peer Authenticated", sid(sessionId), "Session keys derived, channel active", "info", "verified_user");
  } catch (err) {
    store.updateSession(sid(sessionId), transition(session, "error").state as never);
    store.updateSession(sid(sessionId), { errorMessage: `Handshake failed: ${(err as Error).message}` });
  }
}

async function handleWelcome(
  sessionId: string,
  session: Session,
  params: { hostNonce: string; transcriptHash: string }
) {
  const store = useStore.getState();
  try {
    store.updateSession(sid(sessionId), transition(session, "authenticating").state as never);
    const hs = pendingHandshakes.get(sessionId);
    if (!hs) throw new Error("No pending handshake");

    const hostNonceBytes = new Uint8Array(base64UrlDecode(params.hostNonce));
    const joinerNonceBytes = hs.joinerNonce!;

    const sharedSecret = await deriveSharedSecret(hs.keyPair.privateKey, hs.remotePub!);
    const transcriptHash = await computeTranscriptHash(
      sessionId, hs.joinerPub!, await exportPublicKey(hs.keyPair.publicKey),
      hostNonceBytes, joinerNonceBytes
    );

    const crypto = await deriveSessionKeys(sessionId, sharedSecret, transcriptHash, "joiner");
    setCrypto(sessionId, crypto);
    transport.setCrypto(sessionId, crypto);

    store.updateSession(sid(sessionId), transition(session, "active").state as never);
    store.updateSession(sid(sessionId), {
      peer: { alias: `Host-${sessionId.slice(0, 6)}`, fingerprint: params.hostNonce.slice(0, 11), publicKey: hs.joinerPub!, joinedAt: nowMs() },
    });

    pendingHandshakes.delete(sessionId);
    addLog("Authenticated", sid(sessionId), "Session keys derived, channel active", "info", "verified_user");
  } catch (err) {
    store.updateSession(sid(sessionId), transition(session, "error").state as never);
    store.updateSession(sid(sessionId), { errorMessage: `Handshake failed: ${(err as Error).message}` });
  }
}

export async function createSession(
  displayName?: string
): Promise<{ session: Session; inviteString: string; invitePayload: InvitePayload }> {
  const store = useStore.getState();
  if (Object.keys(store.sessions).length >= store.config.maxSessions) {
    throw new Error("Maximum sessions reached");
  }

  const sessionId = makeSessionId();
  const keyPair = await generateEcdhKeyPair();
  const pubEncoded = await exportPublicKey(keyPair.publicKey);
  const fp = pubEncoded.slice(0, 11);
  const hostNonce = crypto.getRandomValues(new Uint8Array(HANDSHAKE_NONCE_BYTES));

  const createdAt = nowMs();
  const expiresAt = createdAt + INVITE_TTL_MS;

  const invitePayload: InvitePayload = {
    pid: "ep2p-chat", v: 1, sid: sessionId, createdAt, expiresAt,
    role: "host", pub: pubEncoded, fp,
    sigMode: "optional-server",
    sig: { url: store.config.signalingUrl, room: sessionId },
    features: ["text", "typing", "destroy"],
  };

  const inviteString = await encodeInvite(invitePayload);
  const inviteQrDataUrl = await QRCode.toDataURL(inviteString, {
    margin: 1,
    width: 240,
    color: { dark: "#131313", light: "#ffffffff" },
  });

  const session: Session = {
    id: sessionId, state: "creating", createdAt, expiresAt,
    role: "host", displayName: displayName ?? store.config.displayName,
    messages: [], unreadCount: 0, inviteString, inviteQrDataUrl,
  };

  store.addSession(session);
  store.setActiveSession(sessionId);
  pendingHandshakes.set(sessionId, { keyPair, hostNonce });
  store.updateSession(sessionId, transition(session, "inviting").state as never);

  transport.createHostSession(sessionId, store.config.signalingUrl)
    .then(() => {
      const updatedSession = useStore.getState().sessions[sessionId];
      if (!updatedSession || updatedSession.state === "destroying" || updatedSession.state === "destroyed") return;
      useStore.getState().updateSession(sessionId, transition(updatedSession, "connecting").state as never);
    })
    .catch((err) => {
      const updatedSession = useStore.getState().sessions[sessionId];
      if (!updatedSession) return;
      useStore.getState().updateSession(sessionId, {
        state: "error",
        errorMessage: `Transport failed: ${(err as Error).message}`,
      });
      pendingHandshakes.delete(sessionId);
      addLog("Transport Error", sessionId, `Transport failed: ${(err as Error).message}`, "error", "error");
    });

  addLog("Session Created", sessionId, `Created ephemeral session ${sessionId}`, "info", "add_circle");

  transport.onLeave(sessionId, () => {
    transport.destroySession(sessionId);
    removeCrypto(sessionId);
    pendingHandshakes.delete(sessionId);
  });

  return { session: { ...session, state: "inviting" }, inviteString, invitePayload };
}

export async function joinSession(inviteString: string): Promise<Session> {
  const store = useStore.getState();
  const invite = await decodeInvite(inviteString);

  if (store.sessions[invite.sid]) {
    throw new Error("Already in this session");
  }

  const keyPair = await generateEcdhKeyPair();
  const pubEncoded = await exportPublicKey(keyPair.publicKey);
  const joinerNonce = crypto.getRandomValues(new Uint8Array(HANDSHAKE_NONCE_BYTES));
  const remotePub = await importPublicKey(invite.pub);

  const session: Session = {
    id: invite.sid as SessionId, state: "joining",
    createdAt: nowMs(), expiresAt: invite.expiresAt,
    role: "joiner", displayName: store.config.displayName,
    messages: [], unreadCount: 0,
  };

  store.addSession(session);
  store.setActiveSession(invite.sid as SessionId);

  const signalingUrl = invite.sig?.url ?? store.config.signalingUrl;
  pendingHandshakes.set(invite.sid, { keyPair, joinerNonce, joinerPub: pubEncoded, remotePub });

  try {
    await transport.createJoinerSession(invite.sid, signalingUrl);
  } catch (err) {
    store.updateSession(invite.sid as SessionId, transition(session, "error").state as never);
    store.updateSession(invite.sid as SessionId, { errorMessage: `Transport failed: ${(err as Error).message}` });
    pendingHandshakes.delete(invite.sid);
    throw err;
  }

  const updatedSession = useStore.getState().sessions[invite.sid];
  if (!updatedSession) {
    throw new Error("Session was not persisted after join");
  }
  store.updateSession(invite.sid as SessionId, transition(updatedSession, "connecting").state as never);

  transport.sendRaw(invite.sid, {
    type: "JOIN", id: makePacketId(), v: 1, ts: nowMs(),
    payload: { sid: invite.sid, joinerPub: pubEncoded, joinerNonce: base64UrlEncode(joinerNonce), features: ["text", "typing", "destroy"] },
  });

  addLog("Session Joined", invite.sid as SessionId, `Joined session ${invite.sid}`, "info", "login");

  transport.onLeave(invite.sid, () => {
    transport.destroySession(invite.sid);
    removeCrypto(invite.sid);
    pendingHandshakes.delete(invite.sid);
  });

  return { ...session, state: "connecting" };
}

export function destroySession(id: SessionId) {
  const store = useStore.getState();
  const session = store.sessions[id];
  if (!session) return;

  store.updateSession(id, transition(session, "destroying").state as never);

  const crypto = sessionCryptos.get(id);
  if (crypto) {
    transport.sendEncrypted(id, "DESTROY_SESSION", { reason: "User destroyed", deleteImmediately: true }).catch(() => {});
  }

  addLog("Session Destroyed", id, "User requested session destruction", "warning", "warning");

  setTimeout(() => {
    transport.destroySession(id);
    removeCrypto(id);
    pendingHandshakes.delete(id);
    store.removeSession(id);
  }, 2000);
}

export function sendMessage(id: SessionId, body: string): ChatMessage {
  const store = useStore.getState();
  const ts = nowMs();
  const message: ChatMessage = {
    id: makePacketId(), type: "sent", body, timestamp: ts, peerAlias: undefined,
  };

  const session = store.sessions[id];
  if (!session) return message;

  store.updateSession(id, { messages: [...session.messages, message] });

  transport.sendEncrypted(id, "TEXT", { body, encoding: "utf-8" }).catch((err) => {
    addLog("Send Error", id, `Failed to send: ${(err as Error).message}`, "error", "error");
  });

  return message;
}

export function receiveMessage(id: SessionId, body: string, peerAlias?: string): ChatMessage {
  const store = useStore.getState();
  const ts = nowMs();
  const message: ChatMessage = {
    id: makePacketId(), type: "received", body, timestamp: ts, peerAlias,
  };

  const session = store.sessions[id];
  if (!session) return message;

  const isActive = store.activeSessionId === id;
  store.updateSession(id, {
    messages: [...session.messages, message],
    unreadCount: isActive ? 0 : session.unreadCount + 1,
  });

  return message;
}

function addLog(
  event: string,
  sessionId: SessionId | undefined,
  detail: string,
  level: LogEntry["level"],
  icon: string
) {
  useStore.getState().addLogEntry({
    id: makePacketId(), timestamp: nowMs(), event, sessionId, detail, level, icon,
  });
}

function base64UrlDecode(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(padLen);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
