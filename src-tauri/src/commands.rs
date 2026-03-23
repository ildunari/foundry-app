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
