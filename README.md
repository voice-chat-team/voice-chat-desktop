<div align="center">

<img src="src-tauri/icons/icon.png" width="96" alt="VoiceChat" />

# VoiceChat

**Десктопный и мобильный мессенджер для команд и сообществ — серверы, текстовые и голосовые каналы, совместные доски.**

[![Release](https://img.shields.io/github/v/release/voice-chat-team/voice-chat-desktop?label=релиз&color=7c3aed)](https://github.com/voice-chat-team/voice-chat-desktop/releases/latest)
![Tauri](https://img.shields.io/badge/Tauri-2-24C8DB?logo=tauri&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-backend-000000?logo=rust&logoColor=white)
![Platforms](https://img.shields.io/badge/платформы-Windows%20%7C%20Android-7c3aed)

[Скачать](#-установка) · [Возможности](#-возможности) · [Скриншоты](#-скриншоты) · [Разработка](#-разработка)

<img src="docs/screenshots/chat.png" alt="Текстовый канал VoiceChat" width="100%" />

</div>

## ✨ Возможности

- 🏰 **Серверы** — создавайте свои сообщества, приглашайте участников и управляйте составом.
- 💬 **Текстовые каналы** — сообщения в реальном времени, группировка по дням, эмодзи.
- 🎙️ **Голосовые каналы** — голосовая связь на базе [LiveKit](https://livekit.io/): видно, кто сейчас в канале, есть быстрые кнопки микрофона, звука и отключения.
- 🖌️ **Доски** — бесконечный холст на [Excalidraw](https://excalidraw.com/) прямо внутри сервера, для схем, набросков и мозговых штурмов.
- 🔔 **Уведомления** — приглашения и события приходят мгновенно через Centrifugo, плюс системные уведомления ОС.
- 🎧 **Настройки звука** — выбор микрофона и динамиков (запоминается между запусками), громкость.
- 🔐 **Безопасность** — токены хранятся не в браузере, а в Rust-части приложения: в системном хранилище ключей (Windows Credential Manager / macOS Keychain / Secret Service) или в файле, зашифрованном AES-256-GCM.
- 📱 **Мобильная версия** — адаптивный интерфейс и сборка под Android.

## 📸 Скриншоты

<table>
  <tr>
    <td width="50%">
      <img src="docs/screenshots/voice.png" alt="Голосовой канал" />
      <p align="center"><b>Голосовой канал</b><br/><sub>Участники на сцене и панель управления звонком</sub></p>
    </td>
    <td width="50%">
      <img src="docs/screenshots/board.png" alt="Доска Excalidraw" />
      <p align="center"><b>Доски</b><br/><sub>Совместный холст на Excalidraw внутри сервера</sub></p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="docs/screenshots/chat.png" alt="Текстовый чат" />
      <p align="center"><b>Текстовый чат</b><br/><sub>Сообщения в реальном времени с разделением по дням</sub></p>
    </td>
    <td width="50%">
      <img src="docs/screenshots/audio-settings.png" alt="Настройки голоса и звука" />
      <p align="center"><b>Голос и звук</b><br/><sub>Выбор устройств и громкость</sub></p>
    </td>
  </tr>
</table>

## 📦 Установка

Готовые сборки публикуются на странице [Releases](https://github.com/voice-chat-team/voice-chat-desktop/releases/latest):

| Платформа  | Файл                                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 🪟 Windows | установщик `.msi` / `.exe`                                                                                                        |
| 🤖 Android | [`voice-chat-android.apk`](https://github.com/voice-chat-team/voice-chat-desktop/releases/latest/download/voice-chat-android.apk) |
