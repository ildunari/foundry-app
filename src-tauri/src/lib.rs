mod types;
mod scanner;
mod state;
mod commands;
mod terminal;
mod watcher;

pub fn run() {
    let home = dirs::home_dir().expect("no home directory");
    let library_path = home.join("LocalDev/Design_Library");
    let library_path_str = library_path.to_string_lossy().to_string();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(state::AppState::new(library_path_str.clone()))
        .setup(move |app| {
            watcher::start_watcher(&library_path_str, app.handle().clone());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::scan_library,
            commands::read_file,
            commands::write_file,
            commands::get_asset_path,
            commands::list_files,
            terminal::spawn_terminal,
            terminal::write_terminal,
            terminal::resize_terminal,
            terminal::close_terminal,
        ])
        .run(tauri::generate_context!())
        .expect("error running foundry");
}
