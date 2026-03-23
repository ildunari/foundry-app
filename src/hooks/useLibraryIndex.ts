import { useState, useEffect, useCallback } from "react";
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

  return { index, isLoading, error, rescan: scan };
}
