import { invoke } from "@tauri-apps/api/core";

export async function readFile(path: string): Promise<string> {
  return invoke<string>("read_file", { path });
}

export async function getAssetPath(path: string): Promise<string> {
  return invoke<string>("get_asset_path", { path });
}

export async function writeFile(path: string, content: string): Promise<void> {
  return invoke<void>("write_file", { path, content });
}

export async function listFiles(dir: string): Promise<string[]> {
  return invoke<string[]>("list_files", { dir });
}
