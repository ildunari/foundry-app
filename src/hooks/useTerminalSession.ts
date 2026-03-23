import { useCallback, useState } from "react";
import { spawnTerminal, closeTerminal } from "@/lib/terminal";

export function useTerminalSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  const spawn = useCallback(async () => {
    const id = await spawnTerminal();
    setSessionId(id);
    setIsActive(true);
  }, []);

  const close = useCallback(async () => {
    if (sessionId) {
      await closeTerminal(sessionId);
    }
    setSessionId(null);
    setIsActive(false);
  }, [sessionId]);

  return { sessionId, isActive, spawn, close };
}
