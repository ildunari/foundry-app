use std::collections::HashMap;
use tokio::sync::Mutex;

use crate::types::LibraryIndex;

pub struct AppState {
    pub library_path: String,
    pub cached_index: Mutex<Option<LibraryIndex>>,
    pub terminal_sessions: Mutex<HashMap<String, crate::terminal::TerminalSession>>,
}

impl AppState {
    pub fn new(library_path: String) -> Self {
        Self {
            library_path,
            cached_index: Mutex::new(None),
            terminal_sessions: Mutex::new(HashMap::new()),
        }
    }
}
