import { useStore } from "@/state/store";
import { GlassPanel } from "../common/GlassPanel";
import { Badge } from "../common/Badge";
import { MaterialIcon } from "../common/MaterialIcon";
import { Button } from "../common/Button";

export function SessionCard({ sessionId }: { sessionId: string }) {
  const session = useStore((s) => s.sessions[sessionId]);
  const setActive = useStore((s) => s.setActiveSession);

  if (!session) return null;

  const uptime = Math.floor((Date.now() - session.createdAt) / 1000);
  const hours = Math.floor(uptime / 3600);
  const mins = Math.floor((uptime % 3600) / 60);
  const secs = uptime % 60;
  const uptimeStr = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  return (
    <GlassPanel padded hover className="flex flex-col relative overflow-hidden group" onClick={() => setActive(session.id)}>
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-[40px] group-hover:bg-primary/30 transition-all" />
      <div className="flex justify-between items-start mb-md relative z-10">
        <div>
          <Badge variant="primary" label={session.role === "host" ? "End-to-End Encrypted" : "P2P Routing"} />
          <div className="text-mono-code text-on-surface mt-sm flex items-center gap-xs">
            <span className="text-on-surface-variant">ID:</span> {session.id.slice(0, 8)}...
          </div>
        </div>
        {session.state === "active" && (
          <div className="flex items-center gap-xs text-secondary">
            <MaterialIcon name="sensors" filled size={14} className="animate-pulse" />
            <span className="text-label-caps">LIVE</span>
          </div>
        )}
      </div>
      <div className="flex-1 mt-md mb-lg relative z-10 grid grid-cols-2 gap-sm">
        <div className="flex flex-col">
          <span className="text-body-sm text-on-surface-variant">Peers</span>
          <div className="flex items-center gap-xs text-on-surface text-title-md">
            <MaterialIcon name="group" className="text-on-surface-variant" size={18} />
            {session.peer ? 2 : 1}
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-body-sm text-on-surface-variant">Uptime</span>
          <div className="flex items-center gap-xs text-on-surface text-title-md">
            <MaterialIcon name="timer" className="text-on-surface-variant" size={18} />
            {uptimeStr}
          </div>
        </div>
      </div>
      <Button variant="ghost" onClick={() => setActive(session.id)} className="w-full">
        Switch to Room
      </Button>
    </GlassPanel>
  );
}
