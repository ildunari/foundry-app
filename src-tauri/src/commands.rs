use tauri::State;

use crate::scanner;
use crate::state::AppState;
use crate::types::LibraryIndex;

#[tauri::command]
pub async fn scan_library(state: State<'_, AppState>) -> Result<LibraryIndex, String> {
    let path = std::path::Path::new(&state.library_path);
    let index = scanner::scan(path).map_err(|e| e.to_string())?;
    let mut cached = state.cached_index.lock().await;
    *cached = Some(index.clone());
    Ok(index)
}

#[tauri::command]
pub async fn read_file(path: String, state: State<'_, AppState>) -> Result<String, String> {
    let full_path = std::path::Path::new(&state.library_path).join(&path);
    tokio::fs::read_to_string(&full_path)
        .await
        .map_err(|e| format!("Failed to read {}: {e}", path))
}

#[tauri::command]
pub async fn get_asset_path(path: String, state: State<'_, AppState>) -> Result<String, String> {
    let full_path = std::path::Path::new(&state.library_path).join(&path);
    if full_path.exists() {
        Ok(full_path.to_string_lossy().to_string())
    } else {
        Err(format!("Asset not found: {path}"))
    }
}

#[tauri::command]
pub async fn write_file(path: String, content: String, state: State<'_, AppState>) -> Result<(), String> {
    let full_path = std::path::Path::new(&state.library_path).join(&path);
    if let Some(parent) = full_path.parent() {
        tokio::fs::create_dir_all(parent)
            .await
            .map_err(|e| format!("Failed to create directory: {e}"))?;
    }
    tokio::fs::write(&full_path, content)
        .await
        .map_err(|e| format!("Failed to write {}: {e}", path))
}

#[tauri::command]
pub async fn list_files(dir: String, state: State<'_, AppState>) -> Result<Vec<String>, String> {
    let full_path = std::path::Path::new(&state.library_path).join(&dir);
    let mut entries = Vec::new();
    let mut read_dir = tokio::fs::read_dir(&full_path)
        .await
        .map_err(|e| format!("Failed to read directory {}: {e}", dir))?;
    while let Some(entry) = read_dir.next_entry().await.map_err(|e| e.to_string())? {
        if let Some(name) = entry.file_name().to_str() {
            entries.push(name.to_string());
        }
    }
    entries.sort();
    Ok(entries)
}
