import { useState } from "react";
import { useStore } from "@/state/store";
import { createSession, joinSession } from "@/state/actions";
import { MaterialIcon } from "../common/MaterialIcon";
import { GlassPanel } from "../common/GlassPanel";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Dialog } from "../common/Dialog";
import { Badge } from "../common/Badge";
import { Spinner } from "../common/Spinner";

export function JoinSessionView() {
  const addToast = useStore((s) => s.addToast);
  const [showCreate, setShowCreate] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [expiry, setExpiry] = useState("1h");
  const [inviteString, setInviteString] = useState("");
  const [joining, setJoining] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createdInvite, setCreatedInvite] = useState<string | null>(null);
  const [createdQr, setCreatedQr] = useState<string | null>(null);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const { inviteString: invite } = await createSession(sessionName || undefined);
      setCreatedInvite(invite);
      // In real app: render QR from invite
      addToast({ id: crypto.randomUUID(), type: "success", message: "Session created" });
      setShowCreate(false);
    } catch (e) {
      addToast({ id: crypto.randomUUID(), type: "error", message: e instanceof Error ? e.message : "Failed to create session" });
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteString.trim()) return;
    setJoining(true);
    try {
      await joinSession(inviteString.trim());
      addToast({ id: crypto.randomUUID(), type: "success", message: "Joined session" });
    } catch (e) {
      addToast({ id: crypto.randomUUID(), type: "error", message: e instanceof Error ? e.message : "Failed to join" });
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-md antialiased">
      <GlassPanel variant="modal" padded className="w-full max-w-md flex flex-col gap-lg relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none" />

        {/* Branding */}
        <div className="mb-lg text-center">
          <MaterialIcon name="fingerprint" size={48} className="text-primary mb-sm block" />
          <h1 className="text-headline-lg-mobile md:text-headline-lg text-on-surface tracking-tighter">GhostLink</h1>
          <p className="text-body-sm text-on-surface-variant mt-xs">Secure. Ephemeral. Instant.</p>
        </div>

        {/* Actions */}
        <div className="w-full space-y-md">
          <Button
            variant="primary"
            icon={<MaterialIcon name="add_circle" filled size={20} />}
            onClick={() => setShowCreate(true)}
            className="w-full rounded-full py-md"
          >
            Create New Session
          </Button>

          <div className="flex items-center gap-sm w-full my-md opacity-50">
            <div className="h-px bg-outline-variant flex-1" />
            <span className="text-label-caps text-on-surface-variant uppercase">or</span>
            <div className="h-px bg-outline-variant flex-1" />
          </div>

          <div className="w-full">
            <Input
              icon={<MaterialIcon name="key" size={20} />}
              rightIcon={
                <button onClick={handleJoin} disabled={joining} className="text-primary hover:brightness-125 p-xs rounded-full hover:bg-white/5">
                  {joining ? <Spinner size="sm" /> : <MaterialIcon name="arrow_forward" filled size={20} />}
                </button>
              }
              placeholder="Enter Session ID..."
              value={inviteString}
              onChange={(e) => setInviteString(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            />
          </div>

          <button className="w-full mt-sm flex items-center justify-center gap-xs text-on-surface-variant hover:text-primary transition-colors text-body-sm py-sm group">
            <MaterialIcon name="qr_code_scanner" size={20} />
            Scan Pairing Code
          </button>
        </div>

        {/* Security Badge */}
        <div className="mt-xl flex items-center gap-xs px-sm py-xs border border-tertiary/30 rounded-full bg-tertiary/10 mx-auto">
          <MaterialIcon name="lock" filled size={14} className="text-tertiary" />
          <span className="text-mono-code text-tertiary uppercase tracking-wider text-[10px]">End-to-End Encrypted</span>
        </div>

        {/* Created invite display */}
        {createdInvite && (
          <div className="mt-md glass-level-1 rounded-xl p-md flex flex-col gap-sm">
            <p className="text-label-caps text-primary">Session Created</p>
            <code className="text-mono-code text-on-surface break-all bg-surface-container p-sm rounded">{createdInvite}</code>
            <Button
              variant="ghost"
              size="sm"
              icon={<MaterialIcon name="content_copy" size={14} />}
              onClick={() => {
                navigator.clipboard.writeText(createdInvite);
                addToast({ id: crypto.randomUUID(), type: "info", message: "Copied" });
              }}
            >
              Copy Invite
            </Button>
          </div>
        )}
      </GlassPanel>

      {/* Create Session Modal */}
      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title="Create New Session">
        {/* Session Name */}
        <div className="flex flex-col gap-sm">
          <label className="text-label-caps text-on-surface-variant flex justify-between">
            Session Identifier
            <button className="text-primary hover:brightness-125 flex items-center gap-xs">
              <MaterialIcon name="autorenew" size={14} /> Generate Random
            </button>
          </label>
          <Input
            icon={<MaterialIcon name="tag" size={20} />}
            placeholder="Set Custom Session Name"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
          />
        </div>

        {/* Expiry */}
        <div className="flex flex-col gap-sm">
          <label className="text-label-caps text-on-surface-variant">Session Expiry</label>
          <div className="grid grid-cols-4 gap-sm">
            {[
              { val: "1h", icon: "hourglass_top" },
              { val: "4h", icon: "hourglass_empty" },
              { val: "24h", icon: "hourglass_bottom" },
              { val: "manual", icon: "timer_off" },
            ].map((opt) => (
              <label key={opt.val} className="cursor-pointer relative">
                <input
                  type="radio"
                  name="expiry"
                  value={opt.val}
                  checked={expiry === opt.val}
                  onChange={() => setExpiry(opt.val)}
                  className="sr-only peer"
                />
                <div className="h-full px-sm py-md rounded-lg border border-white/10 bg-surface-container/30 text-center flex flex-col items-center justify-center gap-xs peer-checked:bg-primary/20 peer-checked:border-primary/50 peer-checked:text-primary transition-all hover:bg-white/5">
                  <MaterialIcon name={opt.icon} size={20} />
                  <span className="text-body-sm">{opt.val === "manual" ? "Manual" : opt.val}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Auth toggle */}
        <div className="flex items-center justify-between py-xs border-b border-white/10 pb-md">
          <span className="text-body-sm text-on-surface">Require Peer Authentication</span>
          <button
            onClick={(e) => e.currentTarget.classList.toggle("active")}
            className="w-10 h-6 bg-surface-container rounded-full relative border border-white/10 transition-colors"
          >
            <span className="absolute left-1 top-1 w-4 h-4 bg-on-surface-variant rounded-full transition-transform" />
          </button>
        </div>

        <Button
          variant="primary"
          icon={<MaterialIcon name="shield_locked" size={20} />}
          onClick={handleCreate}
          disabled={creating}
          className="w-full"
        >
          {creating ? "Initializing..." : "Initialize Secure Session"}
        </Button>
        <p className="text-center text-mono-code text-on-surface-variant/50">
          <MaterialIcon name="encrypted" size={12} /> E2E Encryption Active
        </p>
      </Dialog>
    </div>
  );
}
