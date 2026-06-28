import { useState } from "react";
import { useStore } from "@/state/store";
import { GlassPanel } from "../common/GlassPanel";
import { MaterialIcon } from "../common/MaterialIcon";
import { Button } from "../common/Button";

export function SettingsView() {
  const config = useStore((s) => s.config);
  const updateConfig = useStore((s) => s.updateConfig);
  const [name, setName] = useState(config.displayName);
  const [opacity, setOpacity] = useState(config.glassOpacity);
  const [port, setPort] = useState(config.listenPort);

  return (
    <div className="flex-1 overflow-y-auto p-md md:p-xl pb-32 md:pb-0 antialiased">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 glass-level-2 border-b border-white/10 px-md py-sm flex justify-between items-center -mx-md mb-md">
        <h1 className="text-headline-lg-mobile text-primary tracking-tighter">Settings</h1>
        <button className="w-10 h-10 rounded-full glass-level-1 flex items-center justify-center text-on-surface">
          <MaterialIcon name="menu" />
        </button>
      </header>

      <div className="max-w-container-max mx-auto space-y-xl pt-24 md:pt-0">
        <div className="mb-lg hidden md:block">
          <h2 className="text-display text-on-surface tracking-tight">Settings</h2>
          <p className="text-body-rt text-on-surface-variant mt-xs">Manage your ephemeral identity and protocol preferences.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
          {/* Profile */}
          <section className="lg:col-span-8 glass-level-1 rounded-xl p-lg flex flex-col gap-md relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="flex items-center gap-sm border-b border-white/5 pb-sm">
              <MaterialIcon name="person" size={20} className="text-primary" />
              <h3 className="text-title-md text-primary">Profile</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-lg items-start sm:items-center">
              <div className="relative w-24 h-24 rounded-full glass-level-2 flex items-center justify-center border-2 border-dashed border-white/20 hover:border-primary/50 transition-colors cursor-pointer group/avatar shrink-0">
                <MaterialIcon name="upload" size={28} className="text-on-surface-variant group-hover/avatar:text-primary transition-colors" />
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                  <span className="text-label-caps text-white">CHANGE</span>
                </div>
              </div>
              <div className="flex-1 w-full space-y-sm">
                <label className="text-label-caps text-on-surface-variant">GHOST NAME (VISIBLE TO PEERS)</label>
                <div className="relative">
                  <input
                    className="w-full bg-surface-container-high/60 border border-white/10 rounded-lg py-sm px-md text-on-surface text-mono-code focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <MaterialIcon name="edit" size={18} className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant" />
                </div>
                <p className="text-body-sm text-on-surface-variant/70 text-xs">This identifier is used in public discovery. Changes take effect on next session restart.</p>
              </div>
            </div>
          </section>

          {/* Security */}
          <section className="lg:col-span-4 glass-level-1 rounded-xl p-lg flex flex-col gap-md relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-bl from-error/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="flex items-center gap-sm border-b border-white/5 pb-sm">
              <MaterialIcon name="security" size={20} className="text-error" />
              <h3 className="text-title-md text-error">Security</h3>
            </div>
            <div className="space-y-lg flex-1">
              <div className="space-y-sm">
                <label className="text-label-caps text-on-surface-variant flex justify-between">
                  PROTOCOL
                  <span className="text-tertiary">E2EE ACTIVE</span>
                </label>
                <select className="w-full bg-surface-container-high/60 border border-white/10 rounded-lg py-sm px-md text-on-surface text-title-md appearance-none focus:outline-none focus:border-primary transition-all">
                  <option>X25519 (Default)</option>
                  <option>Kyber-512 (Post-Quantum)</option>
                  <option>NTRU-HRSS</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-sm rounded-lg glass-level-2 border-white/5">
                <div>
                  <div className="text-title-md text-on-surface">Auto-Destroy</div>
                  <div className="text-body-sm text-on-surface-variant text-xs">Wipe keys on disconnect</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.autoDestroy}
                    onChange={(e) => updateConfig({ autoDestroy: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner" />
                </label>
              </div>
            </div>
          </section>

          {/* Appearance */}
          <section className="lg:col-span-6 glass-level-1 rounded-xl p-lg flex flex-col gap-md">
            <div className="flex items-center gap-sm border-b border-white/5 pb-sm">
              <MaterialIcon name="palette" size={20} className="text-tertiary" />
              <h3 className="text-title-md text-tertiary">Appearance</h3>
            </div>
            <div className="space-y-lg">
              <div className="space-y-sm">
                <div className="flex justify-between items-center">
                  <label className="text-label-caps text-on-surface-variant">GLASS OPACITY</label>
                  <span className="text-mono-code text-primary">{opacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={opacity}
                  onChange={(e) => setOpacity(parseInt(e.target.value))}
                  className="w-full h-1 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-on-surface-variant/50">
                  <span>Solid</span>
                  <span>Ghost</span>
                </div>
              </div>
              <div className="space-y-sm pt-sm">
                <label className="text-label-caps text-on-surface-variant">ACCENT HUE</label>
                <div className="flex gap-md">
                  {["#d0bcff", "#4cd7f6", "#ffb4ab", "#0566d9"].map((color, i) => {
                    const currentIndex = ["primary", "tertiary", "error", "secondary"].indexOf(config.accentColor);
                    const isSelected = currentIndex === -1 ? i === 0 : i === currentIndex;
                    return (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full transition-all ${isSelected ? "ring-2 ring-white/50 ring-offset-2 ring-offset-background" : "hover:ring-2 hover:ring-white/30 hover:ring-offset-2 hover:ring-offset-background"}`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateConfig({ accentColor: ["primary", "tertiary", "error", "secondary"][i] })}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Network */}
          <section className="lg:col-span-6 glass-level-1 rounded-xl p-lg flex flex-col gap-md">
            <div className="flex items-center gap-sm border-b border-white/5 pb-sm">
              <MaterialIcon name="router" size={20} className="text-secondary-fixed" />
              <h3 className="text-title-md text-secondary-fixed">Network (Advanced)</h3>
            </div>
            <div className="space-y-md">
              <div className="space-y-xs">
                <label className="text-label-caps text-on-surface-variant">P2P LISTEN PORT</label>
                <div className="flex gap-sm">
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(parseInt(e.target.value))}
                    className="w-32 bg-surface-container-high/60 border border-white/10 rounded-lg py-xs px-sm text-on-surface text-mono-code focus:outline-none focus:border-primary transition-all"
                  />
                  <button className="px-sm py-xs rounded-lg glass-level-2 text-on-surface-variant hover:text-primary transition-colors text-label-caps">
                    RANDOMIZE
                  </button>
                </div>
              </div>
              <div className="space-y-xs pt-sm">
                <label className="text-label-caps text-on-surface-variant">STUN/TURN RELAYS</label>
                <div className="bg-surface-container-highest/50 border border-white/5 rounded-lg p-sm space-y-sm">
                  <div className="flex justify-between items-center text-mono-code text-sm">
                    <span className="text-on-surface">stun.l.google.com:19302</span>
                    <span className="text-tertiary text-xs">Active</span>
                  </div>
                  <div className="flex justify-between items-center text-mono-code text-sm">
                    <span className="text-on-surface-variant">turn:relay.ghostlink.net:443</span>
                    <span className="text-on-surface-variant/50 text-xs">Standby</span>
                  </div>
                  <button className="w-full mt-sm py-xs rounded-md border border-dashed border-white/20 text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors text-xs flex items-center justify-center gap-xs">
                    <MaterialIcon name="add" size={16} /> Add Custom Relay
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Action footer */}
        <div className="flex justify-end gap-md mt-lg border-t border-white/10 pt-lg">
          <Button variant="ghost">Discard Changes</Button>
          <Button
            variant="primary"
            onClick={() => {
              updateConfig({ displayName: name, glassOpacity: opacity, listenPort: port });
              useStore.getState().addToast({ id: crypto.randomUUID(), type: "success", message: "Settings applied" });
            }}
          >
            Apply Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
