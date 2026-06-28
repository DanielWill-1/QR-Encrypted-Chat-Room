import { useStore } from "@/state/store";
import { useView } from "@/hooks/useView";
import type { AppView } from "@/types/app";
import { MaterialIcon } from "../common/MaterialIcon";
import { Button } from "../common/Button";

interface NavItem {
  id: AppView | null;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", icon: "chat_bubble", label: "Active Sessions" },
  { id: "peers", icon: "group", label: "Connected Peers" },
  { id: "settings", icon: "settings", label: "Settings" },
  { id: "vault", icon: "encrypted", label: "Vault" },
];

export function Sidebar() {
  const view = useView();
  const setNavView = useStore((s) => s.setNavView);
  const setActiveSession = useStore((s) => s.setActiveSession);

  return (
    <nav className="hidden md:flex bg-surface-container/70 backdrop-blur-2xl h-dvh w-full min-w-0 border-r border-white/10 flex-col p-lg z-40 overflow-y-auto overflow-x-hidden">
      {/* Brand */}
      <div className="mb-xl flex items-center gap-sm px-sm min-w-0">
        <div className="w-12 h-12 rounded-2xl bg-surface-container-high border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-glow">
          <MaterialIcon name="smart_toy" filled size={20} className="text-primary" />
        </div>
        <div className="min-w-0">
          <h2 className="text-headline-lg-mobile text-primary tracking-tight leading-none truncate">GhostLink</h2>
          <p className="text-body-sm text-on-surface-variant truncate">P2P Protocol v2.1</p>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 flex flex-col gap-xs">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              setActiveSession(null);
              setNavView(item.id);
            }}
            className={`flex w-full items-center gap-md px-md py-sm rounded-xl transition-all active:translate-x-1 ${
              view === item.id
                ? "bg-primary/20 text-primary shadow-glow"
                : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
            }`}
          >
            <MaterialIcon name={item.icon} size={22} filled={view === item.id} className="shrink-0" />
            <span className="text-title-md truncate">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto flex flex-col gap-sm">
        <Button variant="primary" icon={<MaterialIcon name="add" size={18} />} className="w-full" onClick={() => { setActiveSession(null); setNavView("landing"); }}>
          New Session
        </Button>
        <button
          type="button"
          onClick={() => {
            setActiveSession(null);
            setNavView("logs");
          }}
          className={`flex w-full items-center gap-md px-md py-sm rounded-xl transition-colors ${
            view === "logs"
              ? "bg-primary/20 text-primary"
              : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
          }`}
        >
          <MaterialIcon name="policy" size={22} className="shrink-0" />
          <span className="text-body-sm truncate">Security Log</span>
        </button>
      </div>
    </nav>
  );
}
