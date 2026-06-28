import type { ChatMessage } from "@/types/session";

interface Props {
  message: ChatMessage;
}

export function MessageBubble({ message }: Props) {
  if (message.type === "sent") {
    return (
      <div className="flex flex-col gap-xs max-w-[85%] md:max-w-[70%] self-end">
        <div className="flex items-end gap-sm flex-row-reverse">
          <div className="flex flex-col gap-xs items-end w-full">
            <div className="flex items-baseline gap-sm mr-1 flex-row-reverse">
              <span className="text-label-caps text-primary">You</span>
              <span className="text-mono-code text-[10px] text-on-surface-variant/50">
                {new Date(message.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })} UTC
              </span>
            </div>
            <div className="msg-sent rounded-2xl rounded-br-sm p-md text-white text-body-sm shadow-md">
              {message.body}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-xs max-w-[85%] md:max-w-[70%]">
      <div className="flex items-end gap-sm">
        <div className="w-8 h-8 rounded-full bg-surface-variant shrink-0 border border-white/10 mb-6" />
        <div className="flex flex-col gap-xs w-full">
          <div className="flex items-baseline gap-sm ml-1">
            <span className="text-label-caps text-on-surface-variant">{message.peerAlias ?? "Peer"}</span>
            <span className="text-mono-code text-[10px] text-on-surface-variant/50">
              {new Date(message.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })} UTC
            </span>
          </div>
          <div className="msg-received rounded-2xl rounded-bl-sm p-md text-on-surface text-body-sm shadow-sm">
            {message.body}
          </div>
        </div>
      </div>
    </div>
  );
}
