mod auth;
mod storage;
#[cfg(desktop)]
mod tray;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default();

    // Must be the first plugin: a second launch (e.g. from the Start menu while
    // the app sits in the tray) brings the existing window back instead.
    #[cfg(desktop)]
    let builder = builder
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            tray::show_main_window(app);
        }))
        .on_window_event(tray::on_window_event);

    builder
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let dir = app.path().app_config_dir()?;
            std::fs::create_dir_all(&dir).ok();
            app.manage(auth::AuthState::new(dir));
            #[cfg(desktop)]
            tray::setup(app)?;
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
