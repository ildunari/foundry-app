import { invoke } from "@tauri-apps/api/core";
import type { LibraryIndex } from "./types";

export async function scanLibrary(): Promise<LibraryIndex> {
  return await invoke<LibraryIndex>("scan_library");
}
