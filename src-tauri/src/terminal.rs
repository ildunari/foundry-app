use tauri::{AppHandle, State};

use crate::state::AppState;

pub struct TerminalSession {
    // Will be implemented in Task 8
}

#[tauri::command]
pub async fn spawn_terminal(
    _state: State<'_, AppState>,
    _app: AppHandle,
) -> Result<String, String> {
    Err("Terminal not yet implemented".to_string())
}

#[tauri::command]
pub async fn write_terminal(
    _session_id: String,
    _data: String,
    _state: State<'_, AppState>,
) -> Result<(), String> {
    Err("Terminal not yet implemented".to_string())
}

#[tauri::command]
pub async fn resize_terminal(
    _session_id: String,
    _cols: u16,
    _rows: u16,
    _state: State<'_, AppState>,
) -> Result<(), String> {
    Err("Terminal not yet implemented".to_string())
}

#[tauri::command]
pub async fn close_terminal(
    _session_id: String,
    _state: State<'_, AppState>,
) -> Result<(), String> {
    Err("Terminal not yet implemented".to_string())
}
