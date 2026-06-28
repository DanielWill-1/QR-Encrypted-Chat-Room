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
  { id: null, icon: "encrypted", label: "Vault" },
];

export function Sidebar() {
  const view = useView();
  const setNavView = useStore((s) => s.setNavView);
  const setActiveSession = useStore((s) => s.setActiveSession);

  return (
    <nav className="hidden md:flex bg-surface-container/40 backdrop-blur-2xl h-screen w-64 fixed left-0 top-0 border-r border-white/10 flex-col p-md z-40">
      {/* Brand */}
      <div className="mb-xl flex items-center gap-sm px-sm">
        <div className="w-10 h-10 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
          <MaterialIcon name="smart_toy" filled size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-headline-lg text-primary tracking-tight leading-none truncate">GhostLink</h2>
          <p className="text-body-sm text-on-surface-variant truncate">P2P Protocol v2.1</p>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 flex flex-col gap-xs">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            onClick={() => {
              if (item.id) {
                setActiveSession(null);
                setNavView(item.id);
              }
            }}
            className={`flex items-center gap-md px-md py-sm rounded-lg transition-colors active:translate-x-1 ${
              view === item.id
                ? "bg-primary/20 text-primary border-r-2 border-primary"
                : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
            }`}
          >
            <MaterialIcon name={item.icon} size={20} filled={view === item.id} />
            <span className="text-title-md">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto flex flex-col gap-sm">
        <Button variant="primary" icon={<MaterialIcon name="add" size={16} />} className="w-full">
          New Session
        </Button>
        <button
          onClick={() => {
            setActiveSession(null);
            setNavView("logs");
          }}
          className={`flex items-center gap-md px-md py-sm rounded-lg transition-colors ${
            view === "logs"
              ? "bg-primary/20 text-primary"
              : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
          }`}
        >
          <MaterialIcon name="policy" size={20} />
          <span className="text-body-sm">Security Log</span>
        </button>
      </div>
    </nav>
  );
}
