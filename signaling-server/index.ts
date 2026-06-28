import { WebSocketServer, type WebSocket } from "ws";

const PORT = 3001;
const ROOM_EXPIRY_MS = 10 * 60 * 1000;

interface Room {
  id: string;
  peers: Map<string, WebSocket>;
  createdAt: number;
}

const rooms = new Map<string, Room>();

const EXPIRY_INTERVAL = setInterval(() => {
  const now = Date.now();
  for (const [id, room] of rooms) {
    if (now - room.createdAt > ROOM_EXPIRY_MS && room.peers.size === 0) {
      rooms.delete(id);
      console.log(`[signaling] Expired room: ${id}`);
    }
  }
}, 60_000);

const wss = new WebSocketServer({ port: PORT });

wss.on("listening", () => {
  console.log(`[signaling] Server listening on ws://localhost:${PORT}`);
});

wss.on("connection", (ws: WebSocket) => {
  let peerRoom: string | null = null;
  let peerId: string | null = null;

  ws.on("message", (raw: Buffer) => {
    let msg: { type: string; room?: string; from?: string; [key: string]: unknown };
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    switch (msg.type) {
      case "join": {
        const roomId = msg.room as string;
        if (!roomId) return;
        if (!rooms.has(roomId)) {
          rooms.set(roomId, { id: roomId, peers: new Map(), createdAt: Date.now() });
        }
        const room = rooms.get(roomId)!;
        peerId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        peerRoom = roomId;
        room.peers.set(peerId, ws);
        console.log(`[signaling] ${peerId} joined room ${roomId} (${room.peers.size} peers)`);

        ws.send(JSON.stringify({ type: "joined", room: roomId, peerId, peers: room.peers.size }));
        break;
      }

      case "offer":
      case "answer":
      case "ice-candidate": {
        if (!peerRoom) return;
        const room = rooms.get(peerRoom);
        if (!room) return;
        const payload = msg;
        for (const [id, peerWs] of room.peers) {
          if (peerWs !== ws) {
            peerWs.send(JSON.stringify({ ...payload, from: peerId }));
          }
        }
        break;
      }

      case "leave": {
        if (!peerRoom) return;
        cleanupPeer();
        break;
      }
    }
  });

  ws.on("close", () => {
    cleanupPeer();
  });

  function cleanupPeer() {
    if (!peerRoom || !peerId) return;
    const room = rooms.get(peerRoom);
    if (!room) return;
    room.peers.delete(peerId);
    console.log(`[signaling] ${peerId} left room ${peerRoom} (${room.peers.size} peers)`);
    if (room.peers.size === 0) {
      setTimeout(() => {
        if (room.peers.size === 0) rooms.delete(peerRoom!);
      }, 5000);
    }
  }
});

process.on("SIGINT", () => {
  clearInterval(EXPIRY_INTERVAL);
  wss.close();
  process.exit(0);
});
