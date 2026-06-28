import { useStore } from "@/state/store";
import { useView } from "@/hooks/useView";
import type { AppView } from "@/types/app";
import { MaterialIcon } from "../common/MaterialIcon";

const TABS: { id: AppView | null; icon: string; label: string }[] = [
  { id: "dashboard", icon: "chat_bubble", label: "Sessions" },
  { id: "peers", icon: "group", label: "Peers" },
  { id: "settings", icon: "settings", label: "Settings" },
  { id: null, icon: "encrypted", label: "Vault" },
];

export function MobileNav() {
  const view = useView();
  const setNavView = useStore((s) => s.setNavView);
  const setActiveSession = useStore((s) => s.setActiveSession);

  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 glass-level-2 border-t border-white/10 flex justify-around items-center px-sm h-16" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      {TABS.map((tab) => {
        const active = view === tab.id;
        return (
          <button
            key={tab.label}
            onClick={() => {
              setActiveSession(null);
              if (tab.id) setNavView(tab.id);
            }}
            className={`flex flex-col items-center gap-1 p-sm transition-colors ${
              active ? "text-primary" : "text-on-surface-variant hover:text-primary"
            }`}
          >
            <MaterialIcon name={tab.icon} filled={active} size={20} />
            <span className="text-[10px] font-semibold tracking-wider font-[Geist]">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
