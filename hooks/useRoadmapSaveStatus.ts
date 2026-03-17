import { useCallback, useEffect, useRef, useState } from "react";

export type RoadmapSaveStatus = "idle" | "saving" | "saved" | "error";

interface UseRoadmapSaveStatusOptions {
  autoResetMs?: number;
}

export function useRoadmapSaveStatus(options?: UseRoadmapSaveStatusOptions) {
  const autoResetMs = options?.autoResetMs ?? 2000;
  const [saveStatus, setSaveStatus] = useState<RoadmapSaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const beginSaving = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSaveStatus("saving");
  }, []);

  const finishSaving = useCallback(
    (ok: boolean) => {
      if (!ok) {
        setSaveStatus("error");
        return;
      }

      setSaveStatus("saved");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setSaveStatus("idle");
      }, autoResetMs);
    },
    [autoResetMs]
  );

  const setIdle = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSaveStatus("idle");
  }, []);

  const setError = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSaveStatus("error");
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  return { saveStatus, beginSaving, finishSaving, setIdle, setError };
}
