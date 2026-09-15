mod auth;
mod storage;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let dir = app.path().app_config_dir()?;
            std::fs::create_dir_all(&dir).ok();
            app.manage(auth::AuthState::new(dir));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            auth::login,
            auth::logout,
            auth::get_access_token,
            auth::has_token,
            auth::refresh_access_token,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
