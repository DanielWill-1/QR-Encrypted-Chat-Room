import type { TransportHandle } from "@/types/transport";
import type { CryptoSession } from "@/types/crypto";
import type { PlainPacket } from "@/types/packets";
import { ReplayWindow } from "@/lib/protocol/replay";
import { encodePacket, decodePacket, buildPlaintextPacket } from "@/lib/protocol/codec";

interface TransportSession {
  handle: TransportHandle;
  signalingClient: SignalingClient;
  seq: number;
  crypto: CryptoSession | null;
  replay: ReplayWindow;
}

interface SignalingClient {
  send(msg: Record<string, unknown>): void;
  close(): void;
}

export type PacketCallback = (sessionId: string, packet: PlainPacket) => void;
export type ConnectionStateCallback = (sessionId: string, state: RTCPeerConnectionState, iceState: RTCIceConnectionState) => void;

export class TransportManager {
  private static instance: TransportManager;
  private sessions = new Map<string, TransportSession>();
  private onPacket: PacketCallback | null = null;
  private onConnectionChange: ConnectionStateCallback | null = null;
  private onLeaveCallbacks = new Map<string, Array<(sessionId: string) => void>>();

  static getInstance(): TransportManager {
    if (!TransportManager.instance) {
      TransportManager.instance = new TransportManager();
    }
    return TransportManager.instance;
  }

  registerPacketHandler(handler: PacketCallback) {
    this.onPacket = handler;
  }

  registerConnectionHandler(handler: ConnectionStateCallback) {
    this.onConnectionChange = handler;
  }

  onLeave(sessionId: string, cb: (sessionId: string) => void) {
    const cbs = this.onLeaveCallbacks.get(sessionId) ?? [];
    cbs.push(cb);
    this.onLeaveCallbacks.set(sessionId, cbs);
  }

  getSession(sessionId: string): TransportSession | undefined {
    return this.sessions.get(sessionId);
  }

  isActive(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  sendRaw(sessionId: string, data: Record<string, unknown>) {
    const ts = this.sessions.get(sessionId);
    if (!ts || ts.handle.dataChannel.readyState !== "open") return false;
    ts.handle.dataChannel.send(JSON.stringify(data));
    return true;
  }

  async sendEncrypted(sessionId: string, type: string, payload: Record<string, unknown>) {
    const ts = this.sessions.get(sessionId);
    if (!ts || !ts.crypto || ts.handle.dataChannel.readyState !== "open") return false;
    const packet = buildPlaintextPacket(type as never, payload);
    const seq = ts.seq++;
    try {
      const frame = await encodePacket(ts.crypto, seq, packet);
      ts.handle.dataChannel.send(frame);
      return true;
    } catch {
      return false;
    }
  }

  getConnectionState(sessionId: string) {
    const ts = this.sessions.get(sessionId);
    if (!ts) return { connectionState: "closed" as RTCPeerConnectionState, iceConnectionState: "closed" as RTCIceConnectionState };
    return {
      connectionState: ts.handle.pc.connectionState,
      iceConnectionState: ts.handle.pc.iceConnectionState,
    };
  }

  setCrypto(sessionId: string, crypto: CryptoSession) {
    const ts = this.sessions.get(sessionId);
    if (ts) ts.crypto = crypto;
  }

  async createHostSession(sessionId: string, signalingUrl: string): Promise<TransportHandle> {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
    });
    const dc = pc.createDataChannel("ep2p-control", { ordered: true });
    return this.setupSession(sessionId, signalingUrl, pc, dc, true);
  }

  async createJoinerSession(sessionId: string, signalingUrl: string): Promise<TransportHandle> {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
    });
    return this.setupSession(sessionId, signalingUrl, pc, null, false);
  }

  destroySession(sessionId: string) {
    const ts = this.sessions.get(sessionId);
    if (!ts) return;
    try { ts.signalingClient.close(); } catch {}
    try { ts.handle.dataChannel.close(); } catch {}
    try { ts.handle.pc.close(); } catch {}
    this.sessions.delete(sessionId);
  }

  setIsTyping(sessionId: string, active: boolean) {
    this.sendEncrypted(sessionId, "TYPING", { active, ttlMs: 3000 });
  }

  sendPing(sessionId: string) {
    const nonce = crypto.randomUUID();
    this.sendEncrypted(sessionId, "PING", { nonce, sentAt: Date.now() });
    return nonce;
  }

  sendAck(sessionId: string, packetId: string) {
    this.sendEncrypted(sessionId, "ACK", { packetId, status: "received" });
  }

  private setupSession(
    sessionId: string,
    signalingUrl: string,
    pc: RTCPeerConnection,
    dc: RTCDataChannel | null,
    isHost: boolean
  ): Promise<TransportHandle> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error("Connection timeout"));
      }, 45_000);

      const signaling = new WebSocket(signalingUrl);
      let peerId: string | null = null;
      let dataChannel = dc!;
      let iceDone = false;
      let dcOpen = false;

      const cleanup = () => clearTimeout(timeout);

      const emitConnectionChange = () => {
        this.onConnectionChange?.(
          sessionId,
          pc.connectionState,
          pc.iceConnectionState
        );
      };

      const emitLeave = (reason: string) => {
        const cbs = this.onLeaveCallbacks.get(sessionId);
        if (cbs) cbs.forEach((cb) => cb(sessionId));
        this.onPacket?.("__control__", {
          id: "" as never,
          type: "LEAVE",
          v: 1,
          ts: Date.now(),
          payload: { reason },
        });
      };

      const bindDataChannel = (channel: RTCDataChannel) => {
        dataChannel = channel;
        channel.onopen = () => {
          dcOpen = true;
          emitConnectionChange();
          if (iceDone) onReady();
        };
        channel.onmessage = async (event) => {
          await this.handleIncoming(sessionId, event.data);
        };
        channel.onclose = () => {
          emitLeave("datachannel_closed");
        };
        channel.onerror = () => {
          emitLeave("datachannel_error");
        };
      };

      const onReady = () => {
        const handle: TransportHandle = {
          pc,
          dataChannel,
          close: () => {
            try {
              signaling.send(JSON.stringify({ type: "leave", room: sessionId }));
            } catch {}
            try { dataChannel.close(); } catch {}
            try { pc.close(); } catch {}
            try { signaling.close(); } catch {}
            this.sessions.delete(sessionId);
          },
        };
        this.sessions.set(sessionId, {
          handle,
          signalingClient: {
            send: (msg) => {
              if (signaling.readyState === WebSocket.OPEN) {
                signaling.send(JSON.stringify(msg));
              }
            },
            close: () => signaling.close(),
          },
          seq: 0,
          crypto: null,
          replay: new ReplayWindow(),
        });
        emitConnectionChange();
        cleanup();
        resolve(handle);
      };

      if (isHost && dc) bindDataChannel(dc);
      if (!isHost) {
        pc.ondatachannel = (event) => bindDataChannel(event.channel);
      }

      pc.oniceconnectionstatechange = () => {
        emitConnectionChange();
        if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
          iceDone = true;
          if (dcOpen) onReady();
        }
        if (pc.iceConnectionState === "failed") {
          pc.restartIce();
        }
        if (pc.iceConnectionState === "disconnected") {
          emitLeave("ice_disconnected");
        }
      };

      pc.onconnectionstatechange = () => {
        emitConnectionChange();
        if (pc.connectionState === "failed") {
          emitLeave("connection_failed");
        }
        if (pc.connectionState === "disconnected") {
          emitLeave("connection_disconnected");
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && signaling.readyState === WebSocket.OPEN) {
          signaling.send(JSON.stringify({
            type: "ice-candidate",
            room: sessionId,
            payload: event.candidate.toJSON(),
          }));
        }
      };

      signaling.onopen = async () => {
        signaling.send(JSON.stringify({ type: "join", room: sessionId }));
        if (isHost && dc) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          signaling.send(JSON.stringify({
            type: "offer",
            room: sessionId,
            payload: pc.localDescription!.toJSON(),
          }));
        }
      };

      signaling.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data as string);

          if (msg.type === "joined") {
            peerId = msg.peerId;
            return;
          }

          if (msg.type === "offer" && !isHost && msg.from !== peerId) {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            signaling.send(JSON.stringify({
              type: "answer",
              room: sessionId,
              payload: pc.localDescription!.toJSON(),
            }));
            return;
          }

          if (msg.type === "answer" && isHost && msg.from !== peerId) {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
            return;
          }

          if (msg.type === "ice-candidate" && msg.from !== peerId) {
            await pc.addIceCandidate(new RTCIceCandidate(msg.payload));
          }
        } catch (err) {
          cleanup();
          reject(err);
        }
      };

      signaling.onerror = () => {
        if (signaling.readyState === WebSocket.CONNECTING) {
          cleanup();
          reject(new Error("Signaling connection failed"));
        }
      };

      signaling.onclose = () => {
        this.sessions.delete(sessionId);
      };
    });
  }

  private async handleIncoming(sessionId: string, data: string | ArrayBuffer | Blob) {
    const ts = this.sessions.get(sessionId);
    if (!ts || !this.onPacket) return;

    let raw: ArrayBuffer;
    if (data instanceof Blob) {
      raw = await data.arrayBuffer();
    } else if (typeof data === "string") {
      raw = new TextEncoder().encode(data).buffer as ArrayBuffer;
    } else {
      raw = data;
    }

    const text = new TextDecoder().decode(new Uint8Array(raw));
    let envelope: { seq?: number; type?: string };
    try {
      envelope = JSON.parse(text);
    } catch {
      return;
    }

    if (ts.crypto && envelope.seq !== undefined) {
      if (!ts.replay.check(envelope.seq)) return;
      const packet = await decodePacket(ts.crypto, raw);
      if (packet) {
        this.onPacket(sessionId, packet);
      }
      return;
    }

    try {
      const packet = JSON.parse(text) as PlainPacket;
      if (packet.type === "JOIN" || packet.type === "WELCOME") {
        this.onPacket(sessionId, packet);
      }
    } catch {
      // not a valid plaintext packet
    }
  }
}
