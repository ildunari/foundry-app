import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { LibraryIndex } from "@/lib/types";
import { useLibraryIndex } from "@/hooks/useLibraryIndex";

interface LibraryContextValue {
  index: LibraryIndex | null;
  isLoading: boolean;
  error: string | null;
  rescan: () => void;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const value = useLibraryIndex();
  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
}

export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext);
  if (!ctx) {
    throw new Error("useLibrary must be used within a LibraryProvider");
  }
  return ctx;
}
