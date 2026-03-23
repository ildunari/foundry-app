import { useState, useEffect, useCallback } from "react";
import { listen } from "@tauri-apps/api/event";
import type { LibraryIndex } from "@/lib/types";
import { scanLibrary } from "@/lib/scanner";

export interface UseLibraryIndexResult {
  index: LibraryIndex | null;
  isLoading: boolean;
  error: string | null;
  rescan: () => void;
}

export function useLibraryIndex(): UseLibraryIndexResult {
  const [index, setIndex] = useState<LibraryIndex | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scan = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await scanLibrary();
      setIndex(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    scan();
  }, [scan]);

  // Auto-rescan when file watcher detects changes
  useEffect(() => {
    let cancelled = false;
    let unlisten: (() => void) | null = null;

    listen("library-changed", () => {
      if (!cancelled) scan();
    }).then((fn) => {
      if (cancelled) fn();
      else unlisten = fn;
    });

    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, [scan]);

  return { index, isLoading, error, rescan: scan };
}
