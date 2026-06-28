import { useState, useEffect } from "react";
import { TransportManager } from "@/lib/transport/TransportManager";

const transport = TransportManager.getInstance();

export function useConnectionStatus(sessionId?: string) {
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>("new");
  const [iceConnectionState, setIceConnectionState] = useState<RTCIceConnectionState>("new");
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setConnectionState("new");
      setIceConnectionState("new");
      setLatency(null);
      return;
    }

    const tick = () => {
      const state = transport.getConnectionState(sessionId);
      setConnectionState(state.connectionState);
      setIceConnectionState(state.iceConnectionState);
    };

    tick();
    const interval = setInterval(tick, 2000);

    transport.registerConnectionHandler((sid, connState, iceState) => {
      if (sid === sessionId) {
        setConnectionState(connState);
        setIceConnectionState(iceState);
      }
    });

    return () => clearInterval(interval);
  }, [sessionId]);

  return { connectionState, iceConnectionState, latency };
}
