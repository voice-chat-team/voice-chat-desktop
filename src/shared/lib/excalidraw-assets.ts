declare global {
  interface Window {
    EXCALIDRAW_ASSET_PATH?: string | string[];
  }
}

/**
 * Откуда Excalidraw берёт шрифты сцены. Файлы кладёт в public/
 * scripts/copy-excalidraw-assets.mjs; путь обязан совпадать с тем,
 * куда копирует скрипт.
 *
 * Без этой настройки пакет ходит за шрифтами на CDN, а CSP десктопной
 * оболочки (`font-src 'self'` в src-tauri/tauri.conf.json) такие запросы
 * блокирует — текст на доске молча рендерится системным шрифтом.
 */
const EXCALIDRAW_ASSET_PATH = "/excalidraw-assets/";

/**
 * Вызывать строго ДО первого импорта @excalidraw/excalidraw
 */
export const setExcalidrawAssetPath = () => {
  window.EXCALIDRAW_ASSET_PATH = EXCALIDRAW_ASSET_PATH;
};
