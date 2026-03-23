use notify::{Event, RecursiveMode, Watcher};
use std::path::Path;
use std::sync::mpsc;
use std::time::Duration;
use tauri::{AppHandle, Emitter};

pub fn start_watcher(library_path: &str, app: AppHandle) {
    let path = library_path.to_string();

    std::thread::spawn(move || {
        let (tx, rx) = mpsc::channel();

        let mut watcher = notify::recommended_watcher(move |res: Result<Event, _>| {
            if let Ok(event) = res {
                let _ = tx.send(event);
            }
        })
        .expect("Failed to create file watcher");

        watcher
            .watch(Path::new(&path), RecursiveMode::Recursive)
            .expect("Failed to watch directory");

        // Debounce: collect events for 500ms, then emit one update
        loop {
            match rx.recv() {
                Ok(_event) => {
                    // Drain any additional events within 500ms
                    while rx.recv_timeout(Duration::from_millis(500)).is_ok() {}

                    let _ = app.emit("library-changed", serde_json::json!({}));
                }
                Err(_) => break,
            }
        }
    });
}
