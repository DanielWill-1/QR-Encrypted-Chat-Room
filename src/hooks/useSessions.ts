import { useStore } from "@/state/store";
import { createSession, joinSession, destroySession } from "@/state/actions";
import { useCallback, useState } from "react";

export function useSessions() {
  const sessions = useStore((s) =>
    s.sessionOrder.map((id) => s.sessions[id]).filter(Boolean)
  );
  const activeSessionId = useStore((s) => s.activeSessionId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (displayName?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createSession(displayName);
      return result;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const join = useCallback(async (invite: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await joinSession(invite);
      return result;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const destroy = useCallback((id: Parameters<typeof destroySession>[0]) => {
    destroySession(id);
  }, []);

  const setActive = useCallback((id: typeof activeSessionId) => {
    useStore.getState().setActiveSession(id);
  }, []);

  return { sessions, activeSessionId, loading, error, createSession: create, joinSession: join, destroySession: destroy, setActiveSession: setActive };
}
