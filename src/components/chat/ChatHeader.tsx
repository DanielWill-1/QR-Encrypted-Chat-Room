import { useStore } from "@/state/store";
import { MaterialIcon } from "../common/MaterialIcon";

export function ChatHeader() {
  const activeId = useStore((s) => s.activeSessionId);
  const session = useStore((s) => (activeId ? s.sessions[activeId] : null));
  const destroySession = useStore((s) => s.destroySession);

  if (!session) return null;

  const displayId = session.id.slice(0, 6).toUpperCase();

  return (
    <header className="bg-surface/40 backdrop-blur-xl fixed top-0 w-full md:w-[calc(100%-256px)] z-50 flex justify-between items-center px-lg py-sm border-b border-white/10">
      <div className="flex items-center gap-md">
        <button className="md:hidden text-on-surface-variant hover:text-primary transition-colors">
          <MaterialIcon name="menu" />
        </button>
        <div>
          <h2 className="text-title-md text-on-surface flex items-center gap-sm">
            Session GX-{displayId}
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-tertiary/30 text-tertiary bg-tertiary/10 flex items-center gap-1 font-[Geist]">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
              End-to-End Encrypted
            </span>
          </h2>
        </div>
      </div>
      <div className="flex items-center gap-sm md:gap-md">
        <div className="hidden md:flex items-center gap-sm text-on-surface-variant border-r border-white/10 pr-md mr-xs">
          <button className="hover:text-primary transition-all">
            <MaterialIcon name="qr_code_scanner" size={20} />
          </button>
          <button className="hover:text-primary transition-all">
            <MaterialIcon name="security" filled size={20} />
          </button>
          <button className="hover:text-primary transition-all">
            <MaterialIcon name="signal_cellular_alt" size={20} />
          </button>
        </div>
        <button
          onClick={() => session && destroySession(session.id)}
          className="bg-error/10 hover:bg-error/20 border border-error/20 text-error px-md py-xs rounded font-[Geist] text-[12px] font-semibold transition-colors active:scale-95 flex items-center gap-xs"
        >
          <MaterialIcon name="lock_open" size={16} />
          <span className="hidden sm:inline">Destroy Session</span>
        </button>
      </div>
    </header>
  );
}
