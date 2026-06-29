import { useStore } from "@/state/store";
import { sendMessage } from "@/state/actions";
import { useCallback } from "react";
import type { SessionId } from "@/types/session";
import type { ChatMessage } from "@/types/session";
import { TransportManager } from "@/lib/transport/TransportManager";

const transport = TransportManager.getInstance();

const EMPTY_ARR: never[] = [];

export function useChat(sessionId: SessionId) {
  const messages = useStore((s) => s.sessions[sessionId]?.messages ?? EMPTY_ARR);
  const typingPeers = useStore((s) => s.sessions[sessionId]?.typingPeers ?? EMPTY_ARR);

  const send = useCallback(
    (body: string): ChatMessage => {
      return sendMessage(sessionId, body);
    },
    [sessionId]
  );

  const sendTyping = useCallback(
    (active: boolean) => {
      transport.setIsTyping(sessionId, active);
    },
    [sessionId]
  );

  return { messages, typingPeers, sendText: send, sendTyping };
}
