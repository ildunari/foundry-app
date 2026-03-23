import { useCallback, useEffect, useRef, useState } from "react";
import { spawnTerminal, closeTerminal } from "@/lib/terminal";

export function useTerminalSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<string | null>(null);

  const spawn = useCallback(async () => {
    try {
      setError(null);
      const id = await spawnTerminal();
      setSessionId(id);
      setIsActive(true);
      sessionRef.current = id;
    } catch (e) {
      setError(String(e));
      setIsActive(false);
    }
  }, []);

  const close = useCallback(async () => {
    if (sessionRef.current) {
      try {
        await closeTerminal(sessionRef.current);
      } catch {
        // Session may already be gone
      }
    }
    sessionRef.current = null;
    setSessionId(null);
    setIsActive(false);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        closeTerminal(sessionRef.current).catch(() => {});
      }
    };
  }, []);

  return { sessionId, isActive, error, spawn, close };
}
