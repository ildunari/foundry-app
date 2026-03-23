mod types;
mod scanner;
mod state;
mod commands;
mod terminal;

pub fn run() {
    let home = dirs::home_dir().expect("no home directory");
    let library_path = home.join("LocalDev/Design_Library");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(state::AppState::new(
            library_path.to_string_lossy().to_string(),
        ))
        .invoke_handler(tauri::generate_handler![
            commands::scan_library,
            terminal::spawn_terminal,
            terminal::write_terminal,
            terminal::resize_terminal,
            terminal::close_terminal,
        ])
        .run(tauri::generate_context!())
        .expect("error running foundry");
}
