import { useStore } from "@/state/store";
import { ChatHeader } from "./ChatHeader";
import { MessageTimeline } from "./MessageTimeline";
import { MessageComposer } from "./MessageComposer";

export function ChatView() {
  const activeId = useStore((s) => s.activeSessionId);

  if (!activeId) {
    return (
      <div className="flex-1 flex items-center justify-center p-lg text-center">
        <div className="glass-level-1 rounded-xl p-xl max-w-[28rem]">

          <p className="text-title-md text-on-surface">No active chat selected</p>
          <p className="text-body-sm text-on-surface-variant mt-xs">Create, join, or select a session to open the encrypted chat room.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden">
      <ChatHeader />
      <MessageTimeline sessionId={activeId} />
      <MessageComposer sessionId={activeId} />
    </div>
  );
}
