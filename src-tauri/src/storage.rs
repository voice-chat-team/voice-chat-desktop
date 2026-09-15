use std::path::PathBuf;

use aes_gcm::aead::{Aead, AeadCore, KeyInit};
use aes_gcm::{Aes256Gcm, Nonce};
use keyring::Entry;
use rand::rngs::OsRng;
use rand::RngCore;
use serde::{Deserialize, Serialize};

const SERVICE: &str = "voice-chat-app";
const ACCOUNT: &str = "auth-tokens";
const NONCE_LEN: usize = 12;
const KEY_LEN: usize = 32;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Tokens {
    #[serde(rename = "accessToken")]
    pub access_token: String,
    #[serde(rename = "refreshToken")]
    pub refresh_token: String,
}

/// Abstraction over where tokens are persisted. The concrete backend is
/// chosen at startup: OS keychain when available, otherwise an encrypted file.
pub trait TokenStorage: Send + Sync {
    fn load(&self) -> Result<Option<Tokens>, String>;
    fn save(&self, tokens: &Tokens) -> Result<(), String>;
    fn clear(&self) -> Result<(), String>;

    fn available(&self) -> bool {
        self.load().is_ok()
    }
}

/// OS keychain storage (Windows Credential Manager / macOS Keychain /
/// Linux Secret Service).
pub struct KeyringStorage;

impl TokenStorage for KeyringStorage {
    fn load(&self) -> Result<Option<Tokens>, String> {
        let entry = Entry::new(SERVICE, ACCOUNT).map_err(|e| e.to_string())?;
        match entry.get_password() {
            Ok(json) => {
                let tokens = serde_json::from_str(&json).map_err(|e| e.to_string())?;
                Ok(Some(tokens))
            }
            Err(keyring::Error::NoEntry) => Ok(None),
            Err(e) => Err(e.to_string()),
        }
    }

    fn save(&self, tokens: &Tokens) -> Result<(), String> {
        let entry = Entry::new(SERVICE, ACCOUNT).map_err(|e| e.to_string())?;
        let json = serde_json::to_string(tokens).map_err(|e| e.to_string())?;
        entry.set_password(&json).map_err(|e| e.to_string())
    }

    fn clear(&self) -> Result<(), String> {
        let entry = Entry::new(SERVICE, ACCOUNT).map_err(|e| e.to_string())?;
        match entry.delete_credential() {
            Ok(()) => Ok(()),
            Err(keyring::Error::NoEntry) => Ok(()),
            Err(e) => Err(e.to_string()),
        }
    }
}

/// Fallback storage: AES-256-GCM encrypted file. Used when no OS keychain
/// backend is available (e.g. Linux without a Secret Service).
pub struct EncryptedFileStorage {
    dir: PathBuf,
}

impl EncryptedFileStorage {
    pub fn new(dir: PathBuf) -> Self {
        Self { dir }
    }

    fn key_path(&self) -> PathBuf {
        self.dir.join("auth.key")
    }

    fn data_path(&self) -> PathBuf {
        self.dir.join("tokens.bin")
    }

    fn load_key(&self) -> Result<Vec<u8>, String> {
        let path = self.key_path();
        if path.exists() {
            std::fs::read(&path).map_err(|e| e.to_string())
        } else {
            let mut key = [0u8; KEY_LEN];
            OsRng.fill_bytes(&mut key);
            std::fs::write(&path, &key).map_err(|e| e.to_string())?;
            Ok(key.to_vec())
        }
    }

    fn encrypt(&self, plaintext: &[u8], key: &[u8]) -> Result<Vec<u8>, String> {
        let cipher = Aes256Gcm::new_from_slice(key).map_err(|e| e.to_string())?;
        let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
        let ciphertext = cipher
            .encrypt(&nonce, plaintext)
            .map_err(|e| e.to_string())?;
        let mut out = nonce.to_vec();
        out.extend_from_slice(&ciphertext);
        Ok(out)
    }

    fn decrypt(&self, data: &[u8], key: &[u8]) -> Result<Vec<u8>, String> {
        if data.len() < NONCE_LEN {
            return Err("invalid token data".into());
        }
        let (nonce_bytes, ciphertext) = data.split_at(NONCE_LEN);
        let cipher = Aes256Gcm::new_from_slice(key).map_err(|e| e.to_string())?;
        let nonce = Nonce::from_slice(nonce_bytes);
        cipher.decrypt(nonce, ciphertext).map_err(|e| e.to_string())
    }
}

impl TokenStorage for EncryptedFileStorage {
    fn load(&self) -> Result<Option<Tokens>, String> {
        let data_path = self.data_path();
        if !data_path.exists() {
            return Ok(None);
        }
        let key = self.load_key()?;
        let data = std::fs::read(&data_path).map_err(|e| e.to_string())?;
        let plaintext = self.decrypt(&data, &key)?;
        let tokens = serde_json::from_slice(&plaintext).map_err(|e| e.to_string())?;
        Ok(Some(tokens))
    }

    fn save(&self, tokens: &Tokens) -> Result<(), String> {
        let key = self.load_key()?;
        let plaintext = serde_json::to_vec(tokens).map_err(|e| e.to_string())?;
        let encrypted = self.encrypt(&plaintext, &key)?;
        std::fs::write(self.data_path(), &encrypted).map_err(|e| e.to_string())
    }

    fn clear(&self) -> Result<(), String> {
        if self.data_path().exists() {
            std::fs::remove_file(self.data_path()).map_err(|e| e.to_string())?;
        }
        if self.key_path().exists() {
            std::fs::remove_file(self.key_path()).map_err(|e| e.to_string())?;
        }
        Ok(())
    }
}
