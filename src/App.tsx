import { useView } from "@/hooks/useView";
import { AppShell } from "@/components/layout/AppShell";
import { JoinSessionView } from "@/components/sessions/JoinSessionView";
import { SessionGrid } from "@/components/sessions/SessionGrid";
import { ChatView } from "@/components/chat/ChatView";
import { PeerList } from "@/components/peers/PeerList";
import { AuditLog } from "@/components/logs/AuditLog";
import { SettingsView } from "@/components/settings/SettingsView";

export function App() {
  const view = useView();

  return (
    <AppShell>
      {view === "landing" && <JoinSessionView />}
      {view === "dashboard" && <SessionGrid />}
      {view === "chat" && <ChatView />}
      {view === "peers" && <PeerList />}
      {view === "logs" && <AuditLog />}
      {view === "settings" && <SettingsView />}
    </AppShell>
  );
}
