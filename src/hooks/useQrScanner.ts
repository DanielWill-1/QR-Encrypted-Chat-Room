import { useState, useCallback, useRef } from "react";

export interface QrScannerState {
  state: "idle" | "requesting" | "scanning" | "error";
  lastResult: string | null;
  error: string | null;
}

export function useQrScanner() {
  const [scannerState, setScannerState] = useState<QrScannerState>({
    state: "idle",
    lastResult: null,
    error: null,
  });
  const streamRef = useRef<MediaStream | null>(null);

  const start = useCallback(async () => {
    setScannerState({ state: "requesting", lastResult: null, error: null });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setScannerState({ state: "scanning", lastResult: null, error: null });
    } catch (err) {
      setScannerState({
        state: "error",
        lastResult: null,
        error: err instanceof Error ? err.message : "Camera access denied",
      });
    }
  }, []);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScannerState({ state: "idle", lastResult: null, error: null });
  }, []);

  const onResult = useCallback((result: string) => {
    setScannerState((s) => ({ ...s, lastResult: result, state: "idle" }));
    stop();
  }, [stop]);

  return { ...scannerState, streamRef, start, stop, onResult };
}
