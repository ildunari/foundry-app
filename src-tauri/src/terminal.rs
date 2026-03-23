use std::io::{Read, Write};
use std::sync::Mutex as StdMutex;
use std::time::{SystemTime, UNIX_EPOCH};

use portable_pty::{native_pty_system, CommandBuilder, MasterPty, PtySize};
use tauri::{AppHandle, Emitter, State};

use crate::state::AppState;

pub struct TerminalSession {
    pub writer: StdMutex<Box<dyn Write + Send>>,
    pub master: StdMutex<Box<dyn MasterPty + Send>>,
    pub child: Box<dyn portable_pty::Child + Send + Sync>,
}

#[tauri::command]
pub async fn spawn_terminal(
    state: State<'_, AppState>,
    app: AppHandle,
) -> Result<String, String> {
    let pty_system = native_pty_system();

    let pair = pty_system
        .openpty(PtySize {
            rows: 24,
            cols: 80,
            pixel_width: 0,
            pixel_height: 0,
        })
        .map_err(|e| format!("Failed to open PTY: {e}"))?;

    let cwd = state.library_path.clone();

    let mut cmd = CommandBuilder::new("claude");
    cmd.cwd(&cwd);

    let child = pair
        .slave
        .spawn_command(cmd)
        .map_err(|e| format!("Failed to spawn command: {e}"))?;

    let mut reader = pair
        .master
        .try_clone_reader()
        .map_err(|e| format!("Failed to clone reader: {e}"))?;

    let writer = pair
        .master
        .take_writer()
        .map_err(|e| format!("Failed to take writer: {e}"))?;

    let session_id = format!(
        "term-{}",
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_millis()
    );

    let session = TerminalSession {
        writer: StdMutex::new(writer),
        master: StdMutex::new(pair.master),
        child,
    };

    {
        let mut sessions = state.terminal_sessions.lock().await;
        sessions.insert(session_id.clone(), session);
    }

    // Spawn a blocking task to read PTY output
    let sid = session_id.clone();
    let app_handle = app.clone();
    tokio::task::spawn_blocking(move || {
        let mut buf = [0u8; 4096];
        loop {
            match reader.read(&mut buf) {
                Ok(0) => break,
                Ok(n) => {
                    let output = String::from_utf8_lossy(&buf[..n]).to_string();
                    let _ = app_handle.emit(
                        "terminal-output",
                        serde_json::json!({
                            "sessionId": sid,
                            "data": output
                        }),
                    );
                }
                Err(_) => break,
            }
        }
        let _ = app_handle.emit(
            "terminal-exit",
            serde_json::json!({ "sessionId": sid }),
        );
    });

    Ok(session_id)
}

#[tauri::command]
pub async fn write_terminal(
    session_id: String,
    data: String,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let sessions = state.terminal_sessions.lock().await;
    let session = sessions
        .get(&session_id)
        .ok_or_else(|| format!("Session not found: {session_id}"))?;

    let mut writer = session
        .writer
        .lock()
        .map_err(|e| format!("Failed to lock writer: {e}"))?;

    writer
        .write_all(data.as_bytes())
        .map_err(|e| format!("Failed to write to terminal: {e}"))?;

    writer
        .flush()
        .map_err(|e| format!("Failed to flush terminal: {e}"))?;

    Ok(())
}

#[tauri::command]
pub async fn resize_terminal(
    session_id: String,
    cols: u16,
    rows: u16,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let sessions = state.terminal_sessions.lock().await;
    let session = sessions
        .get(&session_id)
        .ok_or_else(|| format!("Session not found: {session_id}"))?;

    let master = session
        .master
        .lock()
        .map_err(|e| format!("Failed to lock master: {e}"))?;

    master
        .resize(PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        })
        .map_err(|e| format!("Failed to resize terminal: {e}"))?;

    Ok(())
}

#[tauri::command]
pub async fn close_terminal(
    session_id: String,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let mut sessions = state.terminal_sessions.lock().await;
    let mut session = sessions
        .remove(&session_id)
        .ok_or_else(|| format!("Session not found: {session_id}"))?;

    session
        .child
        .kill()
        .map_err(|e| format!("Failed to kill child process: {e}"))?;

    // Reap the process to prevent zombies
    let _ = session.child.wait();

    Ok(())
}
