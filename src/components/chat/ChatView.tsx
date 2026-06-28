import { useStore } from "@/state/store";
import { ChatHeader } from "./ChatHeader";
import { MessageTimeline } from "./MessageTimeline";
import { MessageComposer } from "./MessageComposer";

export function ChatView() {
  const activeId = useStore((s) => s.activeSessionId);

  if (!activeId) return null;

  return (
    <>
      <ChatHeader />
      <MessageTimeline sessionId={activeId} />
      <MessageComposer sessionId={activeId} />
    </>
  );
}
