import type { SignalingMessage } from "@/types/transport";

export type SignalingEventCallback = (msg: SignalingMessage) => void;

export interface SignalingClient {
  send(msg: SignalingMessage): void;
  close(): void;
  isConnected(): boolean;
}

export function connectSignaling(
  url: string,
  roomId: string,
  onMessage: SignalingEventCallback
): Promise<SignalingClient> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    let connected = false;

    ws.onopen = () => {
      connected = true;
      ws.send(JSON.stringify({ type: "join", room: roomId }));
      resolve({
        send: (msg: SignalingMessage) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(msg));
          }
        },
        close: () => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "leave", room: roomId }));
            ws.close();
          }
        },
        isConnected: () => connected,
      });
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as SignalingMessage;
        onMessage(msg);
      } catch { /* ignore malformed */ }
    };

    ws.onerror = () => {
      if (!connected) reject(new Error("Signaling connection failed"));
    };

    ws.onclose = () => {
      connected = false;
    };
  });
}
