use std::path::PathBuf;
use std::sync::Mutex;

use tauri::State;

use crate::storage::{EncryptedFileStorage, KeyringStorage, TokenStorage, Tokens};

const BASE_URL: &str = "https://api.voice-chat-app.ru";

pub struct AuthState {
    storage: Box<dyn TokenStorage>,
    tokens: Mutex<Option<Tokens>>,
    refresh_lock: tokio::sync::Mutex<()>,
    client: reqwest::Client,
}

impl AuthState {
    pub fn new(dir: PathBuf) -> Self {
        let keyring = KeyringStorage;
        let storage: Box<dyn TokenStorage> = if keyring.available() {
            Box::new(keyring)
        } else {
            Box::new(EncryptedFileStorage::new(dir))
        };

        Self {
            storage,
            tokens: Mutex::new(None),
            refresh_lock: tokio::sync::Mutex::new(()),
            client: reqwest::Client::new(),
        }
    }

    async fn ensure_loaded(&self) -> Result<(), String> {
        if self.tokens.lock().unwrap().is_none() {
            let loaded = self.storage.load()?;
            *self.tokens.lock().unwrap() = loaded;
        }
        Ok(())
    }

    async fn extract_error(&self, res: reqwest::Response) -> String {
        let status = res.status();
        let body = res.text().await.unwrap_or_default();
        eprintln!("[auth] HTTP error {status}: {body}");
        match serde_json::from_str::<serde_json::Value>(&body) {
            Ok(value) => value
                .get("message")
                .and_then(|m| m.as_str())
                .map(|s| s.to_string())
                .unwrap_or_else(|| format!("HTTP {status}")),
            Err(_) => format!("HTTP {status}"),
        }
    }

    async fn get_access_token(&self) -> Result<String, String> {
        self.ensure_loaded().await?;
        let guard = self.tokens.lock().unwrap();
        guard
            .as_ref()
            .map(|t| t.access_token.clone())
            .ok_or_else(|| "No access token".to_string())
    }

    async fn has_token(&self) -> Result<bool, String> {
        self.ensure_loaded().await?;
        Ok(self.tokens.lock().unwrap().is_some())
    }

    async fn login(&self, email: &str, password: &str) -> Result<(), String> {
        let res = self
            .client
            .post(format!("{BASE_URL}/auth/login"))
            .json(&serde_json::json!({ "email": email, "password": password }))
            .send()
            .await
            .map_err(|e| e.to_string())?;

        if !res.status().is_success() {
            return Err(self.extract_error(res).await);
        }

        let tokens: Tokens = res.json().await.map_err(|e| e.to_string())?;
        self.storage.save(&tokens)?;
        *self.tokens.lock().unwrap() = Some(tokens);
        Ok(())
    }

    async fn logout(&self) -> Result<(), String> {
        self.storage.clear()?;
        *self.tokens.lock().unwrap() = None;
        Ok(())
    }

    async fn refresh_access_token(&self) -> Result<String, String> {
        let _lock = self.refresh_lock.lock().await;

        self.ensure_loaded().await?;
        let refresh_token = {
            let guard = self.tokens.lock().unwrap();
            guard
                .as_ref()
                .map(|t| t.refresh_token.clone())
                .ok_or_else(|| "No refresh token".to_string())?
        };

        let res = self
            .client
            .post(format!("{BASE_URL}/auth/refresh-token"))
            .json(&serde_json::json!({ "refreshToken": refresh_token }))
            .send()
            .await
            .map_err(|e| e.to_string())?;

        if !res.status().is_success() {
            let _ = self.storage.clear();
            *self.tokens.lock().unwrap() = None;
            return Err(self.extract_error(res).await);
        }

        let tokens: Tokens = res.json().await.map_err(|e| e.to_string())?;
        self.storage.save(&tokens)?;
        *self.tokens.lock().unwrap() = Some(tokens.clone());
        Ok(tokens.access_token)
    }
}

#[tauri::command]
pub async fn login(
    state: State<'_, AuthState>,
    email: String,
    password: String,
) -> Result<(), String> {
    state.login(&email, &password).await
}

#[tauri::command]
pub async fn logout(state: State<'_, AuthState>) -> Result<(), String> {
    state.logout().await
}

#[tauri::command]
pub async fn get_access_token(state: State<'_, AuthState>) -> Result<String, String> {
    state.get_access_token().await
}

#[tauri::command]
pub async fn has_token(state: State<'_, AuthState>) -> Result<bool, String> {
    state.has_token().await
}

#[tauri::command]
pub async fn refresh_access_token(state: State<'_, AuthState>) -> Result<String, String> {
    state.refresh_access_token().await
}
