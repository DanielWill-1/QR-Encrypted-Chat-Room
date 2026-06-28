import { useState } from "react";
import { useStore } from "@/state/store";
import { createSession, joinSession } from "@/state/actions";
import { MaterialIcon } from "../common/MaterialIcon";
import { GlassPanel } from "../common/GlassPanel";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Dialog } from "../common/Dialog";
import { Spinner } from "../common/Spinner";

export function JoinSessionView() {
  const addToast = useStore((s) => s.addToast);
  const openCreatedSession = useStore((s) => {
    const store = s as typeof s & {
      setActiveSession?: (id: string) => void;
      setActiveSessionId?: (id: string) => void;
      setCurrentSession?: (id: string) => void;
      setCurrentSessionId?: (id: string) => void;
      selectSession?: (id: string) => void;
      openSession?: (id: string) => void;
      navigateToSession?: (id: string) => void;
    };

    return (
      store.setActiveSession ??
      store.setActiveSessionId ??
      store.setCurrentSession ??
      store.setCurrentSessionId ??
      store.selectSession ??
      store.openSession ??
      store.navigateToSession ??
      null
    );
  });
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
      const { inviteString: invite, session } = await createSession(sessionName || undefined);
      const createdSession = session as typeof session & { id?: string; sessionId?: string };
      const sessionId = createdSession.id ?? createdSession.sessionId;

      if (sessionId && openCreatedSession) {
        openCreatedSession(sessionId);
        setCreatedInvite(null);
        setCreatedQr(null);
      } else {
        setCreatedInvite(invite);
        setCreatedQr(session.inviteQrDataUrl ?? null);
      }

      addToast({ id: crypto.randomUUID(), type: "success", message: "Session created" });
      setShowCreate(false);
    } catch (e) {
      addToast({
        id: crypto.randomUUID(),
        type: "error",
        message: e instanceof Error ? e.message : "Failed to create session",
      });
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
      addToast({
        id: crypto.randomUUID(),
        type: "error",
        message: e instanceof Error ? e.message : "Failed to join",
      });
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="flex-1 min-w-0 overflow-y-auto p-lg md:p-xl antialiased">
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-xl">
        <header>
          <h1 className="text-headline-lg-mobile md:text-headline-lg text-on-surface tracking-tighter">
            GhostLink
          </h1>
          <p className="mt-xs text-body-md text-on-surface-variant">
            Create a secure session or join with a pairing code.
          </p>
        </header>

        <GlassPanel variant="modal" padded className="relative w-full overflow-hidden">
          <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-3/4 -translate-x-1/2 rounded-full bg-primary/10 blur-[50px]" />

          <div className="relative flex flex-col gap-lg">
            <div className="flex items-start gap-md">
              <div className="grid size-16 shrink-0 place-items-center rounded-full border border-outline-variant bg-surface-container/40">
                <MaterialIcon name="fingerprint" size={42} className="text-primary" />
              </div>
              <div className="min-w-0">
                <h2 className="text-title-lg text-on-surface">Secure Pairing</h2>
                <p className="mt-xs text-body-sm text-on-surface-variant">
                  Ephemeral encrypted sessions with instant peer discovery.
                </p>
              </div>
            </div>

            <div className="grid gap-md md:grid-cols-[1fr_auto_1fr] md:items-stretch">
              <Button
                variant="primary"
                icon={<MaterialIcon name="add_circle" filled size={20} />}
                onClick={() => setShowCreate(true)}
                className="h-14 w-full rounded-full"
              >
                Create New Session
              </Button>

              <div className="flex items-center gap-sm opacity-60 md:flex-col md:justify-center">
                <div className="h-px flex-1 bg-outline-variant md:h-full md:w-px" />
                <span className="text-label-caps text-on-surface-variant uppercase">or</span>
                <div className="h-px flex-1 bg-outline-variant md:h-full md:w-px" />
              </div>

              <Input
                icon={<MaterialIcon name="key" size={20} />}
                rightIcon={
                  <button
                    onClick={handleJoin}
                    disabled={joining || !inviteString.trim()}
                    className="rounded-full p-xs text-primary transition-colors hover:bg-white/5 hover:brightness-125 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Join session"
                  >
                    {joining ? <Spinner size="sm" /> : <MaterialIcon name="arrow_forward" filled size={20} />}
                  </button>
                }
                placeholder="Enter Session ID..."
                value={inviteString}
                onChange={(e) => setInviteString(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              />
            </div>

            <button className="flex w-full items-center justify-center gap-xs rounded-lg py-sm text-body-sm text-on-surface-variant transition-colors hover:bg-white/5 hover:text-primary">
              <MaterialIcon name="qr_code_scanner" size={20} />
              Scan Pairing Code
            </button>

            <div className="mx-auto flex items-center gap-xs rounded-full border border-tertiary/30 bg-tertiary/10 px-sm py-xs">
              <MaterialIcon name="lock" filled size={14} className="text-tertiary" />
              <span className="text-mono-code text-[10px] uppercase tracking-wider text-tertiary">
                End-to-End Encrypted
              </span>
            </div>

            {createdInvite && (
              <div className="glass-level-1 flex flex-col gap-sm rounded-xl p-md">
                <p className="text-label-caps text-primary">Session Created</p>
                {createdQr && (
                  <img
                    src={createdQr}
                    alt="Session pairing QR code"
                    className="mx-auto size-48 rounded-lg bg-white p-xs"
                  />
                )}
                <code className="rounded bg-surface-container p-sm text-mono-code text-on-surface break-all">
                  {createdInvite}
                </code>
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
          </div>
        </GlassPanel>
      </div>

      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title="Create New Session">
        <div className="flex w-[min(92vw,520px)] min-w-[320px] max-w-full flex-col gap-lg">
          <div className="flex flex-col gap-sm">
            <label className="flex flex-wrap items-center justify-between gap-xs text-label-caps text-on-surface-variant">
              <span>Session Identifier</span>
              <button className="flex items-center gap-xs text-primary hover:brightness-125">
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

          <div className="flex flex-col gap-sm">
            <label className="text-label-caps text-on-surface-variant">Session Expiry</label>
            <div className="grid grid-cols-2 gap-sm sm:grid-cols-4">
              {[
                { val: "1h", icon: "hourglass_top" },
                { val: "4h", icon: "hourglass_empty" },
                { val: "24h", icon: "hourglass_bottom" },
                { val: "manual", icon: "timer_off" },
              ].map((opt) => (
                <label key={opt.val} className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="expiry"
                    value={opt.val}
                    checked={expiry === opt.val}
                    onChange={() => setExpiry(opt.val)}
                    className="peer sr-only"
                  />
                  <div className="flex min-h-24 flex-col items-center justify-center gap-xs rounded-lg border border-white/10 bg-surface-container/30 px-sm py-md text-center transition-all hover:bg-white/5 peer-checked:border-primary/50 peer-checked:bg-primary/20 peer-checked:text-primary">
                    <MaterialIcon name={opt.icon} size={20} />
                    <span className="text-body-sm">{opt.val === "manual" ? "Manual" : opt.val}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-md border-b border-white/10 py-xs pb-md">
            <span className="min-w-0 text-body-sm text-on-surface">Require Peer Authentication</span>
            <button
              onClick={(e) => e.currentTarget.classList.toggle("active")}
              className="relative h-6 w-10 shrink-0 rounded-full border border-white/10 bg-surface-container transition-colors"
            >
              <span className="absolute left-1 top-1 size-4 rounded-full bg-on-surface-variant transition-transform" />
            </button>
          </div>

          <Button
            variant="primary"
            icon={<MaterialIcon name="shield_locked" size={20} />}
            onClick={handleCreate}
            disabled={creating}
            className="w-full rounded-full py-md"
          >
            {creating ? "Initializing..." : "Initialize Secure Session"}
          </Button>
          <p className="flex items-center justify-center gap-xs text-center text-mono-code text-on-surface-variant/50">
            <MaterialIcon name="encrypted" size={12} /> E2E Encryption Active
          </p>
        </div>
      </Dialog>
    </div>
  );
}
