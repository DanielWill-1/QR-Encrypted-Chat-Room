import type { Session, SessionState } from "@/types/session";

type Transition = { from: SessionState[]; to: SessionState };

const TRANSITIONS: Transition[] = [
  { from: ["idle"], to: "creating" },
  { from: ["creating"], to: "inviting" },
  { from: ["idle"], to: "joining" },
  { from: ["joining"], to: "connecting" },
  { from: ["inviting"], to: "connecting" },
  { from: ["connecting"], to: "authenticating" },
  { from: ["authenticating"], to: "active" },
  { from: ["active"], to: "expiring" },
  { from: ["expiring"], to: "expired" },
  { from: ["active", "expiring", "expired", "connecting", "authenticating", "error"], to: "destroying" },
  { from: ["destroying"], to: "destroyed" },
  { from: ["creating", "joining", "connecting", "authenticating"], to: "error" },
  { from: ["error"], to: "destroying" },
];

export function canTransition(from: SessionState, to: SessionState): boolean {
  return TRANSITIONS.some((t) => t.from.includes(from) && t.to === to);
}

export function transition(session: Session, to: SessionState): Session {
  if (!session) {
    throw new Error(`Invalid session transition: missing session -> ${to}`);
  }
  if (!canTransition(session.state, to)) {
    throw new Error(`Invalid session transition: ${session.state} -> ${to}`);
  }
  return { ...session, state: to, errorMessage: to === "error" ? session.errorMessage : undefined };
}
