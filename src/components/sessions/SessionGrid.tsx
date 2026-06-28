import { useStore } from "@/state/store";
import type { SessionId } from "@/types/session";
import { SessionCard } from "./SessionCard";
import { Button } from "../common/Button";
import { MaterialIcon } from "../common/MaterialIcon";

export function SessionGrid() {
  const sessionOrder = useStore((s) => s.sessionOrder);
  const destroySession = useStore((s) => s.destroySession);

  return (
    <div className="flex-1 p-md md:p-lg pb-20 md:pb-0 antialiased">
      <div className="max-w-container-max mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-md mb-lg pt-24 md:pt-0">
          <div>
            <h2 className="text-headline-lg text-on-surface mb-xs">Active Sessions</h2>
            <p className="text-body-sm text-on-surface-variant">Manage and monitor current ephemeral connections.</p>
          </div>
          <Button
            variant="danger"
            icon={<MaterialIcon name="warning" size={16} />}
            className="w-full sm:w-auto"
            onClick={() => sessionOrder.forEach((id) => destroySession(id as SessionId))}
          >
            Terminate All
          </Button>
        </div>

        {sessionOrder.length === 0 ? (
          <div className="text-center py-16">
            <MaterialIcon name="chat_bubble" size={48} className="text-on-surface-variant/30 mb-sm" />
            <p className="text-title-md text-on-surface-variant">No active sessions</p>
            <p className="text-body-sm text-on-surface-variant/50">Create or join a session to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {sessionOrder.map((id) => (
              <SessionCard key={id} sessionId={id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
