import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";

export async function spawnTerminal(): Promise<string> {
  return await invoke<string>("spawn_terminal");
}

export async function writeTerminal(sessionId: string, data: string) {
  await invoke("write_terminal", { sessionId, data });
}

export async function resizeTerminal(
  sessionId: string,
  cols: number,
  rows: number,
) {
  await invoke("resize_terminal", {
    sessionId,
    cols: Math.floor(cols),
    rows: Math.floor(rows),
  });
}

export async function closeTerminal(sessionId: string) {
  await invoke("close_terminal", { sessionId });
}

export function onTerminalOutput(
  cb: (data: { sessionId: string; data: string }) => void,
): Promise<UnlistenFn> {
  return listen<{ sessionId: string; data: string }>(
    "terminal-output",
    (event) => cb(event.payload),
  );
}

export function onTerminalExit(
  cb: (data: { sessionId: string }) => void,
): Promise<UnlistenFn> {
  return listen<{ sessionId: string }>("terminal-exit", (event) =>
    cb(event.payload),
  );
}
