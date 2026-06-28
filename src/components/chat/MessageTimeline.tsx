import { useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import type { SessionId } from "@/types/session";

interface Props {
  sessionId: SessionId;
  showTyping?: boolean;
}

export function MessageTimeline({ sessionId }: Props) {
  const { messages, typingPeers } = useChat(sessionId);
  const bottomRef = useRef<HTMLDivElement>(null);
  const showTyping = typingPeers && typingPeers.length > 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showTyping]);

  return (
    <div className="flex-1 overflow-y-auto px-md md:px-lg pt-24 pb-24 no-scrollbar flex flex-col gap-lg">
      {messages.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-sm opacity-60">
            <p className="text-title-md text-on-surface-variant">Session Active</p>
            <p className="text-body-sm text-on-surface-variant/50">Messages will appear here. E2E encrypted.</p>
          </div>
        </div>
      )}
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
      {showTyping && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
