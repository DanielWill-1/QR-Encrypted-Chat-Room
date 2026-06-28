import { GlassPanel } from "../common/GlassPanel";
import { Avatar } from "../common/Avatar";
import { MaterialIcon } from "../common/MaterialIcon";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";

const SAMPLE_PEERS = [
  { id: "1", alias: "Node Alpha-9", fingerprint: "8F2a...9b4C", latency: "12ms", bandwidth: "1.2 Gbps", quality: 95, status: "connected" },
  { id: "2", alias: "Proxy Nexus", fingerprint: "3E1b...7a2F", latency: "145ms", bandwidth: "54 Mbps", quality: 40, status: "connected" },
  { id: "3", alias: "Unknown Node", fingerprint: "pending", latency: "--", bandwidth: "--", quality: 0, status: "pending" },
];

export function PeerList() {
  return (
    <div className="flex-1 p-md md:p-lg pb-20 md:pb-0 antialiased">
      <div className="max-w-container-max mx-auto pt-24 md:pt-0">
        {/* Mobile ghost header */}
        <div className="md:hidden mb-md">
          <h1 className="text-headline-lg-mobile text-primary tracking-tighter">GhostLink</h1>
        </div>
        <div className="mb-lg hidden md:block">
          <h2 className="text-title-md text-on-surface">Network Map</h2>
        </div>
        <div className="mb-lg flex justify-between items-end">
          <div>
            <h2 className="text-display text-on-surface mb-xs">Connected Peers</h2>
            <p className="text-body-sm text-on-surface-variant">Active P2P nodes in current secure enclave.</p>
          </div>
          <div className="hidden md:flex gap-sm">
            <Badge variant="primary" label="E2E Encrypted" pulse />
            <Badge variant="tertiary" label="Local Routing" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {SAMPLE_PEERS.map((peer) => (
            <GlassPanel key={peer.id} padded hover className="flex flex-col gap-md">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-sm">
                  <Avatar seed={peer.fingerprint} size={48} rounded="lg" />
                  <div>
                    <h3 className="text-title-md text-on-surface">{peer.alias}</h3>
                    <p className="text-mono-code text-on-surface-variant">ID: {peer.fingerprint}</p>
                  </div>
                </div>
                {peer.status === "connected" ? (
                  peer.quality > 70 ? (
                    <MaterialIcon name="wifi" filled size={20} className="text-primary" />
                  ) : (
                    <MaterialIcon name="wifi_1_bar" filled size={20} className="text-secondary" />
                  )
                ) : (
                  <MaterialIcon name="sync" size={20} className="text-outline animate-spin" />
                )}
              </div>
              {peer.status === "connected" ? (
                <>
                  <div className="grid grid-cols-2 gap-sm">
                    <div className="bg-white/5 rounded-lg p-sm border border-white/5">
                      <p className="text-label-caps text-on-surface-variant mb-xs">Latency</p>
                      <p className="text-body-rt text-on-surface">{peer.latency}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-sm border border-white/5">
                      <p className="text-label-caps text-on-surface-variant mb-xs">Bandwidth</p>
                      <p className="text-body-rt text-on-surface">{peer.bandwidth}</p>
                    </div>
                  </div>
                  <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-sm">
                    <div
                      className={`h-full rounded-full ${peer.quality > 70 ? "bg-primary" : "bg-secondary"}`}
                      style={{ width: `${peer.quality}%` }}
                    />
                  </div>
                  <div className="flex gap-sm mt-auto pt-sm border-t border-white/10">
                    <Button variant="ghost" size="sm" icon={<MaterialIcon name="verified" size={16} />} className="flex-1">
                      Verify
                    </Button>
                    <Button variant="danger" size="sm" icon={<MaterialIcon name="link_off" size={16} />} className="flex-1">
                      Disconnect
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-sm">
                    <div className="bg-white/5 rounded-lg p-sm border border-white/5 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-outline border-t-transparent rounded-full animate-spin" />
                    </div>
                    <div className="bg-white/5 rounded-lg p-sm border border-white/5 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-outline border-t-transparent rounded-full animate-spin" />
                    </div>
                  </div>
                  <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-sm relative">
                    <div className="absolute inset-0 bg-outline/30 animate-pulse" />
                  </div>
                  <Button variant="ghost" size="sm" disabled className="flex-1 opacity-50 cursor-not-allowed">
                    <MaterialIcon name="hourglass_empty" size={16} /> Pending
                  </Button>
                </>
              )}
            </GlassPanel>
          ))}
        </div>
      </div>
    </div>
  );
}
