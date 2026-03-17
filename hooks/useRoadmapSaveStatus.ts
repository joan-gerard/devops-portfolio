import { useCallback, useEffect, useRef, useState } from "react";

export type RoadmapSaveStatus = "idle" | "saving" | "saved" | "error";

interface UseRoadmapSaveStatusOptions {
  autoResetMs?: number;
}

export function useRoadmapSaveStatus(options?: UseRoadmapSaveStatusOptions) {
  const autoResetMs = options?.autoResetMs ?? 2000;
  const [saveStatus, setSaveStatus] = useState<RoadmapSaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const beginSaving = useCallback(() => {
    clearTimer();
    setSaveStatus("saving");
  }, [clearTimer]);

  const finishSaving = useCallback(
    (ok: boolean) => {
      if (!ok) {
        clearTimer();
        setSaveStatus("error");
        return;
      }

      setSaveStatus("saved");
      clearTimer();
      timerRef.current = setTimeout(() => {
        setSaveStatus("idle");
      }, autoResetMs);
    },
    [autoResetMs, clearTimer]
  );

  const setIdle = useCallback(() => {
    clearTimer();
    setSaveStatus("idle");
  }, [clearTimer]);

  const setError = useCallback(() => {
    clearTimer();
    setSaveStatus("error");
  }, [clearTimer]);

  useEffect(
    () => () => {
      clearTimer();
    },
    [clearTimer]
  );

  return { saveStatus, beginSaving, finishSaving, setIdle, setError };
}
