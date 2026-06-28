import { useEffect } from "react";
import { useView } from "@/hooks/useView";
import { AppShell } from "@/components/layout/AppShell";
import { JoinSessionView } from "@/components/sessions/JoinSessionView";
import { SessionGrid } from "@/components/sessions/SessionGrid";
import { ChatView } from "@/components/chat/ChatView";
import { PeerList } from "@/components/peers/PeerList";
import { AuditLog } from "@/components/logs/AuditLog";
import { SettingsView } from "@/components/settings/SettingsView";
import { pathToNavView, useStore } from "@/state/store";
import { MaterialIcon } from "@/components/common/MaterialIcon";

export function App() {
  const view = useView();
  const setActiveSession = useStore((s) => s.setActiveSession);
  const setNavView = useStore((s) => s.setNavView);

  useEffect(() => {
    const syncFromLocation = () => {
      const nextView = pathToNavView(window.location.pathname);
      if (nextView !== "chat") setActiveSession(null);
      setNavView(nextView, { syncUrl: false });
    };

    syncFromLocation();
    window.addEventListener("popstate", syncFromLocation);
    return () => window.removeEventListener("popstate", syncFromLocation);
  }, [setActiveSession, setNavView]);

  return (
    <AppShell>
      {view === "landing" && <JoinSessionView />}
      {view === "dashboard" && <SessionGrid />}
      {view === "chat" && <ChatView />}
      {view === "peers" && <PeerList />}
      {view === "vault" && <PlaceholderPage icon="encrypted" title="Vault" description="Local encrypted vault storage is ready for secure artifacts and session exports." />}
      {view === "qrPairing" && <PlaceholderPage icon="qr_code_scanner" title="QR Pairing" description="Pairing scanner view is available. Paste an invite on the home screen to join a room from this desktop build." />}
      {view === "pairingCode" && <PlaceholderPage icon="pin" title="Pairing Code" description="Short pairing codes can be added here without breaking navigation or route refreshes." />}
      {view === "logs" && <AuditLog />}
      {view === "settings" && <SettingsView />}
    </AppShell>
  );
}

function PlaceholderPage({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex-1 p-md md:p-xl pb-24 md:pb-xl">
      <div className="mx-auto flex min-h-full max-w-[1200px] items-center justify-center">
        <section className="glass-level-1 rounded-xl border border-white/10 p-xl text-center max-w-[32rem] animate-fade-in">

          <MaterialIcon name={icon} size={44} className="mx-auto mb-md text-primary" />
          <h1 className="text-headline-lg text-on-surface">{title}</h1>
          <p className="mt-sm text-body-rt text-on-surface-variant">{description}</p>
        </section>
      </div>
    </div>
  );
}
