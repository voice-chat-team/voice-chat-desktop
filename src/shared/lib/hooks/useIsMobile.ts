import { useSyncExternalStore } from "react";

// Переключаемся по ширине экрана, а не по ОС: одно правило для телефона,
// планшета и узкого окна браузера при `npm run dev`. Десктопное окно Tauri
// сюда не попадает — у него minWidth 800.
const MOBILE_QUERY = "(max-width: 767px)";

const mediaQuery =
  typeof window !== "undefined" ? window.matchMedia(MOBILE_QUERY) : null;

const subscribe = (onChange: () => void) => {
  mediaQuery?.addEventListener("change", onChange);
  return () => mediaQuery?.removeEventListener("change", onChange);
};

const getSnapshot = () => mediaQuery?.matches ?? false;

export const useIsMobile = () =>
  useSyncExternalStore(subscribe, getSnapshot, () => false);
