import { GlassPanel } from "../common/GlassPanel";
import { MaterialIcon } from "../common/MaterialIcon";
import { Badge } from "../common/Badge";

const SAMPLE_LOGS = [
  { icon: "sync_alt", iconColor: "text-primary", title: "Connection Handshake", time: "14:02:45.012Z", detail: "INIT SYN > ACK [PEER_ID: 0x7F9A...B32C] VIA RELAY_NODE_4", level: "info" },
  { icon: "check_circle", iconColor: "text-tertiary", title: "Key Exchange Completed", time: "14:02:45.340Z", detail: "DIFFIE_HELLMAN_X25519 VERIFIED.\nFINGERPRINT: A9 4B 8F 22 C1 7D 55 E0", level: "info" },
  { icon: "info", iconColor: "text-secondary", title: "Peer Joined", time: "14:02:46.105Z", detail: 'ALIAS: "GHOST_OPERATIVE_99" ENTERED SECURE CHANNEL.', level: "info" },
  { icon: "warning", iconColor: "text-error", title: "Sub-Routine Blocked", time: "14:03:12.881Z", detail: "UNAUTHORIZED METADATA REQUEST INTERCEPTED AND DROPPED. SOURCE IP OBFUSCATED.", level: "error" },
  { icon: "lock", iconColor: "text-primary", title: "Data Transfer Encrypted", time: "14:04:00.002Z", detail: "STREAM_CIPHER: CHACHA20-POLY1305 | BYTES_TX: 4096 | BYTES_RX: 0\nSTATE: SYMMETRIC_TUNNEL_ACTIVE", level: "info" },
];

export function AuditLog() {
  return (
    <div className="flex-1 p-md md:p-lg pb-20 md:pb-0 antialiased">
      <div className="max-w-container-max mx-auto pt-24 md:pt-0">
        {/* Mobile ghost header */}
        <div className="md:hidden mb-md">
          <h1 className="text-headline-lg-mobile text-primary tracking-tighter">GhostLink</h1>
        </div>
        <div className="mb-lg flex justify-between items-end">
          <div>
            <h1 className="text-headline-lg text-on-surface mb-xs">Session Audit Trail</h1>
            <p className="text-body-sm text-on-surface-variant">Real-time cryptographic event logging. Ephemeral storage active.</p>
          </div>
          <Badge variant="tertiary" label="Live Monitoring" pulse />
        </div>

        <GlassPanel padded className="flex flex-col gap-sm">
          {SAMPLE_LOGS.map((log, i) => (
            <GlassPanel
              key={i}
              padded
              hover
              className={`flex items-start gap-md transition-all ${log.level === "error" ? "border-error/20 bg-error/5" : ""}`}
            >
              <div className={`mt-xs ${log.iconColor}`}>
                <MaterialIcon name={log.icon} size={20} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-xs">
                  <span className={`text-title-md ${log.level === "error" ? "text-error" : "text-on-surface"}`}>
                    {log.title}
                  </span>
                  <span className={`text-mono-code ${log.level === "error" ? "text-error opacity-70" : "text-on-surface-variant"}`}>
                    {log.time}
                  </span>
                </div>
                <div className={`text-mono-code text-xs whitespace-pre-wrap bg-black/20 p-sm rounded mt-xs border border-white/5 ${log.level === "error" ? "text-error opacity-70" : "text-on-surface-variant opacity-70"}`}>
                  {log.detail}
                </div>
              </div>
            </GlassPanel>
          ))}
        </GlassPanel>

        <div className="mt-md text-center">
          <span className="text-mono-code text-on-surface-variant/50 text-xs">END OF LOG - LOGS ARE PURGED ON SESSION TERMINATION</span>
        </div>
      </div>
    </div>
  );
}
