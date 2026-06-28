import { useState, useCallback } from "react";
import { sendMessage } from "@/state/actions";
import { MaterialIcon } from "../common/MaterialIcon";
import { TransportManager } from "@/lib/transport/TransportManager";
import type { SessionId } from "@/types/session";

const transport = TransportManager.getInstance();

interface Props {
  sessionId: SessionId;
}

export function MessageComposer({ sessionId }: Props) {
  const [body, setBody] = useState("");
  const handleSend = useCallback(() => {
    const trimmed = body.trim();
    if (!trimmed) return;
    sendMessage(sessionId, trimmed);
    setBody("");
  }, [body, sessionId]);

  const handleTyping = useCallback(() => {
    transport.setIsTyping(sessionId, true);
  }, [sessionId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="absolute bottom-0 w-full px-md md:px-lg pb-md pt-lg bg-gradient-to-t from-background via-background/90 to-transparent z-20">
      <div className="chat-input-glass rounded-full flex items-center p-2 gap-2 max-w-4xl mx-auto shadow-lg">
        <button className="p-2 text-on-surface-variant hover:text-primary transition-colors shrink-0 rounded-full hover:bg-white/5">
          <MaterialIcon name="add_circle" size={20} />
        </button>
        <input
          className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface text-body-sm placeholder-on-surface-variant/50 px-2 h-10"
          placeholder="Transmit message..."
          type="text"
          value={body}
          onChange={(e) => { setBody(e.target.value); handleTyping(); }}
          onKeyDown={handleKeyDown}
        />
        <button className="p-2 text-on-surface-variant hover:text-primary transition-colors shrink-0 rounded-full hover:bg-white/5">
          <MaterialIcon name="sentiment_satisfied" size={20} />
        </button>
        <button
          onClick={handleSend}
          className="w-10 h-10 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-full flex items-center justify-center transition-all active:scale-95 shrink-0 group"
        >
          <MaterialIcon name="send" filled size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>
      <div className="text-center mt-2 text-mono-code text-[10px] text-on-surface-variant/40">
        Messages are permanently destroyed upon session termination.
      </div>
    </div>
  );
}
